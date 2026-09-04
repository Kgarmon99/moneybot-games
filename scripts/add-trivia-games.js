#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'moneybot-official', 'data', 'games.manifest.json');
const sourcesPath = path.join(root, 'moneybot-official', 'data', 'thumbnail-sources.json');

const triviaGames = [
  {
    id: 'trivia-budgeting-basics',
    title: 'Budgeting Basics Trivia',
    url: '../trivia-budgeting-basics/',
    learningObjective: 'Test and reinforce core budgeting skills: income, expenses, tracking, and building a working budget.',
    topic: 'budgeting-and-saving',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  },
  {
    id: 'trivia-buying-car',
    title: 'Buying a Car Trivia',
    url: '../trivia-buying-car/',
    learningObjective: 'Learn the real costs of car ownership and how to make a smart vehicle purchase.',
    topic: 'life-and-money',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  },
  {
    id: 'trivia-credit-cards',
    title: 'Credit Card Trivia',
    url: '../trivia-credit-cards/',
    learningObjective: 'Understand credit card basics: interest, minimum payments, rewards, and responsible use.',
    topic: 'credit-and-debt',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  },
  {
    id: 'trivia-saving-college',
    title: 'Saving for College Trivia',
    url: '../trivia-saving-college/',
    learningObjective: 'Explore ways to save and pay for higher education without crushing debt.',
    topic: 'saving-and-goals',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  },
  {
    id: 'trivia-saving-master',
    title: 'Saving Master Trivia',
    url: '../trivia-saving-master/',
    learningObjective: 'Build strong saving habits and learn when and where to stash your cash.',
    topic: 'saving-and-goals',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  },
  {
    id: 'trivia-savvy-shopper',
    title: 'Savvy Shopper Trivia',
    url: '../trivia-savvy-shopper/',
    learningObjective: 'Practice spotting deals, avoiding impulse buys, and getting the most value for your money.',
    topic: 'spending-smart',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  },
  {
    id: 'trivia-scam-awareness',
    title: 'Scam Awareness Trivia',
    url: '../trivia-scam-awareness/',
    learningObjective: 'Recognize common financial scams and learn how to protect your money and identity.',
    topic: 'fraud-and-safety',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  },
  {
    id: 'trivia-understanding-interest',
    title: 'Understanding Interest Trivia',
    url: '../trivia-understanding-interest/',
    learningObjective: 'Master how interest works for you when saving and against you when borrowing.',
    topic: 'credit-and-debt',
    genres: ['trivia', 'education', 'quiz'],
    difficulty: 'easy',
    playtimeMinutes: 3,
    status: 'beta',
    visibility: 'public',
    section: 'all',
    featuredOrder: null,
    version: '1.0.0',
    lastReviewed: '2026-09-04'
  }
];

// Add placeholder thumbnail field so the generator can rewrite it.
const gamesWithThumbs = triviaGames.map(g => ({
  ...g,
  thumbnail: 'assets/thumbs-signal/placeholder.webp'
}));

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const existingIds = new Set(manifest.games.map(g => g.id));
const added = [];
for (const game of gamesWithThumbs) {
  if (existingIds.has(game.id)) {
    console.log(`Skipping existing: ${game.id}`);
    continue;
  }
  manifest.games.push(game);
  added.push(game.id);
}
manifest.updatedAt = '2026-09-04';
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Added ${added.length} trivia games to manifest.`);

const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
for (const id of added) {
  if (!sources[id]) {
    sources[id] = 'assets/moneybot-logo-1.jpg';
  }
}
fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2) + '\n');
console.log(`Updated thumbnail-sources.json for ${added.length} games.`);
