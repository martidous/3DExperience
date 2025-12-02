class PickupObject {
  constructor(type, position, colorPalette, modelId = null) {
    this.type = type;
    this.position = position;
    this.colorPalette = colorPalette;
    this.color = colorPalette.getRandom();
    this.element = null;
    this.isPickedUp = false;
    this.originalPosition = { ...position };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.rotationSpeed = {
      x: Math.random() * 0.02 - 0.01,
      y: Math.random() * 0.02 - 0.01,
      z: Math.random() * 0.02 - 0.01
    };
    
    // For GLB models
    this.isModel = modelId !== null;
    this.modelId = modelId;
    this.modelScale = { x: 0.5, y: 0.5, z: 0.5 }; // Default scale for models
    
    this.create();
  }

  create() {
    if (this.type === 'energycore') {
      // Glowing octahedron (higher detail for smoother edges)
      this.element = document.createElement('a-octahedron');
      this.element.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
      this.element.setAttribute('radius', '0.2');
      this.element.setAttribute('detail', '4'); // bump subdivision for smoothness

      // Emissive gold material with glow
      this.element.setAttribute('material', {
        color: '#FFD700',
        emissive: '#FFB700',
        emissiveIntensity: 0.9,
        metalness: 1.0,
        roughness: 0.2,
        shader: 'standard'
      });
    } else if (this.isModel) {
      // Create GLB model entity
      this.element = document.createElement('a-entity');
      this.element.setAttribute('gltf-model', `#${this.modelId}`);
      this.element.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
      this.element.setAttribute('scale', `${this.modelScale.x} ${this.modelScale.y} ${this.modelScale.z}`);

      // Add glow effect to model (optional)
      this.element.setAttribute('light', {
        type: 'point',
        color: this.color,
        intensity: 0.5,
        distance: 2
      });
    } else {
      // Create primitive shape (existing code)
      this.element = document.createElement(`a-${this.type}`);
      this.element.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
      this.element.setAttribute('color', this.color);
      
      // Set shape-specific attributes
      switch(this.type) {
        case 'box':
          this.element.setAttribute('width', '0.3');
          this.element.setAttribute('height', '0.3');
          this.element.setAttribute('depth', '0.3');
          break;
        case 'sphere':
          this.element.setAttribute('radius', '0.2');
          break;
        case 'cylinder':
          this.element.setAttribute('radius', '0.15');
          this.element.setAttribute('height', '0.4');
          break;
        case 'cone':
          this.element.setAttribute('radius-bottom', '0.2');
          this.element.setAttribute('radius-top', '0');
          this.element.setAttribute('height', '0.4');
          break;
        case 'torus':
          this.element.setAttribute('radius', '0.2');
          this.element.setAttribute('radius-tubular', '0.05');
          break;
        case 'octahedron':
          this.element.setAttribute('radius', '0.2');
          break;
        case 'tetrahedron':
          this.element.setAttribute('radius', '0.2');
          break;
        case 'dodecahedron':
          this.element.setAttribute('radius', '0.2');
          break;
      }
      
      // Add glowing material for primitives
      this.element.setAttribute('material', {
        emissive: this.color,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3
      });
    }
    
    // Add class for identification
    this.element.classList.add('pickup-object');
    this.element.setAttribute('data-pickup-id', this.generateId());
    
    document.querySelector('a-scene').appendChild(this.element);
  }

  generateId() {
    const itemType = this.isModel ? this.modelId : this.type;
    return `pickup_${itemType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  update() {
    if (!this.isPickedUp) {
      // Special rotation for energy cores
      if (this.type === 'energycore') {
        this.rotation.y += 0.01; // Slow, mesmerizing rotation
        this.element.setAttribute('rotation', `0 ${this.rotation.y * 57.3} 0`);

        // No floating animation for performance (static Y position)
      } else {
        // Rotate when not picked up
        this.rotation.x += this.rotationSpeed.x;
        this.rotation.y += this.rotationSpeed.y;
        this.rotation.z += this.rotationSpeed.z;

        this.element.setAttribute('rotation',
          `${this.rotation.x * 57.3} ${this.rotation.y * 57.3} ${this.rotation.z * 57.3}`
        );

        // Gentle floating animation
        const floatY = this.originalPosition.y + Math.sin(Date.now() * 0.001) * 0.1;
        this.position.y = floatY;
        this.element.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
      }
    }
  }
  // 
  pickup(workerPosition) {
    this.isPickedUp = true;
    console.log(`Picked up ${this.isModel ? this.modelId : this.type}!`);
    
    if (this.isModel) {
      // Increase light intensity for models
      this.element.setAttribute('light', 'intensity', 1.0);
    } else {
      // Make primitive shapes glow brighter
      this.element.setAttribute('material', 'emissiveIntensity', 1.5);
    }
  }

  drop(workerPosition) {
    this.isPickedUp = false;
    
    // Drop in front of worker
    this.position.x = workerPosition.x;
    this.position.y = workerPosition.y + 0.5;
    this.position.z = workerPosition.z - 1;
    this.originalPosition = { ...this.position };
    
    this.element.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
    
    if (this.isModel) {
      // Return to normal light for models
      this.element.setAttribute('light', 'intensity', 0.5);
    } else {
      // Return to normal glow for primitives
      this.element.setAttribute('material', 'emissiveIntensity', 0.5);
    }
    
    console.log(`Dropped ${this.isModel ? this.modelId : this.type}!`);
  }

  updatePosition(workerPosition, workerRotation) {
    if (this.isPickedUp) {
      // Position in front of worker
      const offsetDistance = 1.5;
      const angleRad = workerRotation * Math.PI / 180;
      
      this.position.x = workerPosition.x - Math.sin(angleRad) * offsetDistance;
      this.position.y = workerPosition.y + 1.2;
      this.position.z = workerPosition.z - Math.cos(angleRad) * offsetDistance;
      
      this.element.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
      
      // Rotate with worker
      this.rotation.y += 0.02;
      this.element.setAttribute('rotation', `0 ${this.rotation.y * 57.3} 0`);
    }
  }

  getDistance(position) {
    const dx = this.position.x - position.x;
    const dy = this.position.y - position.y;
    const dz = this.position.z - position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  highlight(enabled) {
    if (enabled) {
      if (this.isModel) {
        this.element.setAttribute('light', 'intensity', 2);
        this.element.setAttribute('scale', 
          `${this.modelScale.x * 1.2} ${this.modelScale.y * 1.2} ${this.modelScale.z * 1.2}`);
      } else {
        this.element.setAttribute('material', 'emissiveIntensity', 2);
        this.element.setAttribute('scale', '1.2 1.2 1.2');
      }
    } else {
      if (this.isModel) {
        const intensity = this.isPickedUp ? 1.0 : 0.5;
        this.element.setAttribute('light', 'intensity', intensity);
        this.element.setAttribute('scale', 
          `${this.modelScale.x} ${this.modelScale.y} ${this.modelScale.z}`);
      } else {
        const intensity = this.isPickedUp ? 1.5 : 0.5;
        this.element.setAttribute('material', 'emissiveIntensity', intensity);
        this.element.setAttribute('scale', '1 1 1');
      }
    }
  }

  setModelScale(x, y, z) {
    if (this.isModel) {
      this.modelScale = { x, y, z };
      this.element.setAttribute('scale', `${x} ${y} ${z}`);
    }
  }
}
