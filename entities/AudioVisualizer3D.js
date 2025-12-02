class AudioVisualizer3D {
  constructor(position, audioManager) {
    this.position = position;
    this.audioManager = audioManager;
    this.colorPalette = new ColorPalette();
    this.bars = [];
    this.particles = [];
    this.centerSphere = null;
    this.numBars = 64; 
    this.barRadius = 3; 
    this.maxBarHeight = 4;   
    this.init();
  }

  init() {
    // Create center pulsing sphere (smaller and higher)
    this.centerSphere = document.createElement('a-sphere');
    this.centerSphere.setAttribute('position', `${this.position.x} ${this.position.y + 0.8} ${this.position.z}`);
    this.centerSphere.setAttribute('radius', '0.3');
    this.centerSphere.setAttribute('color', this.colorPalette.vibrantColors[5]);
    this.centerSphere.setAttribute('material', {
      emissive: this.colorPalette.vibrantColors[5],
      emissiveIntensity: 2,
      opacity: 0.2,
      transparent: true
    });
    document.querySelector('a-scene').appendChild(this.centerSphere);

    // Create frequency bars in a circle with rainbow gradient
    for (let i = 0; i < this.numBars; i++) {
      const angle = (i / this.numBars) * Math.PI * 2;
      const x = this.position.x + Math.cos(angle) * this.barRadius;
      const z = this.position.z + Math.sin(angle) * this.barRadius;

      // Create smooth rainbow gradient: hue from 0 (red) to 300 (magenta)
      const hue = (i / this.numBars) * 300; // 0-300 degrees for rainbow
      const rainbowColor = `hsl(${hue}, 100%, 50%)`;

      const bar = document.createElement('a-box');
      bar.setAttribute('position', `${x} ${this.position.y} ${z}`);
      bar.setAttribute('width', '0.15');
      bar.setAttribute('height', '0.1');
      bar.setAttribute('depth', '0.15');
      bar.setAttribute('color', rainbowColor);
      bar.setAttribute('material', {
        emissive: rainbowColor,
        emissiveIntensity: 1.5,
        metalness: 0.8,
        roughness: 0.2
      });

      // Rotate bar to face center
      const rotY = (angle * 180 / Math.PI) + 90;
      bar.setAttribute('rotation', `0 ${rotY} 0`);

      document.querySelector('a-scene').appendChild(bar);

      this.bars.push({
        element: bar,
        angle: angle,
        baseX: x,
        baseZ: z,
        hue: hue // Store hue for later use
      });
    }

    // rainbow particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('a-sphere');
      const px = this.position.x + (Math.random() - 0.5) * 6;
      const py = this.position.y + Math.random() * 3;
      const pz = this.position.z + (Math.random() - 0.5) * 6;

      //gradient color 
      const hue = (i / 20) * 300; // 0-300 degrees for rainbow
      const rainbowColor = `hsl(${hue}, 100%, 50%)`;

      particle.setAttribute('position', `${px} ${py} ${pz}`);
      particle.setAttribute('radius', '0.1');
      particle.setAttribute('color', rainbowColor);
      particle.setAttribute('material', {
        emissive: rainbowColor,
        emissiveIntensity: 2,
        opacity: 0.7,
        transparent: true
      });

      document.querySelector('a-scene').appendChild(particle);

      this.particles.push({
        element: particle,
        baseY: py,
        speed: Math.random() * 0.02 + 0.01,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  update() {
    if (!this.audioManager || !this.audioManager.fft) return;

    const spectrum = this.audioManager.fft.analyze();
    const bass = this.audioManager.fft.getEnergy("bass");
    const treble = this.audioManager.fft.getEnergy("treble");
    const mid = this.audioManager.fft.getEnergy("mid");

    // Update center sphere based on bass scle
    const sphereScale = map(bass, 0, 255, 0.5, 2);
    this.centerSphere.setAttribute('radius', sphereScale);
    
    // Pulse emissive intensity
    const intensity = map(bass, 0, 255, 1, 4);
    this.centerSphere.setAttribute('material', 'emissiveIntensity', intensity);

    // Update  bars
    for (let i = 0; i < this.bars.length; i++) {
      const bar = this.bars[i];
      const freqIndex = Math.floor(map(i, 0, this.numBars, 0, spectrum.length));
      const freq = spectrum[freqIndex];
      
      // Map frequency to bar height
      const height = map(freq, 0, 255, 0.1, this.maxBarHeight);
      bar.element.setAttribute('height', height);
      
      // Update Y position 
      const y = this.position.y + height / 2;
      bar.element.setAttribute('position', `${bar.baseX} ${y} ${bar.baseZ}`);
      
      // Change color 
      const emissiveIntensity = map(freq, 0, 255, 0.5, 3);
      bar.element.setAttribute('material', 'emissiveIntensity', emissiveIntensity);
    }

    // Animate particles based on treble
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const pos = particle.element.getAttribute('position');
      
      // Floating motion
      particle.offset += particle.speed;
      const floatY = particle.baseY + Math.sin(particle.offset) * 0.5;
      
      // React to treble
      const trebleBoost = map(treble, 0, 255, 0, 1);
      pos.y = floatY + trebleBoost;
      
      particle.element.setAttribute('position', pos);
      
      // Pulse size with mid frequencies
      const size = map(mid, 0, 255, 0.05, 0.2);
      particle.element.setAttribute('radius', size);
    }
  }

  remove() {
    if (this.centerSphere) this.centerSphere.remove();
    this.bars.forEach(bar => bar.element.remove());
    this.particles.forEach(p => p.element.remove());
  }

  setVisible(visible) {
    if (this.centerSphere) this.centerSphere.setAttribute('visible', visible);
    this.bars.forEach(bar => bar.element.setAttribute('visible', visible));
    this.particles.forEach(p => p.element.setAttribute('visible', visible));
  }
}