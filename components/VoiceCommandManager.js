class VoiceCommandManager {
  constructor() {
    this.speechRec = null;
    this.isActive = false;
    this.lastCommand = '';
    this.commandCallbacks = {};
    this.indicatorElement = null;
    this.statusElement = null;
    this.commandElement = null;
    this.isRestarting = false;
  }

  init() {
    // Check browser compatibility
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }

    // Create speech recognition instance
    this.speechRec = new p5.SpeechRec('en-US', this.handleResult.bind(this));
    this.speechRec.continuous = true;  // Keep listening - library handles restarts
    this.speechRec.interimResults = false;  // Only final results to reduce noise

    // Add simplified event listeners for debugging only
    if (this.speechRec.rec) {
      this.speechRec.rec.onstart = () => {
        console.log('🎤 Speech recognition started');
      };

      this.speechRec.rec.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        // Let continuous mode handle recovery - don't manually restart
      };

      this.speechRec.rec.onend = () => {
        console.log('Speech recognition ended');
        // Let continuous mode handle restart automatically
      };
    }

    // Get UI elements
    this.indicatorElement = document.getElementById('voiceIndicator');
    this.statusElement = document.getElementById('voiceStatus');
    this.commandElement = document.getElementById('lastCommand');

    console.log('Voice command manager initialized');
    return true;
  }

  start() {
    if (!this.speechRec) {
      console.error('Speech recognition not initialized');
      return;
    }

    this.speechRec.start();
    this.isActive = true;

    // Show indicator
    if (this.indicatorElement) {
      this.indicatorElement.style.display = 'block';
    }

    console.log('🎤 Voice commands active - say: forward, back, left, right');
  }

  stop() {
    this.isActive = false;
    this.isRestarting = false;

    if (this.speechRec) {
      try {
        this.speechRec.stop();
      } catch (error) {
        console.warn('Error stopping speech recognition:', error);
      }
    }

    // Hide indicator
    if (this.indicatorElement) {
      this.indicatorElement.style.display = 'none';
    }

    console.log('Voice commands stopped');
  }

  onCommand(command, callback) {
    this.commandCallbacks[command.toLowerCase()] = callback;
  }

  handleResult() {
    if (!this.speechRec.resultString) {
      console.log('No result string received');
      return;
    }

    const speech = this.speechRec.resultString.toLowerCase().trim();
    console.log('🎯 Heard:', speech);

    // Update UI - show what was heard
    if (this.commandElement) {
      this.commandElement.textContent = `Heard: "${speech}"`;
    }

    // Parse command with more flexible matching
    let commandFound = false;

    if (speech.includes('forward') || speech.includes('go forward') || speech.includes('move forward') || speech.includes('for')) {
      this.executeCommand('forward');
      commandFound = true;
    } else if (speech.includes('back') || speech.includes('backward') || speech.includes('go back')) {
      this.executeCommand('backward');
      commandFound = true;
    } else if (speech.includes('left') || speech.includes('go left') || speech.includes('turn left')) {
      this.executeCommand('left');
      commandFound = true;
    } else if (speech.includes('right') || speech.includes('go right') || speech.includes('turn right')) {
      this.executeCommand('right');
      commandFound = true;
    } else if (speech.includes('stop') || speech.includes('halt') || speech.includes('freeze')) {
      this.executeCommand('stop');
      commandFound = true;
    }

    if (!commandFound) {
      console.log('⚠️ Command not recognized:', speech);
      console.log('Try saying: forward, back, left, right, or stop');
    }
  }

  executeCommand(command) {
    if (this.commandCallbacks[command]) {
      console.log(`✅ Executing: ${command}`);
      this.commandCallbacks[command]();
      this.lastCommand = command;
    }
  }
}
