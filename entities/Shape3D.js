class Shape3D {
  constructor(type, position, color, scene) {
    this.type = type;
    this.position = position;
    this.color = color;
    this.scene = scene;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.element = null;
    this.create();
  }

  create() {
    // Customize the primitive element and attach it to the scene.
    this.element = document.createElement(`a-${this.type}`);
    this.element.setAttribute(
      "position",
      `${this.position.x} ${this.position.y} ${this.position.z}`
    );
    this.element.setAttribute("color", this.color);
    if (this.type === "box") {
      this.element.setAttribute("width", "1");
      this.element.setAttribute("height", "1");
      this.element.setAttribute("depth", "1");
    } else if (this.type === "sphere") {
      this.element.setAttribute("radius", "0.5");
    }
    if (this.scene) {
      this.scene.appendChild(this.element);
    } else {
      console.warn('No scene available to attach shape.');
    }
  }

  animate() {
    this.rotation.y += CONFIG.ANIMATION_SPEED;
    this.rotation.x += CONFIG.ANIMATION_SPEED *0.5;
    //this.rotation.z += CONFIG.ANIMATION_SPEED;
    this.element.setAttribute('rotation', `${this.rotation.x * 57.3} ${this.rotation.y * 57.3} ${this.rotation.z * 57.3}`);
  }
  
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  } 
}
