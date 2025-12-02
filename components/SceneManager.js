class SceneManager {
  constructor(sceneElement = document.querySelector('a-scene')) {
    this.scene = sceneElement;
    this.objects = [];
    this.colorPalette = new ColorPalette();
  }

  addShape(type, position) {
    if (!this.scene) {
      console.warn('Scene not ready; cannot add shape.');
      return;
    }
    const color = this.colorPalette.getRandom();
    const shape = new Shape3D(type, position, color, this.scene);
    this.objects.push(shape);
    if (this.objects.length > CONFIG.MAX_OBJECTS) {
      this.removeOldestShape();
    }
  }

  removeOldestShape() {
    const oldestShape = this.objects.shift();
    if (oldestShape) {
      oldestShape.remove();
    }
  }

  update() {
    this.objects.forEach((obj) => obj.animate());
  }

  clear() {
    this.objects.forEach((shape) => shape.remove());
    this.objects = [];
  }
}
