class ScoreManager {
  constructor(maxObjects = 20) {
    this.score = 0;
    this.objectsCollected = 0;
    this.maxObjects = maxObjects;
    this.scorePerObject = 10;
    this.overlayElement = null;
    this.createScoreDisplay();
  }

  createScoreDisplay() {
    // score overlay - top-left
    // add the styles 
    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'scoreOverlay';
    this.overlayElement.className = 'score-overlay';
    this.overlayElement.innerHTML = `
      <div class="score-container">
        <div class="score-title">COLLECTION</div>
        <div class="score-value" id="scoreValue">0</div>
        <div class="score-progress">
          <span id="objectCount">0</span> / <span id="maxObjects">${this.maxObjects}</span> objects
        </div>
        <div class="score-bar">
          <div class="score-bar-fill" id="scoreBarFill" style="width: 0%"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.overlayElement);
  }

  collectObject() {
    if (this.objectsCollected >= this.maxObjects) {
      console.log('Maximum objects collected!');
      return false;
    }

    this.objectsCollected++;
    this.score += this.scorePerObject;
    this.updateDisplay();

    // Check if collection complete
    if (this.objectsCollected >= this.maxObjects) {
      this.onCollectionComplete();
    }

    return true;
  }

  returnObject() {
    if (this.objectsCollected <= 0) return;

    this.objectsCollected--;
    this.score -= this.scorePerObject;
    if (this.score < 0) this.score = 0;
    
    this.updateDisplay();
  }

  updateDisplay() {
    const scoreValueEl = document.getElementById('scoreValue');
    const objectCountEl = document.getElementById('objectCount');
    const scoreBarFill = document.getElementById('scoreBarFill');

    if (scoreValueEl) {
      scoreValueEl.textContent = this.score;
      // Add pulse animation
      scoreValueEl.classList.add('pulse');
      setTimeout(() => scoreValueEl.classList.remove('pulse'), 300);
    }

    if (objectCountEl) {
      objectCountEl.textContent = this.objectsCollected;
    }

    if (scoreBarFill) {
      const percentage = (this.objectsCollected / this.maxObjects) * 100;
      scoreBarFill.style.width = `${percentage}%`;
      
      // Change color based on progress
      if (percentage >= 100) {
        scoreBarFill.style.background = '#2ECC71'; // Green
      } else if (percentage >= 75) {
        scoreBarFill.style.background = '#F39C12'; // Orange
      } else {
        scoreBarFill.style.background = '#3498DB'; // Blue
      }
    }
  }

  onCollectionComplete() {
    console.log('⚡ Collection Complete! All 20 energy cores collected!');

    // Play success sound
    if (window.soundEffects) {
      window.soundEffects.playSuccess();
    }

    // Show the permanent completion overlay
    const completionOverlay = document.getElementById('completionOverlay');
    if (completionOverlay) {
      setTimeout(() => {
        completionOverlay.classList.add('visible');
        console.log('✅ Completion overlay displayed');
      }, 500);
    } else {
      console.error('❌ Completion overlay element not found!');
    }
  }

  getScore() {
    return this.score;
  }

  getProgress() {
    return {
      collected: this.objectsCollected,
      max: this.maxObjects,
      percentage: (this.objectsCollected / this.maxObjects) * 100
    };
  }

  reset() {
    this.score = 0;
    this.objectsCollected = 0;
    this.updateDisplay();
  }

  setVisible(visible) {
    if (this.overlayElement) {
      this.overlayElement.style.display = visible ? 'block' : 'none';
    }
  }
}