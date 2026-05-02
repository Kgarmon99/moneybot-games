import { CONFIG } from './config.js';
import { BarterGame, MintingGame, PaperGame, DigitalGame, CommodityGame, GoldStandardGame } from './MiniGame.js';
import { TimelineFinale } from './Timeline.js';
import { StickerBook } from './StickerBook.js';

export class DialogSystem {
  constructor() {
    this.dialogBox = document.getElementById('dialog-box');
    this.nameText = document.getElementById('dialog-name');
    this.messageText = document.getElementById('dialog-text');
    this.promptText = document.getElementById('interaction-prompt');
    this.objectiveText = document.getElementById('objective');
    
    this.activeStory = null;
    this.currentMessageIdx = 0;
    this.isDialogActive = false;
    this.isPromptVisible = false;

    this.onDialogEnd = null;

    this.stickerBook = new StickerBook();

    this.barterGame = new BarterGame(() => {
        this.objectiveText.innerText = "VISIT COMMODITY TERMINAL";
        this.stickerBook.unlock('barter');
    });

    this.commodityGame = new CommodityGame(() => {
        this.objectiveText.innerText = "VISIT COIN TERMINAL";
        this.stickerBook.unlock('commodity');
    });

    this.mintingGame = new MintingGame(() => {
        this.objectiveText.innerText = "VISIT PAPER TERMINAL";
        this.stickerBook.unlock('coins');
    });

    this.paperGame = new PaperGame(() => {
        this.objectiveText.innerText = "VISIT GOLD TERMINAL";
        this.stickerBook.unlock('paper');
    });

    this.goldStandardGame = new GoldStandardGame(() => {
        this.objectiveText.innerText = "VISIT FUTURE TERMINAL";
        this.stickerBook.unlock('gold_standard');
    });

    this.digitalGame = new DigitalGame(() => {
        this.objectiveText.innerText = "ALL MISSIONS COMPLETE!";
        this.stickerBook.unlock('digital');
        setTimeout(() => this.timelineFinale.show(), 1000);
    });

    this.timelineFinale = new TimelineFinale();

    this.setupInput();
  }

  setupInput() {
    this.nextBtn = document.getElementById('dialog-next-btn');

    // CONTINUE button — use touchend for iOS reliability; click as desktop fallback
    if (this.nextBtn) {
      // touchend fires on iOS even inside pointer-events:none parents
      this.nextBtn.addEventListener('touchend', (e) => {
        e.preventDefault(); // stop 300ms ghost-click
        e.stopPropagation();
        if (this.isDialogActive) this.nextMessage();
      }, { passive: false });

      // click handles desktop + Android
      this.nextBtn.addEventListener('click', (e) => {
        if (this.isDialogActive) this.nextMessage();
      });
    }

    // Keyboard — Space bar as alternative on desktop
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isDialogActive) {
        e.preventDefault();
        this.nextMessage();
      }
    });

    // Update prompt text based on device
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prompt = document.getElementById('interaction-prompt');
    if (prompt && isMobile) prompt.textContent = 'TAP HERE TO INTERACT';
  }

  showPrompt(visible) {
    if (this.isPromptVisible === visible) return;
    this.isPromptVisible = visible;
    this.promptText.style.display = visible ? 'block' : 'none';
  }

  startStory(storyId, onEnd) {
    if (this.isDialogActive) return;

    const story = CONFIG.STORY.find(s => s.id === storyId);
    if (!story) return;

    this.activeStory = story;
    this.currentMessageIdx = 0;
    this.isDialogActive = true;
    this.onDialogEnd = onEnd;

    this.nameText.innerText = story.name;
    this.dialogBox.style.display = 'block';

    // Show the CONTINUE button whenever dialog is open
    if (this.nextBtn) this.nextBtn.style.display = 'block';

    this.updateMessage();
  }

  updateMessage() {
    const msg = this.activeStory.messages[this.currentMessageIdx];
    this.messageText.innerText = msg;
  }

  nextMessage() {
    this.currentMessageIdx++;
    if (this.currentMessageIdx < this.activeStory.messages.length) {
      this.updateMessage();
    } else {
      const storyId = this.activeStory.id;
      this.endStory();
      
      // Trigger mini-game if it's the barter terminal
      if (storyId === 'barter') {
        this.barterGame.show();
      } else if (storyId === 'commodity') {
        this.commodityGame.show();
      } else if (storyId === 'coins') {
        this.mintingGame.show();
      } else if (storyId === 'paper') {
        this.paperGame.show();
      } else if (storyId === 'gold_standard') {
        this.goldStandardGame.show();
      } else if (storyId === 'digital') {
        this.digitalGame.show();
      }
    }
  }

  endStory() {
    this.isDialogActive = false;
    this.dialogBox.style.display = 'none';
    // Hide the CONTINUE button when dialog closes
    if (this.nextBtn) this.nextBtn.style.display = 'none';
    this.activeStory = null;
    if (this.onDialogEnd) this.onDialogEnd();
  }
}