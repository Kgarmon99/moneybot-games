/**
 * MoneyBot Drag & Drop Game Engine
 * Shared logic for categorization games
 */

class MoneyBotGame {
  constructor(config) {
    this.config = {
      categories: [],
      items: [],
      gameTitle: 'MoneyBot Game',
      instructions: 'Drag items to the correct categories.',
      ...config
    };
    
    this.state = {
      score: 0,
      correct: 0,
      incorrect: 0,
      placed: new Set(),
      currentItem: null,
      gameComplete: false
    };
    
    this.touch = {
      active: false,
      item: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      clone: null,
      offsetX: 0,
      offsetY: 0
    };
    
    this.init();
  }
  
  init() {
    this.renderStartScreen();
    this.renderGame();
    this.attachEventListeners();
  }
  
  renderStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.className = 'start-screen';
    startScreen.id = 'startScreen';
    startScreen.innerHTML = `
      <div class="start-logo">🧩</div>
      <h1 class="start-title">${this.config.gameTitle}</h1>
      <p class="start-subtitle">${this.config.instructions}</p>
      <div class="start-instructions">
        <h3>How to Play</h3>
        <ul>
          <li>Drag each item to the correct category</li>
          <li>Learn from the feedback</li>
          <li>Get all items right to win!</li>
        </ul>
      </div>
      <button class="btn btn-primary" id="startBtn">Start Game</button>
    `;
    document.body.appendChild(startScreen);
  }
  
  renderGame() {
    const container = document.createElement('div');
    container.className = 'game-container';
    container.id = 'gameContainer';
    container.style.display = 'none';
    
    // Header
    const header = document.createElement('div');
    header.className = 'game-header';
    header.innerHTML = `
      <div class="game-title">${this.config.gameTitle}</div>
      <div class="score-display">
        <div class="score-pill">
          <span class="label">Score</span>
          <span class="value" id="scoreValue">0</span>
        </div>
        <div class="score-pill">
          <span class="label">Items</span>
          <span class="value" id="itemsValue">0/${this.config.items.length}</span>
        </div>
      </div>
    `;
    container.appendChild(header);
    
    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'progress-container';
    progress.innerHTML = '<div class="progress-bar" id="progressBar" style="width: 0%"></div>';
    container.appendChild(progress);
    
    // Drop zones
    const dropZonesContainer = document.createElement('div');
    dropZonesContainer.className = `drop-zones ${this.config.categories.length === 2 ? 'two-col' : 'three-col'}`;
    dropZonesContainer.id = 'dropZones';
    
    this.config.categories.forEach(cat => {
      const zone = document.createElement('div');
      zone.className = 'drop-zone';
      zone.dataset.category = cat.id;
      zone.innerHTML = `
        <div class="drop-zone-title">${cat.name}</div>
        <div class="drop-zone-hint">${cat.hint}</div>
        <div class="drop-zone-items"></div>
      `;
      dropZonesContainer.appendChild(zone);
    });
    container.appendChild(dropZonesContainer);
    
    // Feedback area
    const feedback = document.createElement('div');
    feedback.className = 'feedback-area';
    feedback.id = 'feedbackArea';
    feedback.innerHTML = `
      <div class="feedback-title" id="feedbackTitle"></div>
      <div class="feedback-text" id="feedbackText"></div>
    `;
    container.appendChild(feedback);
    
    // Items pool
    const itemsPool = document.createElement('div');
    itemsPool.className = 'items-pool';
    itemsPool.innerHTML = `
      <div class="items-pool-title">Drag these items:</div>
      <div class="items-container" id="itemsContainer"></div>
    `;
    container.appendChild(itemsPool);
    
    // Modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'gameModal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-icon" id="modalIcon">🏆</div>
        <div class="modal-title" id="modalTitle">Game Complete!</div>
        <div class="modal-subtitle" id="modalSubtitle">Great job sorting!</div>
        <div class="modal-score" id="modalScore">0</div>
        <div class="modal-score-label">Final Score</div>
        <button class="btn btn-primary" id="restartBtn">Play Again</button>
        <a href="../index.html" class="btn btn-secondary">Back to Games</a>
      </div>
    `;
    container.appendChild(modal);
    
    document.body.appendChild(container);
  }
  
  attachEventListeners() {
    // Start button
    document.getElementById('startBtn').addEventListener('click', () => {
      document.getElementById('startScreen').classList.add('hidden');
      document.getElementById('gameContainer').style.display = 'flex';
      this.renderItems();
    });
    
    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
      this.resetGame();
    });
    
    // Drag and drop events on drop zones
    const zones = document.querySelectorAll('.drop-zone');
    zones.forEach(zone => {
      zone.addEventListener('dragover', (e) => this.handleDragOver(e));
      zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      zone.addEventListener('drop', (e) => this.handleDrop(e));
    });
    
    // Touch events for mobile
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    document.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
  }
  
  renderItems() {
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    
    // Shuffle items
    const shuffled = [...this.config.items].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(item => {
      if (this.state.placed.has(item.id)) return;
      
      const el = document.createElement('div');
      el.className = 'draggable-item';
      el.draggable = true;
      el.dataset.id = item.id;
      el.textContent = item.name;
      
      // Mouse drag events
      el.addEventListener('dragstart', (e) => this.handleDragStart(e, item));
      el.addEventListener('dragend', (e) => this.handleDragEnd(e));
      
      // Touch events
      el.addEventListener('touchstart', (e) => this.handleTouchStart(e, item), { passive: false });
      
      container.appendChild(el);
    });
  }
  
  handleDragStart(e, item) {
    this.state.currentItem = item;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  }
  
  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }
  
  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }
  
  handleDrop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove('drag-over');
    
    const itemId = e.dataTransfer.getData('text/plain');
    const item = this.config.items.find(i => i.id === itemId);
    
    if (item && !this.state.placed.has(itemId)) {
      this.processDrop(item, zone.dataset.category, zone);
    }
  }
  
  // Touch handling
  handleTouchStart(e, item) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = e.currentTarget;
    
    this.touch.active = true;
    this.touch.item = item;
    this.touch.startX = touch.clientX;
    this.touch.startY = touch.clientY;
    this.touch.currentX = touch.clientX;
    this.touch.currentY = touch.clientY;
    
    // Create clone for visual feedback
    const rect = target.getBoundingClientRect();
    this.touch.offsetX = touch.clientX - rect.left;
    this.touch.offsetY = touch.clientY - rect.top;
    
    this.touch.clone = target.cloneNode(true);
    this.touch.clone.style.position = 'fixed';
    this.touch.clone.style.left = rect.left + 'px';
    this.touch.clone.style.top = rect.top + 'px';
    this.touch.clone.style.width = rect.width + 'px';
    this.touch.clone.style.zIndex = '10000';
    this.touch.clone.style.pointerEvents = 'none';
    this.touch.clone.classList.add('dragging');
    document.body.appendChild(this.touch.clone);
    
    target.style.opacity = '0.3';
    this.touch.originalElement = target;
  }
  
  handleTouchMove(e) {
    if (!this.touch.active) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    this.touch.currentX = touch.clientX;
    this.touch.currentY = touch.clientY;
    
    if (this.touch.clone) {
      this.touch.clone.style.left = (touch.clientX - this.touch.offsetX) + 'px';
      this.touch.clone.style.top = (touch.clientY - this.touch.offsetY) + 'px';
    }
    
    // Highlight drop zone under finger
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = elementBelow?.closest('.drop-zone');
    
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    if (zone) zone.classList.add('drag-over');
  }
  
  handleTouchEnd(e) {
    if (!this.touch.active) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = elementBelow?.closest('.drop-zone');
    
    if (this.touch.clone) {
      this.touch.clone.remove();
      this.touch.clone = null;
    }
    
    if (this.touch.originalElement) {
      this.touch.originalElement.style.opacity = '1';
    }
    
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    
    if (zone && this.touch.item) {
      this.processDrop(this.touch.item, zone.dataset.category, zone);
    }
    
    this.touch.active = false;
    this.touch.item = null;
    this.touch.originalElement = null;
  }
  
  processDrop(item, categoryId, zone) {
    const isCorrect = item.category === categoryId;
    
    // Mark as placed
    this.state.placed.add(item.id);
    
    // Update score
    if (isCorrect) {
      this.state.correct++;
      this.state.score += 100;
      zone.classList.add('correct');
      setTimeout(() => zone.classList.remove('correct'), 400);
    } else {
      this.state.incorrect++;
      zone.classList.add('incorrect');
      setTimeout(() => zone.classList.remove('incorrect'), 400);
    }
    
    // Add item to zone
    const zoneItems = zone.querySelector('.drop-zone-items');
    const itemEl = document.createElement('div');
    itemEl.className = `draggable-item placed ${isCorrect ? '' : 'incorrect-item'}`;
    itemEl.textContent = item.name;
    zoneItems.appendChild(itemEl);
    
    // Remove from pool
    const poolItem = document.querySelector(`.draggable-item[data-id="${item.id}"]`);
    if (poolItem) poolItem.remove();
    
    // Show feedback
    this.showFeedback(item, isCorrect);
    
    // Update UI
    this.updateUI();
    
    // Check completion
    if (this.state.placed.size === this.config.items.length) {
      setTimeout(() => this.showCompletion(), 600);
    }
  }
  
  showFeedback(item, isCorrect) {
    const feedback = document.getElementById('feedbackArea');
    const title = document.getElementById('feedbackTitle');
    const text = document.getElementById('feedbackText');
    
    feedback.className = 'feedback-area show ' + (isCorrect ? 'correct' : 'incorrect');
    title.textContent = isCorrect ? '✓ Correct!' : '✗ Not quite';
    text.textContent = item.explanation;
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      feedback.classList.remove('show');
    }, 4000);
  }
  
  updateUI() {
    document.getElementById('scoreValue').textContent = this.state.score;
    document.getElementById('itemsValue').textContent = `${this.state.placed.size}/${this.config.items.length}`;
    
    const progress = (this.state.placed.size / this.config.items.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
  }
  
  showCompletion() {
    const modal = document.getElementById('gameModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const subtitle = document.getElementById('modalSubtitle');
    const score = document.getElementById('modalScore');
    
    const accuracy = this.state.correct / this.config.items.length;
    
    if (accuracy === 1) {
      icon.textContent = '🏆';
      title.textContent = 'Perfect Score!';
      subtitle.textContent = 'You nailed every category!';
    } else if (accuracy >= 0.7) {
      icon.textContent = '⭐';
      title.textContent = 'Great Job!';
      subtitle.textContent = `You got ${this.state.correct} out of ${this.config.items.length} correct.`;
    } else {
      icon.textContent = '📚';
      title.textContent = 'Good Effort!';
      subtitle.textContent = `You got ${this.state.correct} out of ${this.config.items.length} correct. Keep learning!`;
    }
    
    score.textContent = this.state.score;
    modal.classList.add('show');
  }
  
  resetGame() {
    this.state = {
      score: 0,
      correct: 0,
      incorrect: 0,
      placed: new Set(),
      currentItem: null,
      gameComplete: false
    };
    
    document.getElementById('gameModal').classList.remove('show');
    document.getElementById('feedbackArea').classList.remove('show');
    document.querySelectorAll('.drop-zone-items').forEach(el => el.innerHTML = '');
    
    this.updateUI();
    this.renderItems();
  }
}

// Export for use in game files
window.MoneyBotGame = MoneyBotGame;