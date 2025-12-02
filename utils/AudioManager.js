
class AudioManager {
  constructor() {
    this.fft = null;
    this.mic = null;
    this.music = null;
    this.isActive = false;
    this.audioSource = 'music'; // 'mic' or 'music'
    this.spectrum = [];
    this.waveform = [];
    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    this.smoothing = 0.8; // FFT smoothing (0-1)
  }

  /**
   * Initialize audio system
   * Note: User interaction required before audio can start
   */
  async init() {
    try {
      // Create FFT analyzer
      this.fft = new p5.FFT(this.smoothing, 1024);

      // Try to create microphone input
      this.mic = new p5.AudioIn();

      console.log('AudioManager initialized');
      console.log('Note: Click "P" near Powerpuff to activate audio');

      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      return false;
    }
  }

  /**
   * Load music file (optional - user can add their own music)
   * @param {string} filepath - Path to music file
   */
  loadMusic(filepath) {
    console.log(`Attempting to load music from: ${filepath}`);

    // loadSound is asynchronous 
    this.music = loadSound(
      filepath,
      () => {
        console.log('✓ Music loaded successfully');
        console.log('💡 Walk to Powerpuff and press P to play!');
      },
      (error) => {
        console.warn('Could not load music file:', error);
        console.log(' Will use microphone instead');
        this.music = null;
      }
    );
  }

  /**
   * Start audio capture/playback
   */
  async start() {
    if (this.isActive) {
      console.log('Audio already active');
      return;
    }

    try {
      // Resume audio context 
      console.log('Resuming audio context...');
      await getAudioContext().resume();
      console.log('✓ Audio context resumed');

      if (this.audioSource === 'mic') {
        // Start microphone
        console.log('Requesting microphone access...');
        this.mic.start(
          () => {
            console.log('Microphone access granted');
            this.fft.setInput(this.mic);
            console.log('Microphone activated - speak or make sounds!');
            this.isActive = true;
          },
          (error) => {
            console.error(' Microphone ailed:', error);
            console.log('Please allow microphone access in your browser settings');
            this.isActive = false;
          }
        );
      } else if (this.audioSource === 'music' && this.music) {
        // Play music file
        console.log('Starting music playback...');
        this.music.loop();
        this.fft.setInput(this.music);
        console.log('🎵 Music playing');
        this.isActive = true;
      } else {
        // Fallback to mic if music not available
        console.log('Music not loaded, falling back to microphone...');
        this.audioSource = 'mic';
        console.log('Requesting microphone access...');
        this.mic.start(
          () => {
            console.log('✓ Microphone access granted');
            this.fft.setInput(this.mic);
            console.log('🎤 Microphone activated - speak or make sounds!');
            this.isActive = true;
          },
          (error) => {
            console.error(' Microphone access denied or failed:', error);
            console.log('Please allow microphone access in your browser settings');
            this.isActive = false;
          }
        );
      }
    } catch (error) {
      console.error('Error starting audio:', error);
      this.isActive = false;
    }
  }

  /**
   * Stop audio capture/playback
   */
  stop() {
    if (!this.isActive) return;

    if (this.audioSource === 'mic') {
      this.mic.stop();
    } else if (this.audioSource === 'music' && this.music) {
      this.music.stop();
    }

    this.isActive = false;
    console.log(' Audio stopped');
  }

  /**
   * Toggle between microphone and music
   */
  toggleSource() {
    const wasActive = this.isActive;

    if (wasActive) {
      this.stop();
    }
    // Switch source
    this.audioSource = this.audioSource === 'mic' ? 'music' : 'mic';

    if (wasActive) {
      this.start();
    }

    console.log(`Switched to: ${this.audioSource === 'mic' ? 'Microphone' : 'Music'}`);
  }

  /**
   * Update FFT analysis (call this every frame)
   */
  update() {
    if (!this.isActive || !this.fft) return;

    // Check if mic is actually enabled
    if (this.audioSource === 'mic' && this.mic && !this.mic.enabled) {
      console.warn('Microphone not enabled yet');
      return;
    }

    // Get frequency spectrum (0-255 for each frequency bin)
    this.spectrum = this.fft.analyze();

    // Get waveform data for visualization
    this.waveform = this.fft.waveform();

    // Extract frequency bands
    // Bass: 20-140 Hz (bins 0-11 at 1024 FFT size, ~44100 sample rate)
    // Mid: 140-2000 Hz (bins 12-93)
    // Treble: 2000-20000 Hz (bins 94-511)

    this.bass = this.fft.getEnergy("bass"); // 60 to 250 Hz
    this.mid = this.fft.getEnergy("mid"); // 400 to 2600 Hz
    this.treble = this.fft.getEnergy("treble"); // 5200 to 14000 Hz

    // Normalize to 0-1 range (p5.FFT returns 0-255)
    this.bass = this.bass / 255;
    this.mid = this.mid / 255;
    this.treble = this.treble / 255;
  }

  /**
   * Get average amplitude (overall volume)
   * @returns {number} 0-1
   */
  getAmplitude() {
    if (!this.isActive || !this.spectrum) return 0;

    const sum = this.spectrum.reduce((a, b) => a + b, 0);
    return sum / (this.spectrum.length * 255); // Normalize to 0-1
  }

  /**
   * Get waveform for circular visualization
   * @param {number} points - Number of points to sample
   * @returns {Array} Array of waveform values
   */
  getWaveformPoints(points = 64) {
    if (!this.waveform || this.waveform.length === 0) {
      return new Array(points).fill(0);
    }

    const step = Math.floor(this.waveform.length / points);
    const result = [];

    for (let i = 0; i < points; i++) {
      const index = i * step;
      result.push(this.waveform[index]);
    }

    return result;
  }

  /**
   * Check if audio is currently active
   * @returns {boolean}
   */
  isPlaying() {
    return this.isActive;
  }

  /**
   * Get current audio source type
   * @returns {string} 'mic' or 'music'
   */
  getSource() {
    return this.audioSource;
  }
}
