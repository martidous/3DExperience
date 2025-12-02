class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(-100, -10); // Start above screen
    this.vx = 0; // Horizontal velocity
    this.vy = random(1, 3); // Falling speed (Gravity start)
    this.size = random(2, 5);
    this.friction = 0.99; // Air resistance
    this.gravity = 0.05; // Constant downward force
  }

  draw() {
    noStroke();
    fill(255);
    circle(this.x, this.y, this.size);
  }

  update() {
    // Apply Physics
    this.vy += this.gravity;
    this.vx *= this.friction; // Slow down horizontal movement over time
    this.x += this.vx;
    this.y += this.vy;

    // --- COLLISION DETECTION (AABB) ---
    // Check if particle hits the Text Box
    if (this.x > titleRect.x && 
        this.x < titleRect.x + titleRect.w &&
        this.y > titleRect.y && 
        this.y < titleRect.y + titleRect.h) {
        
        // 1. Reset position to top of box (prevent sticking inside)
        this.y = titleRect.y - this.size;
        
        // 2. BOUNCE: Reverse Y velocity
        this.vy *= -0.5; // 0.5 means it loses 50% energy (dampening)
        
        // 3. SPLASH: Add random horizontal velocity
        // This makes them slide off the sides like water
        this.vx = random(-2, 2); 
    }

    // Reset if falls off bottom
    if (this.y > height) {
      this.reset();
    }
  }

  reset() {
    this.x = random(width);
    this.y = random(-100, -10);
    this.vy = random(1, 3);
    this.vx = 0;
  }
}