let particles = [];
let numberOfParticles = 200;
// Define the obstacle (The Text Box)
let titleRect = { x: 0, y: 0, w: 300, h: 80 }; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Center the text box
  titleRect.x = width / 2 - titleRect.w / 2;
  titleRect.y = height / 2 - titleRect.h / 2;

  // Initialize particles
  for (let i = 0; i < numberOfParticles; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  // 1. THE TRAIL EFFECT

  noStroke();
  fill(0, 20); 
  rect(0, 0, width, height);
  // 2. DRAW THE OBSTACLE (Text)
  // We draw this every frame so the trails don't draw OVER the text
  fill(0); 
  stroke(255);
  strokeWeight(2);
  rect(titleRect.x, titleRect.y, titleRect.w, titleRect.h);
  noStroke();
  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("JAVASCRIPT", width / 2, height / 2);
  // 3. HANDLE PARTICLES
  for (let p of particles) {
    p.update();
    p.draw();
  }
  // 4. THE CONSTELLATION EFFECT (Connecting lines)
  // We separate this loop to ensure lines are drawn on top of trails but below text if needed
  connectParticles();
}

function connectParticles() {
  const maxDist = 70; // Connect if closer than 70px
  
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.hypot(dx, dy); // slightly faster than dist()

      if (distance < maxDist) {
        // Map opacity: closer particles = more opaque lines
        let opacity = map(distance, 0, maxDist, 1, 0);
        stroke(`rgba(255, 255, 255, ${opacity})`);
        strokeWeight(1);
        line(particles[a].x, particles[a].y, particles[b].x, particles[b].y);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Re-center box on resize
  titleRect.x = width / 2 - titleRect.w / 2;
  titleRect.y = height / 2 - titleRect.h / 2;
}