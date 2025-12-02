class SoundEffects {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.useCustomSounds = false;
    this.isWalking = false;
  }

  // Load custom sound files
  loadCustomSounds(
    pickupPath,
    dropPath,
    successPath,
    walkingPath = null,
    nearbyPath = null
  ) {
    console.log("Loading custom sound files...");

    if (pickupPath) {
      this.sounds.customPickup = loadSound(
        pickupPath,
        () => console.log("Pickup sound loaded"),
        (err) => console.error("Failed to load pickup sound:", err)
      );
    }

    if (dropPath) {
      this.sounds.customDrop = loadSound(
        dropPath,
        () => console.log("Drop sound loaded"),
        (err) => console.error("Failed to load drop sound:", err)
      );
    }

    if (successPath) {
      this.sounds.customSuccess = loadSound(
        successPath,
        () => console.log("Success sound loaded"),
        (err) => console.error("Failed to load success sound:", err)
      );
    }

    if (walkingPath) {
      this.sounds.customWalking = loadSound(
        walkingPath,
        () => {
          console.log("Walking sound loaded");
          this.sounds.customWalking.setLoop(true);
          this.sounds.customWalking.setVolume(0.3);
        },
        (err) => console.error("Failed to load walking sound:", err)
      );
    }

    if (nearbyPath) {
      this.sounds.customNearby = loadSound(
        nearbyPath,
        () => console.log("Nearby sound loaded"),
        (err) => console.error("Failed to load nearby sound:", err)
      );
    }

    this.useCustomSounds = true;
  }

  // Initialize synthesized sounds
  init() {
    this.sounds.pickup = new p5.Oscillator("sine");
    this.sounds.pickup.amp(0);
    this.sounds.pickup.start();

    this.sounds.drop = new p5.Oscillator("sine");
    this.sounds.drop.amp(0);
    this.sounds.drop.start();

    this.sounds.success = new p5.Oscillator("sine");
    this.sounds.success.amp(0);
    this.sounds.success.start();

    console.log("Sound effects initialized (synthesized)");
  }

  playPickup() {
    console.log("playPickup called, enabled:", this.enabled);

    if (!this.enabled) return;

    if (this.useCustomSounds && this.sounds.customPickup) {
      this.sounds.customPickup.play();
      console.log("Custom pickup sound played");
    } else {
      console.log("Playing synthesized pickup sound");

      if (!this.sounds.pickup) {
        console.error("Pickup oscillator not initialized!");
        return;
      }

      const osc = this.sounds.pickup;
      osc.freq(440);
      osc.amp(0.4);

      setTimeout(() => {
        osc.freq(660);
      }, 80);

      setTimeout(() => {
        osc.amp(0, 0.15);
      }, 180);

      console.log("Synthesized pickup sound played");
    }
  }

  playDrop() {
    if (!this.enabled) return;

    if (this.useCustomSounds && this.sounds.customDrop) {
      this.sounds.customDrop.play();
      console.log("Custom drop sound played");
    } else {
      const osc = this.sounds.drop;
      osc.freq(440);
      osc.amp(0.3);

      setTimeout(() => {
        osc.freq(220);
      }, 80);

      setTimeout(() => {
        osc.amp(0, 0.15);
      }, 180);

      console.log("Synthesized drop sound played");
    }
  }

  playSuccess() {
    if (!this.enabled) return;

    if (this.useCustomSounds && this.sounds.customSuccess) {
      this.sounds.customSuccess.play();
      console.log("Custom success sound played");
    } else {
      const osc = this.sounds.success;
      const notes = [523, 659, 784, 1047];

      notes.forEach((freq, i) => {
        setTimeout(() => {
          osc.freq(freq);
          osc.amp(0.4);

          setTimeout(() => {
            osc.amp(0, 0.1);
          }, 120);
        }, i * 130);
      });

      console.log("Synthesized success sound played");
    }
  }

  playNearby() {
    if (!this.enabled) return;

    if (this.useCustomSounds && this.sounds.customNearby) {
      this.sounds.customNearby.play();
    } else {
      const osc = this.sounds.pickup;
      osc.freq(880);
      osc.amp(0.15);

      setTimeout(() => {
        osc.amp(0, 0.08);
      }, 80);
    }
  }

  startWalking() {
    if (!this.enabled) return;
    if (this.isWalking) return;

    this.isWalking = true;

    if (this.useCustomSounds && this.sounds.customWalking) {
      if (!this.sounds.customWalking.isPlaying()) {
        this.sounds.customWalking.play();
        console.log("Walking sound started");
      }
    } else {
      console.log("Walking started (no synthesized sound)");
    }
  }

  stopWalking() {
    if (!this.isWalking) return;

    this.isWalking = false;

    if (this.useCustomSounds && this.sounds.customWalking) {
      if (this.sounds.customWalking.isPlaying()) {
        this.sounds.customWalking.stop();
        console.log("Walking sound stopped");
      }
    } else {
      console.log("Walking stopped");
    }
  }

  setWalkingVolume(volume) {
    if (this.sounds.customWalking) {
      this.sounds.customWalking.setVolume(volume);
    }
  }

  setVolume(volume) {
    if (this.sounds.customPickup) this.sounds.customPickup.setVolume(volume);
    if (this.sounds.customDrop) this.sounds.customDrop.setVolume(volume);
    if (this.sounds.customSuccess) this.sounds.customSuccess.setVolume(volume);
    if (this.sounds.customNearby) this.sounds.customNearby.setVolume(volume);
    if (this.sounds.customWalking) this.sounds.customWalking.setVolume(volume);
  }

  toggle() {
    this.enabled = !this.enabled;

    if (!this.enabled && this.isWalking) {
      this.stopWalking();
    }

    console.log(`Sound effects ${this.enabled ? "enabled" : "disabled"}`);
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (!this.enabled && this.isWalking) {
      this.stopWalking();
    }
  }

  toggleSoundType() {
    this.useCustomSounds = !this.useCustomSounds;
    console.log(
      `Using ${this.useCustomSounds ? "custom" : "synthesized"} sounds`
    );
  }
}