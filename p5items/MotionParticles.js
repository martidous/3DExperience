
class MotionParticle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alpha = 255;
    
    if (this.type === "lava") {
      this.vx = random(-1.5, 1.5); 
      this.vy = random(-5, -1);
      this.size = random(10, 25);
      let r = random(1);
      if (r < 0.33) this.color = color(255, 69, 0); 
      else if (r < 0.66) this.color = color(255, 140, 0); 
      else this.color = color(255, 215, 0); 
    } else if (this.type === "smoke") {
      this.vx = random(-0.5, 0.5);
      this.vy = random(-2, -0.5);
      this.size = random(15, 30);
      this.color = color(200, 200, 200); 
      this.alpha = 150; 
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.type === "lava") {
      this.alpha -= 5; 
      this.vy += 0.05; 
    } else {
      this.alpha -= 2; 
      this.size += 0.2; 
    }
  }

  show(canvas) {
    if (canvas) {
      canvas.noStroke();
      let c = this.color;
      c.setAlpha(this.alpha);
      canvas.fill(c);
      canvas.ellipse(this.x, this.y, this.size);
    } else {
      // Fallback to global context
      noStroke();
      let c = this.color;
      c.setAlpha(this.alpha);
      fill(c);
      ellipse(this.x, this.y, this.size);
    }
  }

  isFinished() {
    return this.alpha < 0;
  }
}