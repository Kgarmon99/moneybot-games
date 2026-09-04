// Stub for missing StickerBook.js module
export class StickerBook {
  constructor() {
    this.unlocked = new Set();
  }
  unlock(id) {
    this.unlocked.add(id);
  }
  isUnlocked(id) {
    return this.unlocked.has(id);
  }
}
