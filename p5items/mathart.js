class MathArt {
  constructor() {
    this.sunflowerN = 0; // Persistent counter for sunflower pattern
    this.lavaParticles = [];
    this.smokeParticles = [];

    // Spiral animation state
    this.spiralAngle = 0;
    this.spiralScalar = 0;
    this.spiralSpeed = 0.05;
    this.spiralRadius = 8;
    this.orbitRadius = 150;
    this.orbitAngleSpeed = 0.02;
    this.orbitStartX = 0;
    this.orbitStartY = 0;
    this.moonAngleSpeed = 0.03;
    this.moonRadius = 10;
    this.planetRadius = 20;
    this.sunRadius = 80;
    this.sandParticles = [];
  }
  drawParametricSinCurve(graficCanvas, posX, posY, radius = 200) {
    graficCanvas.push();
    graficCanvas.colorMode(HSB, 360, 100, 100, 100);
    // fade for glow trails
    //background(0, 0, 0, 8);

    graficCanvas.translate(posX, posY);

    // animated parameters
    let a = 2 + sin(frameCount * 0.01) * 2;
    let b = 3 + cos(frameCount * 0.013) * 2;
    let r = radius;

    // shifting global hue over time
    let baseHue = (frameCount * 0.4) % 360;

    let turns = TWO_PI * 4;

    graficCanvas.noFill();
    graficCanvas.beginShape();
    for (let t = 0; t < turns; t += 0.004) {
      // local variation along curve
      let offsetHue = map(t, 0, turns, 0, 120);

      // combined shifting color
      let hueValue = (baseHue + offsetHue) % 360;

      graficCanvas.stroke(hueValue, 90, 100, 90);
      graficCanvas.strokeWeight(2.5);

      let x = sin(a * t) * r;
      let y = cos(b * t) * r;
      graficCanvas.vertex(x, y);
    }
    graficCanvas.endShape();
    graficCanvas.pop();
  }

  drawSunflowerPattern(graficCanvas, posX, posY, angle = 137.5) {
    graficCanvas.push();
    graficCanvas.colorMode(HSB, 360, 100, 100, 100);
    graficCanvas.translate(posX, posY);

    let c = 6;
    // draw a few points per frame for smooth growth
    for (let i = 0; i < 10; i++) {
      let goldenAngle = radians(angle); // get a circilar move
      let a = this.sunflowerN * goldenAngle;
      let r = c * sqrt(this.sunflowerN);

      let x = r * cos(a);
      let y = r * sin(a);

      // vibrant color based on n and time
      let hue = (this.sunflowerN * 0.4 + frameCount * 0.8) % 360;
      let sat = 95;
      let bright = 100;

      graficCanvas.noStroke();
      graficCanvas.fill(hue, sat, bright, 90);

      let size = 4 + 2 * sin(this.sunflowerN * 0.05 + frameCount * 0.05);
      graficCanvas.circle(x, y, size);

      this.sunflowerN++;

      // reset if it goes off-screen too far
      if (r > graficCanvas.width) {
        this.sunflowerN = 0;
        let r = random(0, 255);
        let g = random(0, 150);
        let b = random(0, 255);
        graficCanvas.background(0, 0, 0, 0);
      }
    }
    graficCanvas.pop();
  }

  drawNoisyMountain(grafitiCanvas, xBase, yBase, w, h, col, noiseOffset) {
    grafitiCanvas.fill(col);
    grafitiCanvas.beginShape();
    grafitiCanvas.vertex(xBase, yBase);

    for (let x = xBase; x <= xBase + w; x += 5) {
      let center = xBase + w / 2;
      let distFromCenter = abs(x - center);

      let linearY = map(distFromCenter, 0, w / 2, yBase - h, yBase);
      let noiseVal = noise(x * 0.05 + noiseOffset);
      let offset = map(noiseVal, 0, 1, -15, 15);
      grafitiCanvas.vertex(x, linearY + offset);
    }

    grafitiCanvas.vertex(xBase + w, yBase);
    grafitiCanvas.endShape(CLOSE);
  }

  drawUpwardLavaCanvas(graficCanvas) {
    graficCanvas.background(0, 70, 0);
    this.drawNoisyMountain(graficCanvas, 50, 400, 300, 180, 100, 0);
    this.drawNoisyMountain(graficCanvas, 350, 400, 200, 120, 120, 1000);

    //EMITTERS
    // Throttle lava emission - only every 2 frames
    if (frameCount % 2 === 0) {
      // Emitter x=200
      this.lavaParticles.push(new MotionParticle(200, 220, "lava"));
    }
    if (frameCount % 3 === 0) {
      // Emitter at x=450 (approx peak of second mountain)
      this.smokeParticles.push(new MotionParticle(450, 280, "smoke"));
    }

    // Update and draw lava particles
    for (let i = this.lavaParticles.length - 1; i >= 0; i--) {
      let p = this.lavaParticles[i];
      p.update();
      p.show(graficCanvas);
      if (p.isFinished()) this.lavaParticles.splice(i, 1);
    }

    // Update and draw smoke particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      let p = this.smokeParticles[i];
      p.update();
      p.show(graficCanvas);
      if (p.isFinished()) this.smokeParticles.splice(i, 1);
    }
  }

  drawSpiral(posX, posY, spiralCanvas) {
    spiralCanvas.push();
    spiralCanvas.translate(posX, posY);

    // Calculate spiral position
    let x = this.spiralScalar * cos(this.spiralAngle);
    let y = this.spiralScalar * sin(this.spiralAngle);

    // Dynamic color based on position
    let colorSwitch = floor(this.spiralScalar);
    if (colorSwitch % 5 == 0) {
      spiralCanvas.fill(random(0, 255), random(0, 255), random(10, 255));
    } else if (colorSwitch % 3 == 0) {
      spiralCanvas.fill(0, 255, 0);
    } else if (colorSwitch % 2 == 0) {
      spiralCanvas.fill(0, 0, 255);
    } else {
      let hueBase = (this.spiralScalar * 4) % 255;
      spiralCanvas.fill(255, hueBase, 120);
    }

    spiralCanvas.noStroke();
    spiralCanvas.ellipse(x, y, this.spiralRadius, this.spiralRadius);

    // Increment spiral parameters
    this.spiralAngle += this.spiralSpeed;
    this.spiralScalar += this.spiralSpeed;

    // Reset spiral when it reaches edge
    if (this.spiralScalar > spiralCanvas.width / 2) {
      this.spiralAngle = 0;
      this.spiralScalar = 0;
      spiralCanvas.background(0, 20);
    }

    spiralCanvas.pop();
  }

  drawOrbit(orbitCanvas, centerX = orbitCanvas.width / 2, centerY = orbitCanvas.height / 2) {
    orbitCanvas.push();
    orbitCanvas.colorMode(HSB, 360, 100, 100);

    this.orbitStartX = centerX;
    this.orbitStartY = centerY;

    const orbitAngleInc = frameCount * this.orbitAngleSpeed;
    const orbitX = this.orbitStartX + this.orbitRadius * cos(orbitAngleInc);
    const orbitY = this.orbitStartY + this.orbitRadius * sin(orbitAngleInc);

    orbitCanvas.fill(50, 90, 100);
    orbitCanvas.noStroke();
    orbitCanvas.ellipse(this.orbitStartX, this.orbitStartY, this.sunRadius, this.sunRadius);

    orbitCanvas.push();
    orbitCanvas.translate(orbitX, orbitY);
    orbitCanvas.fill(240, 60, 80);
    orbitCanvas.ellipse(0, 0, this.planetRadius, this.planetRadius);

    const moonOrbit = frameCount * this.moonAngleSpeed;
    const moonX = 20 * cos(moonOrbit);
    const moonY = 20 * sin(moonOrbit);
    orbitCanvas.fill(0, 10, 100);
    orbitCanvas.ellipse(moonX, moonY, this.moonRadius, this.moonRadius);
    orbitCanvas.pop();

    orbitCanvas.pop();
  }

  drawDesertScene(sceneCanvas) {
    const w = sceneCanvas.width;
    const h = sceneCanvas.height;

    if (this.sandParticles.length === 0) {
      for (let i = 0; i < 30; i++) {
        this.sandParticles.push({
          x: random(w),
          y: random(h * 0.7, h),
          speed: random(0.5, 2),
          size: random(2, 5)
        });
      }
    }

    // Sky gradient (top 70% of canvas)
    for (let y = 0; y < h * 0.7; y++) {
      let inter = map(y, 0, h * 0.7, 0, 1);
      let c = lerpColor(color(135, 206, 235), color(255, 200, 100), inter);
      sceneCanvas.stroke(c);
      sceneCanvas.line(0, y, w, y);
    }

    // Sand dunes (bottom 30%)
    sceneCanvas.fill(237, 201, 175);
    sceneCanvas.noStroke();
    sceneCanvas.beginShape();
    sceneCanvas.vertex(0, h * 0.7);
    for (let x = 0; x <= w; x += 50) {
      let y = h * 0.7 + sin(x * 0.01 + frameCount * 0.01) * 30;
      sceneCanvas.vertex(x, y);
    }
    sceneCanvas.vertex(w, h);
    sceneCanvas.vertex(0, h);
    sceneCanvas.endShape(CLOSE);

    // Sun with glow
    let sunGlow = sin(frameCount * 0.03) * 10 + 70;
    sceneCanvas.fill(255, 223, 0, 60);
    sceneCanvas.noStroke();
    sceneCanvas.circle(w * 0.3, h * 0.2, sunGlow);
    sceneCanvas.fill(255, 223, 0, 200);
    sceneCanvas.circle(w * 0.3, h * 0.2, 60);

    // Pyramids (scaled to fit 512x512)
    sceneCanvas.fill(194, 154, 108);
    sceneCanvas.stroke(0, 50);
    sceneCanvas.strokeWeight(2);
    sceneCanvas.triangle(w * 0.7, h * 0.55, w * 0.85, h * 0.85, w * 0.55, h * 0.85);

    sceneCanvas.fill(210, 170, 120);
    sceneCanvas.triangle(w * 0.25, h * 0.6, w * 0.4, h * 0.85, w * 0.1, h * 0.85);

    sceneCanvas.fill(225, 185, 135);
    sceneCanvas.triangle(w * 0.65, h * 0.7, w * 0.75, h * 0.85, w * 0.55, h * 0.85);

    // Buildings/ruins
    sceneCanvas.fill(180, 140, 100);
    sceneCanvas.rect(w * 0.1, h * 0.7, 30, 80);
    sceneCanvas.rect(w * 0.18, h * 0.72, 30, 70);

    sceneCanvas.fill(160, 120, 80);
    sceneCanvas.rect(w * 0.09, h * 0.68, 40, 15);
    sceneCanvas.rect(w * 0.17, h * 0.7, 40, 15);

    sceneCanvas.fill(200, 160, 120);
    sceneCanvas.rect(w * 0.3, h * 0.82, 40, 20);
    sceneCanvas.rect(w * 0.4, h * 0.8, 30, 25);
    sceneCanvas.rect(w * 0.36, h * 0.84, 25, 10);

    // Palm tree
    sceneCanvas.stroke(101, 67, 33);
    sceneCanvas.strokeWeight(8);
    sceneCanvas.line(w * 0.9, h * 0.85, w * 0.9, h * 0.65);

    sceneCanvas.noStroke();
    sceneCanvas.fill(34, 139, 34);
    let sway = sin(frameCount * 0.05) * 5;

    // Palm fronds
    sceneCanvas.push();
    sceneCanvas.translate(w * 0.9, h * 0.63);
    sceneCanvas.rotate(radians(sway * 0.5));
    sceneCanvas.ellipse(0, 0, 60, 30);
    sceneCanvas.pop();

    sceneCanvas.push();
    sceneCanvas.translate(w * 0.87, h * 0.65);
    sceneCanvas.rotate(radians(sway));
    sceneCanvas.ellipse(0, 0, 50, 25);
    sceneCanvas.pop();

    sceneCanvas.push();
    sceneCanvas.translate(w * 0.93, h * 0.65);
    sceneCanvas.rotate(radians(-sway));
    sceneCanvas.ellipse(0, 0, 50, 25);
    sceneCanvas.pop();

    sceneCanvas.push();
    sceneCanvas.translate(w * 0.88, h * 0.61);
    sceneCanvas.rotate(radians(sway * 0.7));
    sceneCanvas.ellipse(0, 0, 40, 25);
    sceneCanvas.pop();

    sceneCanvas.push();
    sceneCanvas.translate(w * 0.92, h * 0.61);
    sceneCanvas.rotate(radians(-sway * 0.7));
    sceneCanvas.ellipse(0, 0, 40, 25);
    sceneCanvas.pop();

    // Blowing sand particles
    sceneCanvas.noStroke();
    sceneCanvas.fill(237, 201, 175, 150);
    for (let p of this.sandParticles) {
      sceneCanvas.circle(p.x, p.y, p.size);
      p.x += p.speed;
      p.y += sin(frameCount * 0.05 + p.x) * 0.3;
      if (p.x > w) {
        p.x = -10;
        p.y = random(h * 0.7, h);
      }
    }

    // Heat wave effect
    sceneCanvas.stroke(255, 255, 255, 30);
    sceneCanvas.strokeWeight(1);
    for (let i = 0; i < 3; i++) {
      let y = h * 0.6 + i * 40;
      sceneCanvas.beginShape();
      for (let x = 0; x < w; x += 20) {
        let waveY = y + sin(x * 0.1 + frameCount * 0.05 + i) * 3;
        sceneCanvas.vertex(x, waveY);
      }
      sceneCanvas.endShape();
    }
  }
}
