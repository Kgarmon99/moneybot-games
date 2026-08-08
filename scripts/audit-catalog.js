#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'moneybot-official', 'data', 'games.manifest.json');
const catalogBase = path.join(root, 'moneybot-official');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const games = manifest.games.filter(game => game.visibility === 'public' && !['labs', 'archived'].includes(game.status));
const failures = [];
const seen = new Set();

for (const game of games) {
  if (seen.has(game.id)) failures.push(`Duplicate catalog id: ${game.id}`);
  seen.add(game.id);
  const target = path.resolve(catalogBase, game.url);
  const entry = fs.statSync(target, { throwIfNoEntry: false })?.isDirectory() ? path.join(target, 'index.html') : target;
  if (!fs.existsSync(entry)) failures.push(`Missing game entry point: ${game.id} (${game.url})`);
  const thumbnail = path.resolve(catalogBase, game.thumbnail);
  if (!fs.existsSync(thumbnail)) failures.push(`Missing thumbnail for ${game.id}: ${game.thumbnail}`);
}

console.log(`Catalog: ${games.length} public entries, ${seen.size} unique ids`);
if (failures.length) {
  failures.forEach(message => console.error(`FAIL: ${message}`));
  process.exitCode = 1;
} else {
  console.log('Catalog audit passed');
}
