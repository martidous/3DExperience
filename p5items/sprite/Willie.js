class Willie extends PhysicsObject {
  constructor(x, y, w, h, img = "", options = { isStatic: false }) {
    super(x, y, w, h, options, false, 0);
    this.img = img;
    this.data = null;
    this.loader = null;
    this.config = null;
    this.frameIndex = 0;
    //this.createbody();
    //current state of  the sprite/ defailt Idle
    this.current = "Idle";
    this.direction = "left";
    this.manualPos = { x, y };
    this.usePhysics = false;
    this.body = null;
    // may need to trim the  sprite. Just a little to position the image a little higher
    this.sprite_bottom_offset=0.11;
    // default. Added a custom one @ createPhysicsBody . Will change to this 
    this.options={
      friction: 0.9,       // strong grip on ground
      frictionStatic: 1,   // prevent sliding
      frictionAir: 0.02,   // reduce bounce in air
      restitution: 0,      // no bounce
      density: 0.002   
    }
  }
  enablePhysics() {
  if (this.usePhysics) return;
    this.usePhysics = true;
    // create body first
    this.createPhysicsBody();
    // then label safely
    if (this.body) {
      this.body.label = "willie";
    }
  }
  disablePhysics() {
    if (this.usePhysics === false) return;
    this.manualPos.x = this.body.position.x;
    this.manualPos.y = this.body.position.y;
    World.remove(world, this.body);
    this.usePhysics = false;
    this.body = null;
  }
  createPhysicsBody() {
    let opt={
      friction: 1,       // strong grip on ground
      frictionStatic: 1.5,   // prevent sliding
      frictionAir: 0.03,   // reduce bounce in air
      restitution: 0,      // no bounce
      density: 0.015
    }

    // Reduce the physics body height to account for sprite padding
    // This makes the visual bottom align better with the physics body
    const physicsHeight = this.height * (1 - this.sprite_bottom_offset);

    // Adjust Y position upward by half the offset so body sits lower
    const adjustedY = this.manualPos.y + (this.height * this.sprite_bottom_offset / 2);

    this.body = Bodies.rectangle(
      this.manualPos.x,
      adjustedY,
      this.width * 0.8,  // Slightly narrower to prevent snagging on fragments
      physicsHeight,
      opt
    );
    World.add(world, this.body);
  }
  // This was not easy. the sprite I got was not meant to switch direction, All other moves were fine 
  // But the run  did not work 
  changeDirection(direction, frames) {
    let img = frames[this.frameIndex];
    if (!img) return;
    if (direction === "left") {
      push();
      scale(-1, 1);
      //translate(-this.width,0);
      image(frames[this.frameIndex], 0, 0, this.width, this.height);
      pop();
    } else if (direction === "right") {
      push();
      image(frames[this.frameIndex], 0, 0, this.width, this.height);
      pop();
    } else {
      push();
      //image(frames[this.frameIndex], 0, 0, this.width, this.height);
      image(img, 0, 0, this.width, this.height);
      pop();
    }
  }
  drawParticle() {
    //,make sure the jsons is loaded
    if (!this.loader || !this.config) return;
    let state = this.current || this.config.defaultState;
    let frames = this.loader.get(state);
    if (!frames || frames.length === 0) return;
    //console.log("Facing:", this.direction);
    //this.direction="left";
    // Since transled to the position
    //image(frames[this.frameIndex],0,0,this.width,this.height);
    let img = frames[this.frameIndex];
    if (!img) return;
    push();

    // Adjust visual Y position to account for the physics body offset
    const visualY = this.y - (this.height * this.sprite_bottom_offset / 2);

    translate(this.x, visualY); // ✅ Willie positions himself
    imageMode(CENTER);
    if (this.direction === "right") {
      scale(-1, 1); // mirror horizontally
    }
    let visualOffset=this.height*this.sprite_bottom_offset;
    image(img, 0, 0, this.width, this.height+visualOffset);
    pop();

    // Animation frame step
    if (frameCount % this.config.frameDelay === 0) {
      this.frameIndex = (this.frameIndex + 1) % frames.length;
    }
  }

  update() {
    if (this.usePhysics && this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
    } else {
      this.x = this.manualPos.x;
      this.y = this.manualPos.y;
    }
    const topLimit = 0 + this.height / 2;
    if (this.y < topLimit) {
      if (this.usePhysics && this.body) {
        Matter.Body.setPosition(this.body, { x: this.x, y: topLimit });
        Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
      } else {
        this.manualPos.y = topLimit;
      }
    }
    const groundLimit = height - this.height / 2;
    if (this.y > groundLimit) {
      if (this.usePhysics && this.body) {
        Matter.Body.setPosition(this.body, { x: this.x, y: groundLimit });
        Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
      } else {
        this.manualPos.y = groundLimit;
      }
    }
  }

  show() {
    super.show();
  }
  loaSpriteFromJson(data) {
    this.data = data;
    this.config = this.data.config;
    this.loader = new SpriteLoader(this.data);
    this.loader.preloadAll();
  }
  manageMovement(key) {
    if (key === "i" || key === "I") this.current = "Idle";
    if (key === "r" || key === "R") this.current = "Run";
    if (key === "k" || key === "K") this.current = "Kick";
    if (key === "j" || key === "J") this.current = "Jump";
    if (key === "h" || key === "H") this.current = "Hit";
    if (key === "m" || key === "M") this.current = "Die";
    if (key === "o" || key === "O") this.current = "Roll";

    // Remove direction changes here!
    this.frameIndex = 0;
  }
  controlArrows(key) {
    if (key === "ArrowLeft") {
      this.direction = "left";
      this.moveleft();
    }
    if (key === "ArrowRight") {
      this.direction = "right";
      this.moveRight();
    }
    if (key === "ArrowUp") this.jump();
    if (key === "ArrowDown") {
      this.crouch();
    } else {
      this.standUp();
    }
  }

  moveleft() {
    if (this.usePhysics) {
      Matter.Body.setVelocity(this.body, { x: -5, y: this.body.velocity.y });
    } else {
      this.manualPos.x -= 5;
    }
    this.current = "Run";
    // this.frameIndex=0;
  }
  moveRight() {
    if (this.usePhysics) {
      Matter.Body.setVelocity(this.body, { x: 5, y: this.body.velocity.y });
    } else {
      this.manualPos.x += 15;
    }
    this.current = "Run";
    //this.frameIndex=0;
  }

  jump() {
    if (this.usePhysics) {
      // to do : check if the body is on the ground before jumping
      Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: -10 });
    } else {
      this.manualPos.y -= 10;
    }
    this.current = "Jump";
  }
  crouch() {
    if (this.current !== "Crouch") {
      this.current = "Idle";
      this.manualPos.y += 15; // small downward shift
      this._isCrouching = true;
    }
  }

  standUp() {
    if (this._isCrouching) {
      this.manualPos.y -= 1;
      this._isCrouching = false;
      this.current = "Idle";
    }
  }
}
// th sh