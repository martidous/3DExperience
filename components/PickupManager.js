class PickupManager {
  constructor(colorPalette) {
    this.colorPalette = colorPalette;
    this.objects = [];
    this.pickupRange = 2; 
    // Define GLB asset for later too heavy for browser
    this.availableModels = [];
  }

  spawnRandomObject(position) {
    const types = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'octahedron', 'tetrahedron', 'dodecahedron'];
    const randomType = random(types);
    
    const obj = new PickupObject(randomType, position, this.colorPalette);
    this.objects.push(obj);
    
    console.log(`Spawned ${randomType} at`, position);
    return obj;
  }

  spawnModel(modelId, position, scale = { x: 0.2, y: 0.2, z: 0.2 }) {
    const obj = new PickupObject('model', position, this.colorPalette, modelId);
    obj.setModelScale(scale.x, scale.y, scale.z);
    this.objects.push(obj);
    
    console.log(`Spawned model ${modelId} at`, position);
    return obj;
  }

  spawnRandomModel(position) {
    if (this.availableModels.length === 0) {
      console.warn('No models available to spawn');
      return null;
    }

    const randomModel = random(this.availableModels);
    return this.spawnModel(randomModel, position);
  }

  /**
   * energy core at a specific position
   */
  spawnEnergyCore(position) {
    // Validate position against static objects
    if (typeof isPositionSafe === 'function') {
      const validation = isPositionSafe(position, 2.0); // 2.0 unit buffer for cores

      if (!validation.safe) {
        console.warn(
          ` Energy core "${position.name}" at (${position.x}, ${position.y}, ${position.z}) ` +
          `may conflict with "${validation.conflictsWith}" ` +
          `(distance: ${validation.distance}, min required: ${validation.minRequired})`
        );
      }
    }

    const obj = new PickupObject('energycore', position, this.colorPalette);

    obj.coreName = position.name; //for debugging
    this.objects.push(obj);
    console.log(`⚡ Spawned energy core at ${position.name}:`, position);

    return obj;
  }

  /**
   * Spawns all 20 energy cores in predetermined positions
   */
  spawnAllEnergyCores() {
    console.log('Spawning 20 energy cores...');

    // Validate all positions before spawning (if validation function exists)
    if (typeof validateAllEnergyCorePositions === 'function') {
      validateAllEnergyCorePositions();
    }

    // Spawn cultural exhibit cores
    ENERGY_CORE_POSITIONS.cultural.forEach(pos => {
      this.spawnEnergyCore(pos);
    });

    // Spawn exploration cores
    ENERGY_CORE_POSITIONS.exploration.forEach(pos => {
      this.spawnEnergyCore(pos);
    });

    console.log(`Total cores spawned: ${this.objects.length}`);

    if (this.objects.length !== 20) {
      console.warn(' Expected 20 cores, but spawned ${this.objects.length}');
    }
  }

  spawnObjectAtRandomLocation(centerX, centerZ, range = 5, useModel = false) {
    const randomPos = {
      x: centerX + (Math.random() - 0.5) * range,
      y: 1.5,
      z: centerZ + (Math.random() - 0.5) * range
    };
    
    if (useModel && this.availableModels.length > 0) {
      return this.spawnRandomModel(randomPos);
    } else {
      return this.spawnRandomObject(randomPos);
    }
  }

  addAvailableModel(modelId) {
    if (!this.availableModels.includes(modelId)) {
      this.availableModels.push(modelId);
      console.log(`Added model ${modelId} to available pickups`);
    }
  }

  update() {
    this.objects.forEach(obj => obj.update());
  }

  findNearestObject(workerPosition) {
    let nearest = null;
    let nearestDist = this.pickupRange;

    this.objects.forEach(obj => {
      if (!obj.isPickedUp) {
        const dist = obj.getDistance(workerPosition);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = obj;
        }
      }
    });

    return nearest;
  }

  getPickedUpObject() {
    return this.objects.find(obj => obj.isPickedUp);
  }

  removeObject(obj) {
    const index = this.objects.indexOf(obj);
    if (index > -1) {
      this.objects.splice(index, 1);
      obj.remove();
    }
  }

  clear() {
    this.objects.forEach(obj => obj.remove());
    this.objects = [];
  }
}
