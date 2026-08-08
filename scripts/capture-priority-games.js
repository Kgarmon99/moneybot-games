#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'reports', 'priority-screenshots');
const port = Number(process.env.PORT || 4179);
const baseUrl = process.env.BASE_URL || `http://127.0.0.1:${port}`;
const priorityGames = [
  'fraud-or-nah',
  'capital-command',
  'cashflow-cruiser',
  'bot-crypto-trading',
  'bot-ecommerce-empire',
  'bot-property-flipper',
  'bot-compound-climb',
  'bot-smart-borrower',
  'bot-money-surfers-new',
  'bot-debt-trap'
];

async function run() {
  fs.mkdirSync(outputDir, { recursive: true });
  const server = process.env.BASE_URL ? null : spawn(
    'python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
    { cwd: root, stdio: 'ignore' }
  );
  if (server) await new Promise(resolve => setTimeout(resolve, 800));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];
  try {
    for (const id of priorityGames) {
      const entry = path.join(root, id, 'index.html');
      if (!fs.existsSync(entry)) {
        results.push({ id, status: 'missing-entry' });
        continue;
      }
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        const response = await page.goto(`${baseUrl}/${id}/index.html`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(500);
        const output = path.join(outputDir, `${id}.png`);
        await page.screenshot({ path: output, fullPage: false });
        results.push({ id, status: response?.ok() ? 'captured' : `http-${response?.status()}`, screenshot: path.relative(root, output), errors });
        console.log(`Captured ${id}`);
      } catch (error) {
        results.push({ id, status: 'failed', error: error.message, errors });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), viewport: '390x844', results }, null, 2)}\n`);
  if (results.some(result => result.status !== 'captured')) process.exitCode = 1;
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
