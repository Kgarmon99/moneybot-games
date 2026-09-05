#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'moneybot-official/data/games.manifest.json'), 'utf8'));
const flagships = manifest.games.filter(g => g.status === 'flagship');
const baseUrl = 'https://kgarmon99.github.io/moneybot-games';
const port = 41980;

function exists(rel) {
  if (!rel) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(rel)) {
    return null; // external
  }
  const clean = rel.split('?')[0].split('#')[0];
  const abs = path.join(root, clean);
  return fs.existsSync(abs);
}

function staticAudit(game) {
  const dir = path.join(root, game.url.replace(/^\.\.\//, ''));
  const entry = path.join(dir, 'index.html');
  if (!fs.existsSync(entry)) return { entryExists: false };
  const html = fs.readFileSync(entry, 'utf8');
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : '';
  const getMeta = name => {
    const m = head.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'));
    return m ? m[1] : '';
  };
  const getLink = rel => {
    const m = head.match(new RegExp(`<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']`, 'i'));
    return m ? m[1] : '';
  };
  const titleMatch = head.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
  const viewportMatch = head.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']+)["']/i);
  const viewport = viewportMatch ? viewportMatch[1] : '';

  // Check asset refs in whole body (img src, script src, link href)
  const refs = [];
  const imgRefs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  const scriptRefs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  const linkRefs = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
  const bgRefs = [...html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)].map(m => m[1]);
  for (const ref of [...imgRefs, ...scriptRefs, ...linkRefs, ...bgRefs]) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref)) { refs.push({ ref, resolved: 'external', exists: true }); continue; }
    const rel = path.relative(root, path.resolve(dir, ref));
    const ext = exists(rel);
    refs.push({ ref, resolved: rel, exists: ext });
  }
  const brokenLocal = refs.filter(r => r.exists === false);

  return {
    entryExists: true,
    title,
    description: getMeta('description'),
    viewport,
    themeColor: getMeta('theme-color'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    ogUrl: getMeta('og:url'),
    twitterCard: getMeta('twitter:card'),
    twitterTitle: getMeta('twitter:title'),
    twitterImage: getMeta('twitter:image'),
    canonical: getLink('canonical'),
    assetRefs: refs.length,
    brokenLocal,
    usesBrandKit: /moneybot-game\.css/i.test(html),
    usesOfficialAvatar: /moneybot-logo-avatar\.png/i.test(html),
    hasSplashOrLoader: /splash|loader|loading/i.test(html)
  };
}

async function runtimeAudit(browser, game) {
  const dir = game.url.replace(/^\.\.\//, '').replace(/\/$/, '');
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  const pageErrors = [];
  const failed = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('requestfailed', r => failed.push(`${r.url()} :: ${r.failure()?.errorText || 'failed'}`));
  try {
    await page.goto(`http://127.0.0.1:${port}/${dir}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(400);
    const metrics = await page.evaluate(() => ({
      title: document.title,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      viewportWidth: document.documentElement.clientWidth,
      bodyText: (document.body.innerText || '').trim().slice(0, 120)
    }));
    return {
      loaded: true,
      ...metrics,
      consoleErrors: [...new Set(consoleErrors)].slice(0, 8),
      pageErrors: [...new Set(pageErrors)].slice(0, 8),
      failedRequests: [...new Set(failed)].slice(0, 8)
    };
  } catch (error) {
    return { loaded: false, error: error.message, consoleErrors, pageErrors, failedRequests: failed };
  } finally {
    await page.close();
  }
}

(async () => {
  const { spawn } = require('child_process');
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const results = [];
    for (const game of flagships) {
      const staticResult = staticAudit(game);
      const runtime = await runtimeAudit(browser, game);
      results.push({ game, static: staticResult, runtime });
      process.stdout.write(`\rAudited ${results.length}/${flagships.length}`);
    }
    console.log('');

    const reportPath = path.join(root, 'reports', 'health-audit', 'flagship-meta.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), results }, null, 2));
    console.log(`Wrote ${reportPath}`);

    // summary table
    console.log('\n=== Static Meta / Assets Summary ===');
    console.log('Game|title|desc|viewport|theme|og|twitter|brand|avatar|broken|overflow|errors');
    for (const r of results) {
      const s = r.static;
      console.log([r.game.id, s.title?'Y':'N', s.description?'Y':'N', s.viewport?'Y':'N', s.themeColor?'Y':'N', s.ogTitle?'Y':'N', s.twitterCard?'Y':'N', s.usesBrandKit?'Y':'N', s.usesOfficialAvatar?'Y':'N', s.brokenLocal.length, r.runtime.horizontalOverflow?'Y':'N', (r.runtime.pageErrors.length+r.runtime.consoleErrors.length)].join('|'));
    }
    const broken = results.filter(r => r.static.brokenLocal.length);
    if (broken.length) {
      console.log('\n=== Broken local asset refs ===');
      for (const r of broken) {
        for (const b of r.static.brokenLocal) console.log(`${r.game.id}: ${b.ref} -> ${b.resolved}`);
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }
})().catch(e => { console.error(e); process.exit(1); });
