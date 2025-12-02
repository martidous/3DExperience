class KeyManager {
  constructor() {
    // this giv
    this.handlers = {
      scene: this.handleSceneKeys.bind(this),
      character: this.handleCharacterKeys.bind(this),
      pickup: this.handlePickupKeys.bind(this),
      audio: this.handleAudioKeys.bind(this),
      video: this.handleVideoKeys.bind(this),
      light: this.handleLightKeys.bind(this),
      debug: this.handleDebugKeys.bind(this),
    };
  }

  handleKeyPress(key, context) {
    // Call handlers
    Object.values(this.handlers).forEach((handler) => {
      handler(key, context);
    });
  }

  // Scene management keys
  handleSceneKeys(key, context) {
    const { sceneManager } = context;
    if (!sceneManager) return;

    if (key === "c" || key === "C") {
      sceneManager.clear();
      console.log("Scene cleared");
    }
  }

  // Character animation keys
  handleCharacterKeys(key, context) {
    const { mixer, clips, activeAction } = context;
    if (!mixer) return;

    const animationMap = {
      1: "Armature|Idle",
      2: "Armature|Walk",
      3: "Armature|Sprint",
      4: "Armature|Jump",
      5: "Armature|Grounded",
    };

    const animationToSet = animationMap[key];

    if (animationToSet && clips[animationToSet]) {
      context.currentClip = animationToSet;
      const newAction = clips[animationToSet];

      if (activeAction) {
        activeAction.fadeOut(0.3);
      }

      newAction.reset().fadeIn(0.3).play();
      context.activeAction = newAction;

      console.log(`Animation changed to: ${animationToSet}`);
    }
  }

  // Pickup system keys
  handlePickupKeys(key, context) {
    const { pickupManager, nearbyObject, scoreManager, soundEffects } = context;
    if (!pickupManager) return;

    const worker = document.querySelector("#worker");
    if (!worker) return;

    const workerPos = worker.getAttribute("position");

    // Pickup object (E key)
    if (key === "e" || key === "E") {
      if (
        nearbyObject &&
        !nearbyObject.isPickedUp &&
        !pickupManager.getPickedUpObject()
      ) {
        nearbyObject.pickup(workerPos);

        // Play pickup sound
        if (soundEffects) {
          soundEffects.playPickup();
        }

        // Remove from scene and add to score
        if (scoreManager && scoreManager.collectObject()) {
          pickupManager.removeObject(nearbyObject);
          console.log("Collected! Score:", scoreManager.getScore());

          // Check if collection complete
          const progress = scoreManager.getProgress();
          if (progress.collected >= progress.max) {
            setTimeout(() => {
              if (soundEffects) soundEffects.playSuccess();
            }, 300);
          }
        }
      }
    }

    // Drop object (Q key)
    if (key === "q" || key === "Q") {
      const heldObj = pickupManager.getPickedUpObject();
      if (heldObj) {
        heldObj.drop(workerPos);

        // Play drop sound
        if (soundEffects) {
          soundEffects.playDrop();
        }

        if (scoreManager) {
          scoreManager.returnObject();
          console.log("Returned object. Score:", scoreManager.getScore());
        }
      }
    }

    // Rest of your pickup keys...
    if (key === "n" || key === "N") {
      if (
        scoreManager &&
        pickupManager.objects.length < scoreManager.maxObjects
      ) {
        pickupManager.spawnObjectAtRandomLocation(
          workerPos.x,
          workerPos.z,
          3,
          false
        );
        console.log("Spawned new object");
      }
    }

    if (key === "r" || key === "R") {
      if (scoreManager) {
        scoreManager.reset();
        pickupManager.clear();
        for (let i = 0; i < scoreManager.maxObjects; i++) {
          pickupManager.spawnObjectAtRandomLocation(0, 0, 20, false);
        }
        console.log("Collection reset");
      }
    }
  }

  // Audio control keys
  handleAudioKeys(key, context) {
    const { audioManager, isNearPowerpuff, audioVisualizer3D } = context;
    if (!audioManager) return;

    // Play/Pause Audio (P key)
    if (key === "p" || key === "P") {
      if (!isNearPowerpuff) {
        console.log("Need to be near Powerpuff to activate music!");
        return;
      }

      if (audioManager.isPlaying()) {
        this.stopAudio(audioManager, audioVisualizer3D);
      } else {
        this.startAudio(audioManager, audioVisualizer3D);
      }
    }

    // Toggle audio source (M key)
    if (key === "m" || key === "M") {
      if (isNearPowerpuff) {
        audioManager.toggleSource();
        console.log(`Audio source toggled to: ${audioManager.getSource()}`);
      }
    }
  }

  // Flashlight keys
  handleLightKeys(key, context) {
    if (key === "f" || key === "F") {
      if (context.toggleFlashlight) {
        context.toggleFlashlight();
      }
    }
  }

  // Video control keys
  handleVideoKeys(key, context) {
    // Toggle hologram video (V key)
    if (key === "v" || key === "V") {
      const video = document.querySelector("#holoVideo");
      if (video) {
        if (video.paused) {
          video.play();
          console.log("Hologram video playing");
        } else {
          video.pause();
          console.log("Hologram video paused");
        }
      }
    }
  }

  // Debug keys
  handleDebugKeys(key, context) {
    // Log worker position (L key)
    if (key === "l" || key === "L") {
      const worker = document.querySelector("#worker");
      if (worker) {
        const pos = worker.getAttribute("position");
        const rot = worker.getAttribute("rotation");
        console.log("========== WORKER POSITION ==========");
        console.log(
          `Position: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(
            2
          )}, Z=${pos.z.toFixed(2)}`
        );
        console.log(`Rotation: Y=${rot.y.toFixed(2)}`);
        console.log("=====================================");
      }
    }

    // Toggle debug info (I key)
    if (key === "i" || key === "I") {
      const posOverlay = document.getElementById("positionOverlay");
      if (posOverlay) {
        posOverlay.style.display =
          posOverlay.style.display === "none" ? "block" : "none";
        console.log("Debug info toggled");
      }
    }
  }

  // Helper methods
  startAudio(audioManager, audioVisualizer3D) {
    audioManager.start();

    // Show visualization elements
    const bassSphere = document.querySelector("#bassSphere");
    const waveformPlane = document.querySelector("#waveformPlane");

    if (bassSphere) bassSphere.setAttribute("visible", "true");
    if (waveformPlane) waveformPlane.setAttribute("visible", "true");
    if (audioVisualizer3D) audioVisualizer3D.setVisible(true);

    console.log("Music started!");
    console.log(
      `Source: ${audioManager.getSource() === "mic" ? "Microphone" : "Music"}`
    );
  }

  stopAudio(audioManager, audioVisualizer3D) {
    audioManager.stop();

    // Hide visualization elements
    const bassSphere = document.querySelector("#bassSphere");
    const waveformPlane = document.querySelector("#waveformPlane");

    if (bassSphere) bassSphere.setAttribute("visible", "false");
    if (waveformPlane) waveformPlane.setAttribute("visible", "false");
    if (audioVisualizer3D) audioVisualizer3D.setVisible(false);

    console.log("Audio stopped");
  }

  // Get help text for all keys
  getKeyBindings() {
    return {
      Movement: {
        "W/↑": "Move forward",
        "S/↓": "Move backward",
        "A/←": "Move left",
        "D/→": "Move right",
      },
      "Pickup System": {
        E: "Pick up nearby object",
        Q: "Drop held object",
        N: "Spawn random shape",
        B: "Spawn random model",
      },
      "Audio/Video": {
        P: "Play/Pause music (near Powerpuff)",
        M: "Toggle mic/music source",
        V: "Play/Pause hologram video",
        F: "Toggle flashlight",
      },
      Animations: {
        1: "Idle animation",
        2: "Walk animation",
        3: "Sprint animation",
        4: "Jump animation",
        5: "Grounded animation",
      },
      Debug: {
        C: "Clear scene objects",
        L: "Log worker position",
        I: "Toggle debug info",
      },
    };
  }

  printHelp() {
    const bindings = this.getKeyBindings();
    console.log("========== KEY BINDINGS ==========");

    Object.entries(bindings).forEach(([category, keys]) => {
      console.log(`\n${category}:`);
      Object.entries(keys).forEach(([key, description]) => {
        console.log(`  ${key.padEnd(8)} - ${description}`);
      });
    });

    console.log("\n==================================");
  }
}
