#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'moneybot-official', 'data', 'games.manifest.json');
const catalogBase = path.join(root, 'moneybot-official');
const allowedStatuses = new Set(['flagship', 'verified', 'beta', 'labs', 'archived']);
const allowedVisibility = new Set(['public', 'hidden']);
const allowedDifficulty = new Set(['easy', 'medium', 'hard']);
const failures = [];
const warnings = [];

function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }
function exists(relativePath) { return fs.existsSync(path.resolve(catalogBase, relativePath)); }

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`FAIL: Could not read manifest: ${error.message}`);
  process.exit(1);
}

const homepage = fs.readFileSync(path.join(root, 'moneybot-official', 'index.html'), 'utf8');
if (!homepage.includes("fetch('data/games.manifest.json'")) fail('homepage must load the canonical manifest');
if (/const\s+games\s*=\s*\[/.test(homepage)) fail('homepage must not embed a second game catalog');

if (manifest.schemaVersion !== 1) fail('schemaVersion must be 1');
if (manifest.sourceOfTruth !== true) fail('sourceOfTruth must be true');
if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.updatedAt || '')) fail('updatedAt must use YYYY-MM-DD');
if (!Array.isArray(manifest.games) || !manifest.games.length) fail('games must be a non-empty array');

const seenIds = new Set();
const seenUrls = new Map();
const flagshipOrders = new Map();
for (const [index, game] of (manifest.games || []).entries()) {
  const label = game.id || `entry ${index}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(game.id || '')) fail(`${label}: id must use lowercase kebab-case`);
  for (const field of ['id', 'title', 'url', 'thumbnail', 'learningObjective', 'topic', 'difficulty', 'status', 'visibility', 'section', 'version', 'lastReviewed']) {
    if (typeof game[field] !== 'string' || !game[field].trim()) fail(`${label}: missing ${field}`);
  }
  if (!Array.isArray(game.genres) || !game.genres.length || game.genres.some(value => typeof value !== 'string' || !value)) fail(`${label}: genres must be a non-empty string array`);
  if (seenIds.has(game.id)) fail(`${label}: duplicate id`);
  seenIds.add(game.id);
  if (seenUrls.has(game.url)) warn(`${label}: shares URL with ${seenUrls.get(game.url)} (${game.url})`);
  seenUrls.set(game.url, label);
  if (!allowedStatuses.has(game.status)) fail(`${label}: invalid status ${game.status}`);
  if (!allowedVisibility.has(game.visibility)) fail(`${label}: invalid visibility ${game.visibility}`);
  if (!allowedDifficulty.has(game.difficulty)) fail(`${label}: invalid difficulty ${game.difficulty}`);
  if (!Number.isInteger(game.playtimeMinutes) || game.playtimeMinutes < 1 || game.playtimeMinutes > 60) fail(`${label}: playtimeMinutes must be an integer from 1 to 60`);
  if (!/^\d+\.\d+\.\d+$/.test(game.version || '')) fail(`${label}: version must use semver`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(game.lastReviewed || '')) fail(`${label}: lastReviewed must use YYYY-MM-DD`);

  if (game.visibility === 'public') {
    const gameTarget = path.resolve(catalogBase, game.url, 'index.html');
    const customTarget = path.resolve(catalogBase, game.url);
    if (!fs.existsSync(gameTarget) && !fs.existsSync(customTarget)) fail(`${label}: URL target does not exist (${game.url})`);
    if (!exists(game.thumbnail)) fail(`${label}: thumbnail does not exist (${game.thumbnail})`);
  }
  if (game.status === 'flagship') {
    if (!Number.isInteger(game.featuredOrder) || game.featuredOrder < 1) fail(`${label}: flagship requires a positive featuredOrder`);
    else if (flagshipOrders.has(game.featuredOrder)) fail(`${label}: featuredOrder duplicates ${flagshipOrders.get(game.featuredOrder)}`);
    else flagshipOrders.set(game.featuredOrder, label);
  } else if (game.featuredOrder !== null) {
    fail(`${label}: non-flagship featuredOrder must be null`);
  }
}

const publicGames = (manifest.games || []).filter(game => game.visibility === 'public' && !['labs', 'archived'].includes(game.status));
const flagships = publicGames.filter(game => game.status === 'flagship');
if (flagships.length < 5 || flagships.length > 12) warn(`Expected 5–12 flagships; found ${flagships.length}`);

console.log(`Manifest: ${manifest.games?.length || 0} games, ${publicGames.length} public, ${flagships.length} flagships`);
warnings.forEach(message => console.warn(`WARN: ${message}`));
if (failures.length) {
  failures.forEach(message => console.error(`FAIL: ${message}`));
  process.exit(1);
}
console.log('Manifest validation passed');
