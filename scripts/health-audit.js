#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'moneybot-official', 'data', 'games.manifest.json');
const catalogBase = path.join(root, 'moneybot-official');
const outputDir = path.join(root, 'reports', 'health-audit');
const reportJsonPath = path.join(outputDir, 'latest.json');
const reportMarkdownPath = path.join(outputDir, 'latest.md');
const port = Number(process.env.PORT || 4178);
const baseUrl = process.env.BASE_URL || `http://127.0.0.1:${port}`;
const concurrency = Math.max(1, Number(process.env.AUDIT_CONCURRENCY || 4));
const navigationTimeout = Math.max(1000, Number(process.env.AUDIT_TIMEOUT_MS || 10000));
const limit = Math.max(0, Number(process.env.AUDIT_LIMIT || 0));
const ignoredRequestPatterns = [/\/api\/sponsors\//];

function loadCatalog() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest.games
    .filter(game => game.visibility === 'public' && !['labs', 'archived'].includes(game.status))
    .map(game => ({
      ...game,
      thumb: game.thumbnail,
      tags: game.genres,
      diff: game.difficulty,
      customUrl: true
    }));
}

function walkFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(full));
    else files.push(full);
  }
  return files;
}

function inspectStatic(game) {
  const target = path.resolve(catalogBase, game.url);
  const targetStat = fs.statSync(target, { throwIfNoEntry: false });
  const entry = targetStat?.isDirectory() ? path.join(target, 'index.html') : target;
  const gameDir = targetStat?.isDirectory() ? target : path.dirname(target);
  const files = walkFiles(gameDir);
  const sourceFiles = files.filter(file => /\.(?:html?|css|js|mjs)$/i.test(file));
  const source = sourceFiles.map(file => {
    try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
  }).join('\n');
  const bytes = files.reduce((total, file) => {
    try { return total + fs.statSync(file).size; } catch { return total; }
  }, 0);

  return {
    entryExists: fs.existsSync(entry),
    fileCount: files.length,
    bytes,
    hasBrandKit: /moneybot-game\.css|MoneyBotGameKit/.test(source),
    hasOfficialAvatar: /moneybot-logo-avatar\.png/.test(source),
    usesDeprecatedMascot: /moneybot-(?:idle|celebrating|driving)\.svg/.test(source),
    usesEmoji: /[\u{1F300}-\u{1FAFF}]/u.test(source),
    hasReducedMotion: /prefers-reduced-motion/.test(source),
    hasKeyboardHandling: /keydown|keyup|KeyboardEvent/.test(source),
    hasPauseSignal: /\bpause(?:d)?\b/i.test(source),
    hasRestartSignal: /\brestart\b|play again|try again/i.test(source),
    hasEducationalSignal: /learn|lesson|tip|takeaway|financial|money concept/i.test(source)
  };
}

function gameUrl(game) {
  return new URL(game.url, `${baseUrl}/moneybot-official/`).href;
}

async function startServer() {
  if (process.env.BASE_URL) return null;
  const { spawn } = require('child_process');
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: root,
    stdio: 'ignore'
  });
  await new Promise(resolve => setTimeout(resolve, 800));
  return server;
}

async function inspectRuntime(browser, game) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  const started = Date.now();
  try {
    const response = await page.goto(gameUrl(game), { waitUntil: 'domcontentloaded', timeout: navigationTimeout });
    await page.waitForTimeout(250);
    const metrics = await page.evaluate(() => ({
      title: document.title,
      bodyTextLength: (document.body?.innerText || '').trim().length,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      viewportWidth: document.documentElement.clientWidth,
      interactiveCount: document.querySelectorAll('button, a, input, select, textarea, [role="button"], canvas').length,
      canvasCount: document.querySelectorAll('canvas').length
    }));
    const uniqueFailedRequests = [...new Set(failedRequests)].slice(0, 10);
    const ignoredFailedRequests = uniqueFailedRequests.filter(item => ignoredRequestPatterns.some(pattern => pattern.test(item)));
    const actionableFailedRequests = uniqueFailedRequests.filter(item => !ignoredFailedRequests.includes(item));
    const uniqueConsoleErrors = [...new Set(consoleErrors)].slice(0, 10);
    const actionableConsoleErrors = actionableFailedRequests.length || pageErrors.length
      ? uniqueConsoleErrors
      : uniqueConsoleErrors.filter(message => !/^Failed to load resource:/.test(message));
    return {
      loaded: Boolean(response && response.ok()),
      status: response?.status() || null,
      durationMs: Date.now() - started,
      ...metrics,
      consoleErrors: actionableConsoleErrors,
      pageErrors: [...new Set(pageErrors)].slice(0, 10),
      failedRequests: actionableFailedRequests,
      ignoredFailedRequests
    };
  } catch (error) {
    return {
      loaded: false,
      status: null,
      durationMs: Date.now() - started,
      error: error.message,
      consoleErrors: [...new Set(consoleErrors)].slice(0, 10),
      pageErrors: [...new Set(pageErrors)].slice(0, 10),
      failedRequests: [...new Set(failedRequests)].filter(item => !ignoredRequestPatterns.some(pattern => pattern.test(item))).slice(0, 10),
      ignoredFailedRequests: [...new Set(failedRequests)].filter(item => ignoredRequestPatterns.some(pattern => pattern.test(item))).slice(0, 10)
    };
  } finally {
    await page.close();
  }
}

async function mapConcurrent(items, worker, count) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
      process.stdout.write(`\rRuntime checks: ${index + 1}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(count, items.length) }, run));
  process.stdout.write('\n');
  return results;
}

function summarize(results) {
  const count = predicate => results.filter(predicate).length;
  return {
    games: results.length,
    loaded: count(result => result.runtime.loaded),
    failedToLoad: count(result => !result.runtime.loaded),
    withConsoleOrPageErrors: count(result => result.runtime.consoleErrors.length || result.runtime.pageErrors.length),
    withFailedRequests: count(result => result.runtime.failedRequests.length),
    withIgnoredEnvironmentRequests: count(result => result.runtime.ignoredFailedRequests?.length),
    withHorizontalOverflow: count(result => result.runtime.horizontalOverflow),
    missingEntryPoint: count(result => !result.static.entryExists),
    withBrandKit: count(result => result.static.hasBrandKit),
    withOfficialAvatar: count(result => result.static.hasOfficialAvatar),
    withDeprecatedMascot: count(result => result.static.usesDeprecatedMascot),
    withReducedMotion: count(result => result.static.hasReducedMotion),
    withKeyboardHandling: count(result => result.static.hasKeyboardHandling),
    withPauseSignal: count(result => result.static.hasPauseSignal),
    withRestartSignal: count(result => result.static.hasRestartSignal),
    totalGameBytes: results.reduce((sum, result) => sum + result.static.bytes, 0)
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function markdown(report) {
  const s = report.summary;
  const failures = report.results.filter(result => !result.runtime.loaded || result.runtime.pageErrors.length || result.runtime.consoleErrors.length || result.runtime.failedRequests.length);
  const rows = failures.map(result => {
    const issues = [];
    if (!result.runtime.loaded) issues.push(`load failed${result.runtime.status ? ` (${result.runtime.status})` : ''}`);
    if (result.runtime.pageErrors.length) issues.push(`${result.runtime.pageErrors.length} page error(s)`);
    if (result.runtime.consoleErrors.length) issues.push(`${result.runtime.consoleErrors.length} console error(s)`);
    if (result.runtime.failedRequests.length) issues.push(`${result.runtime.failedRequests.length} failed request(s)`);
    return `| ${result.game.title || result.game.id} | \`${result.game.id}\` | ${issues.join(', ')} |`;
  });
  return `# MoneyBot Games Health Audit\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n- Catalog games checked: **${s.games}**\n- Loaded successfully: **${s.loaded}**\n- Failed to load: **${s.failedToLoad}**\n- Console/page errors: **${s.withConsoleOrPageErrors}**\n- Failed asset requests: **${s.withFailedRequests}**\n- Ignored environment-injected sponsor requests: **${s.withIgnoredEnvironmentRequests}**\n- Mobile horizontal overflow: **${s.withHorizontalOverflow}**\n- Missing entry points: **${s.missingEntryPoint}**\n- Shared brand kit detected: **${s.withBrandKit}**\n- Official avatar detected: **${s.withOfficialAvatar}**\n- Deprecated mascot detected: **${s.withDeprecatedMascot}**\n- Reduced-motion support detected: **${s.withReducedMotion}**\n- Keyboard handling detected: **${s.withKeyboardHandling}**\n- Pause state signal detected: **${s.withPauseSignal}**\n- Restart state signal detected: **${s.withRestartSignal}**\n- Total catalog game payload on disk: **${formatBytes(s.totalGameBytes)}**\n\n## Runtime Failures and Errors\n\n${rows.length ? `| Game | ID | Issues |\n|---|---|---|\n${rows.join('\n')}` : 'No runtime failures or errors detected.'}\n\n## Method\n\nEach catalog entry was loaded at a 390×844 viewport with reduced motion enabled. The audit records HTTP status, uncaught JavaScript errors, console errors, failed requests, horizontal overflow, basic interaction signals, payload size, and MoneyBot brand/accessibility markers. Static signals are triage indicators, not final Elite scores.\n`;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const catalog = loadCatalog();
  const selected = limit ? catalog.slice(0, limit) : catalog;
  const staticResults = selected.map(game => ({ game, static: inspectStatic(game) }));
  const server = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const runtimeResults = await mapConcurrent(staticResults, item => inspectRuntime(browser, item.game), concurrency);
    const results = staticResults.map((item, index) => ({ ...item, runtime: runtimeResults[index] }));
    const report = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      viewport: { width: 390, height: 844 },
      summary: summarize(results),
      results
    };
    fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(reportMarkdownPath, markdown(report));
    console.log(`Wrote ${path.relative(root, reportJsonPath)}`);
    console.log(`Wrote ${path.relative(root, reportMarkdownPath)}`);
    if (report.summary.failedToLoad || report.summary.withConsoleOrPageErrors || report.summary.withFailedRequests) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
