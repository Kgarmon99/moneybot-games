// Stub for missing MiniGame.js module
// Preserves imports so History of Money loads; mini-games are no-ops until implemented.

export class BarterGame {
  constructor(onComplete) { this.onComplete = onComplete; }
  start() { if (typeof this.onComplete === 'function') this.onComplete(); }
}

export class CommodityGame {
  constructor(onComplete) { this.onComplete = onComplete; }
  start() { if (typeof this.onComplete === 'function') this.onComplete(); }
}

export class GoldStandardGame {
  constructor(onComplete) { this.onComplete = onComplete; }
  start() { if (typeof this.onComplete === 'function') this.onComplete(); }
}

export class PaperGame {
  constructor(onComplete) { this.onComplete = onComplete; }
  start() { if (typeof this.onComplete === 'function') this.onComplete(); }
}

export class DigitalGame {
  constructor(onComplete) { this.onComplete = onComplete; }
  start() { if (typeof this.onComplete === 'function') this.onComplete(); }
}

export class MintingGame {
  constructor(onComplete) { this.onComplete = onComplete; }
  start() { if (typeof this.onComplete === 'function') this.onComplete(); }
}
