class WillieHologram {
  constructor(centerX, centerY, spriteData) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.spriteData = spriteData;
    this.spriteFrames = {};
    this.currentAnimation = 'Idle';
    this.currentFrameIndex = 0;
    this.framesPerAnimationFrame = 5;
    this.framesSinceLastUpdate = 0;
    this.defaultAnimationLoop = ['Idle', 'Run', 'Jump', 'Kick'];
    this.currentLoopIndex = 0;
    this.framesSinceAnimationStart = 0;
    this.animationLengthInFrames = {
      'Idle': 120,   // 2 seconds at 60fps
      'Run': 90,     // 1.5 seconds
      'Jump': 60,    // 1 second
      'Kick': 90,    // 1.5 seconds
      'Roll': 60     // 1 second
    };
    this.playerIsNearby = false;
    this.greetingAnimationSequence = ['Jump', 'Kick', 'Roll', 'Idle'];
    this.greetingSequenceIndex = 0;
    this.isPlayingGreeting = false;
  }

  preloadSprites() {
    const animationsToLoad = ['Idle', 'Run', 'Jump', 'Kick', 'Roll'];
    
    for (let animationName of animationsToLoad) {
      const animationInfo = this.spriteData.sprites[animationName];
      this.spriteFrames[animationName] = [];
      
      for (let frameNumber = 0; frameNumber < animationInfo.count; frameNumber++) {
        const paddedFrameNumber = String(frameNumber).padStart(animationInfo.digits, '0');
        const imagePath = `${animationInfo.path}${animationInfo.prefix}${paddedFrameNumber}.${animationInfo.extension}`;
        this.spriteFrames[animationName].push(loadImage(imagePath));
      }
    }
    
    console.log('Willie sprites preloaded successfully');
  }

  update(playerIsNearby) {
    this.framesSinceLastUpdate++;
    this.framesSinceAnimationStart++;

    // Trigger greeting when player first approaches
    if (playerIsNearby && !this.playerIsNearby && !this.isPlayingGreeting) {
      this.startGreetingSequence();
    }
    this.playerIsNearby = playerIsNearby;

    // Handle greeting animation sequence
    if (this.isPlayingGreeting) {
      this.updateGreetingSequence();
      return;
    }

    // Normal animation loop behavior
    const currentAnimationDuration = this.animationLengthInFrames[this.currentAnimation];
    
    if (this.framesSinceAnimationStart >= currentAnimationDuration) {
      this.advanceToNextAnimation();
      this.framesSinceAnimationStart = 0;
    }

    // Update sprite frame
    if (this.framesSinceLastUpdate >= this.framesPerAnimationFrame) {
      this.currentFrameIndex++;
      const totalFramesInAnimation = this.spriteFrames[this.currentAnimation].length;
      
      if (this.currentFrameIndex >= totalFramesInAnimation) {
        this.currentFrameIndex = 0;
      }
      
      this.framesSinceLastUpdate = 0;
    }
  }

  startGreetingSequence() {
    this.isPlayingGreeting = true;
    this.greetingSequenceIndex = 0;
    this.currentAnimation = this.greetingAnimationSequence[0];
    this.currentFrameIndex = 0;
    this.framesSinceAnimationStart = 0;
    console.log('Willie says: Collect the stuff bro!');
  }

  updateGreetingSequence() {
    const currentGreetingAnimation = this.greetingAnimationSequence[this.greetingSequenceIndex];
    const greetingAnimationDuration = this.animationLengthInFrames[currentGreetingAnimation] || 60;

    if (this.framesSinceAnimationStart >= greetingAnimationDuration) {
      this.greetingSequenceIndex++;
      
      if (this.greetingSequenceIndex >= this.greetingAnimationSequence.length) {
        // Greeting sequence complete, return to normal loop
        this.isPlayingGreeting = false;
        this.currentLoopIndex = 0;
        this.currentAnimation = this.defaultAnimationLoop[0];
        this.currentFrameIndex = 0;
        this.framesSinceAnimationStart = 0;
      } else {
        this.currentAnimation = this.greetingAnimationSequence[this.greetingSequenceIndex];
        this.currentFrameIndex = 0;
        this.framesSinceAnimationStart = 0;
      }
    }

    // Update sprite frame during greeting
    if (this.framesSinceLastUpdate >= this.framesPerAnimationFrame) {
      this.currentFrameIndex++;
      const totalFramesInAnimation = this.spriteFrames[this.currentAnimation].length;
      
      if (this.currentFrameIndex >= totalFramesInAnimation) {
        this.currentFrameIndex = 0;
      }
      
      this.framesSinceLastUpdate = 0;
    }
  }

  advanceToNextAnimation() {
    this.currentLoopIndex = (this.currentLoopIndex + 1) % this.defaultAnimationLoop.length;
    this.currentAnimation = this.defaultAnimationLoop[this.currentLoopIndex];
    this.currentFrameIndex = 0;
  }

  draw(graphicsBuffer) {
    graphicsBuffer.push();
    graphicsBuffer.imageMode(CENTER);
    
    // Get the current sprite frame to display
    const spriteImage = this.spriteFrames[this.currentAnimation][this.currentFrameIndex];
    
    if (spriteImage) {
      graphicsBuffer.image(spriteImage, this.centerX, this.centerY);
    }
    
    graphicsBuffer.pop();
  }

  getCurrentAnimation() {
    return this.currentAnimation;
  }
}