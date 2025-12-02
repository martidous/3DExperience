let sceneManager;
let audioManager;
let pickupManager;
let keyManager;
let scoreManager;
let soundEffects;
let walkingSound;
let sceneReady = false;

// Willie
let willieCanvas;
let willieHologram;
let willieData;
let isNearWillie = false;
const willieProximityRange = 4.0;
// add some 3d Effect with music on the panel
let audioVisualizer3D;
// P5 Canvas for screen texture
let p5Canvas;
let desertCanvas;
let waveformCanvas;
let mountainCanvas;
let orbitCanvas;

// FFT Audio Visualization
let mathArt;
let isNearPowerpuff = false;
const powerpuffProximityRange = 3.5; // Distance to activate proximity indicator
let elvisAction = null;

// Voice Commands
let voiceCommands;
let voiceCommandsActive = false;
let voiceMovementActive = false;
let voiceMovementDirection = null; // 'forward', 'backward', 'left', 'right'

// Loading/Instructions Overlay
let overlayElement = null;
let loadingScreen = null;
let instructionsScreen = null;

let moveSpeed = 0.09;
let currentClip = "Armature|Idle"; // current animation clip of worker
let mixer = null; // three js mixer , aframe was having issues
let clips = {}; // the array of actions
let activeAction = null; // currently active action

// Pickup system
//let heldObject = null; // The object currently being held DELETE
let nearbyObject = null; // The closest object in range
//let pickupRange = 2; // Distance to pick up objects// DELETE changed it

// INITIALIZE THE SCENE
function loadSceneContent() {
  const scene = document.querySelector("a-scene");
  if (!scene) {
    console.error("A-Frame scene not found");
    return;
  }
  console.log("Scene loaded!");
  sceneManager = new SceneManager(scene);
  sceneReady = true;
  DebugHelpers.logModelInfo("#villageScene", "Village");
  // Log available animations and set initial animation
  setupWorker();
  setupPowerpuff();
  setupElvisAnimation();
  setupNeonSaxophone();
  setupWillie();

  // Initialize systems (10 for testing, change back to 20 later)
  scoreManager = new ScoreManager(10);
  pickupManager = new PickupManager(new ColorPalette());

  // Spawn all 20 energy cores
  pickupManager.spawnAllEnergyCores();

  console.log(` Spawned ${pickupManager.objects.length} energy cores`);
  console.log("Energy core collection game ready!");

  // Validate correct count
  if (pickupManager.objects.length !== 20) {
    console.error(
      `ERROR: Expected 20 cores, but spawned ${pickupManager.objects.length}`
    );
    console.log("Cultural cores:", ENERGY_CORE_POSITIONS.cultural.length);
    console.log("Exploration cores:", ENERGY_CORE_POSITIONS.exploration.length);
  }

  console.log("Scene initialization complete");
  console.log("sceneReady set to:", sceneReady);

  // load instructions
  transitionToInstructions();
  setTimeout(() => {
    const neonSax = document.querySelector("#neonSaxophone");
    if (neonSax) {
      neonSax.addEventListener("model-loaded", () => {
        console.log("✅ Neon saxophone loaded");
        const mesh = neonSax.getObject3D("mesh");

        if (mesh) {
          // Traverse all materials and enable emissive glow
          mesh.traverse((node) => {
            if (node.isMesh && node.material) {
              console.log("Processing node:", node.name);

              // Enable emissive for neon glow
              node.material.emissive = new THREE.Color(0xff00ff); // Magenta/pink neon
              node.material.emissiveIntensity = 2.0;

              // Make it glow even more
              node.material.toneMapped = false;

              // If it has a specific emissive map, increase its intensity
              if (node.material.emissiveMap) {
                node.material.emissiveIntensity = 3.0;
              }

              node.material.needsUpdate = true;
            }
          });
        }
      });
    }
  }, 2000);
  // Load music AFTER scene is loaded
  setTimeout(() => {
    if (audioManager) {
      console.log("Loading music file now ");
      audioManager.loadMusic("assets/music.mp3");
    }
  }, 1000);
  if (audioManager) {
    setupAudioVisualizer();
  } else {
    console.error("audioManager not initialized before setupAudioVisualizer!");
  }
}

// ============================================
// WORKER CHARACTER SETUP
// ============================================
function setupWorker() {
  const worker = document.querySelector("#worker");
  if (!worker) {
    console.warn("Worker element not found!");
    return;
  }
  worker.addEventListener("model-loaded", () => {
    const model = worker.getObject3D("mesh");
    // Set initial animation
    worker.setAttribute("animation-mixer", "clip: Armature|Idle; loop: repeat");
    console.log("Worker model loaded and animation set");
  });
}
// ============================================
// POWERPUFF SETUP
// ============================================
function setupPowerpuff() {
  const powerpuff = document.querySelector("#powerpuffModel");
  if (!powerpuff) {
    console.warn("Powerpuff element not found!");
    return;
  }

  powerpuff.addEventListener("model-loaded", () => {
    console.log("Powerpuff model loaded event triggered");
    const model = powerpuff.getObject3D("mesh");
    console.log("Powerpuff model object:", model);

    if (model && model.animations && model.animations.length > 0) {
      // Create mixer and play animation manually
      const powerpuffMixer = new THREE.AnimationMixer(model);
      const action = powerpuffMixer.clipAction(model.animations[0]);
      action.setLoop(THREE.LoopRepeat);
      action.play();

      // Update mixer in draw loop
      window.powerpuffMixer = powerpuffMixer;

      console.log("Powerpuff animation started");
    } else {
      console.warn("No animations found in Powerpuff model");
      console.log("Model:", model);
      console.log("Animations:", model ? model.animations : "model is null");
    }
  });
}

// Setup Elvis animation
function setupElvisAnimation() {
  const elvis = document.querySelector("#elvisModel");
  if (!elvis) {
    console.warn("Elvis element not found!");
    return;
  }

  elvis.addEventListener("model-loaded", () => {
    console.log("Elvis model loaded event triggered");
    const model = elvis.getObject3D("mesh");
    console.log("Elvis model object:", model);

    if (model && model.animations && model.animations.length > 0) {
      // Create mixer and play animation manually
      const elvisMixer = new THREE.AnimationMixer(model);
      const action = elvisMixer.clipAction(model.animations[0]);
      action.setLoop(THREE.LoopRepeat);
      action.play();

      // Update mixer in draw loop
      window.elvisMixer = elvisMixer;
      elvisAction = action;
      elvis.setAttribute("animation-mixer", "clip: *; loop: repeat");

      console.log("Elvis animation started - The King is dancing!");
    } else {
      console.warn("No animations found in Elvis model");
      console.log("Model:", model);
      console.log("Animations:", model ? model.animations : "model is null");
    }
  });
}

// Setup Neon Saxophone
function setupNeonSaxophone() {
  const neonSax = document.querySelector("#neonSaxophone");
  if (!neonSax) {
    console.warn("Neon Saxophone element not found!");
    return;
  }

  console.log("Neon Saxophone element found, waiting for model to load...");

  neonSax.addEventListener("model-loaded", () => {
    console.log("✅ Neon Saxophone model loaded!");
    const model = neonSax.getObject3D("mesh");
    console.log("Saxophone model object:", model);

    if (model) {
      // Log bounding box to understand model size
      const bbox = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      console.log("Saxophone model size:", size);
      console.log("Saxophone bounding box:", bbox);

      // Make sure it's visible
      model.traverse((child) => {
        if (child.isMesh) {
          console.log("Saxophone mesh found:", child);
          child.visible = true;
          if (child.material) {
            child.material.visible = true;
            // Add emissive glow for neon effect
            if (!child.material.emissive) {
              child.material.emissive = new THREE.Color(0xff00ff);
            }
            child.material.emissiveIntensity = 2;
            child.material.needsUpdate = true;
          }
        }
      });

      console.log("Neon Saxophone setup complete!");
    } else {
      console.error("❌ Saxophone model object is null!");
    }
  });

  neonSax.addEventListener("model-error", (error) => {
    console.error("❌ Error loading Neon Saxophone model:", error);
  });
}
// ===========================================
// AUDDIO VIDUALIZER
// later move to config or constants
// ===========================================
function setupAudioVisualizer() {
  audioVisualizer3D = new AudioVisualizer3D({ x: 3, y: 1, z: 1 }, audioManager);
  // initially hide
  audioVisualizer3D.setVisible(false);
}
function drawAudioVisualizer() {
  if (audioVisualizer3D && audioManager.isPlaying()) {
    audioVisualizer3D.update();
  }
}
// ============================================
// CHARACTER MOVEMENT & ANIMATION
// ============================================
function updateCharacterMovement() {
  const worker = document.querySelector("#worker");
  if (!worker) return;

  // Initialize mixer
  if (!mixer) {
    const model = worker.getObject3D("mesh");
    if (model && model.animations && model.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      model.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        clips[clip.name] = action;
      });
      if (clips["Armature|Idle"]) {
        activeAction = clips["Armature|Idle"]; // get the clip
        activeAction.play();
      }
    }
  }
  const pos = worker.getAttribute("position");
  const rot = worker.getAttribute("rotation");
  let newClip = "Armature|Idle";

  // WASD and Arrow controls
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    pos.z -= moveSpeed;
    rot.y = 180;
    newClip = "Armature|Walk";
  } else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    pos.z += moveSpeed;
    rot.y = 0;
    newClip = "Armature|Sprint";
  } else if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    pos.x -= moveSpeed;
    rot.y = 270;
    newClip = "Armature|Jump";
  } else if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    pos.x += moveSpeed;
    rot.y = 90;
    newClip = "Armature|Grounded";
  }
  worker.setAttribute("position", pos);
  worker.setAttribute("rotation", rot);

  // Change animation if needed
  if (mixer && newClip !== currentClip && clips[newClip]) {
    currentClip = newClip;
    const newAction = clips[newClip];
    if (activeAction) {
      activeAction.fadeOut(0.3);
    }
    newAction.reset().fadeIn(0.3).play();
    activeAction = newAction;
  }

  // Update mixer
  if (mixer) {
    mixer.update(0.016);
  }

  // Update Powerpuff mixer
  if (window.powerpuffMixer) {
    window.powerpuffMixer.update(0.016);
  }

  // Update Elvis mixer
  if (window.elvisMixer) {
    window.elvisMixer.update(0.016);
    if (elvisAction && !elvisAction.isRunning()) {
      elvisAction.reset().play();
    }
  }
}

// ============================================
// VOICE COMMAND MOVEMENT HELPER
// ============================================
function startVoiceMovement(direction) {
  voiceMovementActive = true;
  voiceMovementDirection = direction;
  console.log(`Started continuous movement: ${direction}`);
}

function stopVoiceMovement() {
  voiceMovementActive = false;
  voiceMovementDirection = null;
  console.log("Stopped voice movement");

  // Return to idle animation
  if (mixer && clips["Armature|Idle"]) {
    currentClip = "Armature|Idle";
    const newAction = clips["Armature|Idle"];
    if (activeAction && activeAction !== newAction) {
      activeAction.fadeOut(0.3);
    }
    newAction.reset().fadeIn(0.3).play();
    activeAction = newAction;
  }
}

function updateVoiceMovement() {
  if (!voiceMovementActive || !voiceMovementDirection) return;

  const worker = document.querySelector("#worker");
  if (!worker) return;

  const pos = worker.getAttribute("position");
  const rot = worker.getAttribute("rotation");

  // Apply movement based on current direction
  switch (voiceMovementDirection) {
    case "forward":
      pos.z -= moveSpeed;
      rot.y = 180;
      break;
    case "backward":
      pos.z += moveSpeed;
      rot.y = 0;
      break;
    case "left":
      pos.x -= moveSpeed;
      rot.y = 270;
      break;
    case "right":
      pos.x += moveSpeed;
      rot.y = 90;
      break;
  }

  worker.setAttribute("position", pos);
  worker.setAttribute("rotation", rot);

  // Trigger walk animation
  if (mixer && clips["Armature|Walk"]) {
    if (currentClip !== "Armature|Walk") {
      currentClip = "Armature|Walk";
      const newAction = clips["Armature|Walk"];
      if (activeAction && activeAction !== newAction) {
        activeAction.fadeOut(0.3);
      }
      newAction.reset().fadeIn(0.3).play();
      activeAction = newAction;
    }
  }
}
// ============================================
// CAMERA FOLLOW SYSTEM
// ============================================
function updateCamera() {
  const worker = document.querySelector("#worker");
  const camera = document.querySelector("[camera]");
  if (!worker || !camera) return;

  const pos = worker.getAttribute("position");
  const camPos = camera.getAttribute("position");
  camPos.x = pos.x;
  camPos.z = pos.z + 3;
  camera.setAttribute("position", camPos);
}
// ============================================
// PICKUP SYSTEM
// ============================================
// Replace the existing updatePickupSystem() function with this:
function updatePickupSystem() {
  const worker = document.querySelector("#worker");
  if (!worker || !pickupManager) return;

  const workerPos = worker.getAttribute("position");
  const workerRot = worker.getAttribute("rotation");

  // nearest object
  nearbyObject = pickupManager.findNearestObject(workerPos);

  // Highlight object
  pickupManager.objects.forEach((obj) => {
    obj.highlight(obj === nearbyObject && !obj.isPickedUp);
  });

  // Update held object position
  const heldObj = pickupManager.getPickedUpObject();
  if (heldObj) {
    heldObj.updatePosition(workerPos, workerRot.y);
  }
}
// ============================================
// POWERPUFF PROXIMITY DETECTION
// ============================================
function checkPowerpuffProximity() {
  const worker = document.querySelector("#worker");
  const powerpuff = document.querySelector("#powerpuffModel");

  if (!worker || !powerpuff) return;

  const workerPos = worker.getAttribute("position");
  const powerpuffPos = powerpuff.getAttribute("position");

  // Calculate 2D distance X-Z plane
  const distance = Math.sqrt(
    Math.pow(workerPos.x - powerpuffPos.x, 2) +
      Math.pow(workerPos.z - powerpuffPos.z, 2)
  );

  const wasNear = isNearPowerpuff;
  isNearPowerpuff = distance < powerpuffProximityRange;

  //Change to actaual display later
  if (isNearPowerpuff && !wasNear) {
    console.log("Near Powerpuff! Press P to play music");
  }

  // Subtle pulse effect on Powerpuff when player is near
  if (isNearPowerpuff) {
    const pulseScale = 0.05 + Math.sin(Date.now() * 0.003) * 0.005;
    powerpuff.setAttribute(
      "scale",
      `${pulseScale} ${pulseScale} ${pulseScale}`
    );
  } else if (wasNear && !isNearPowerpuff) {
    // Reset scale when leaving
    powerpuff.setAttribute("scale", "0.05 0.05 0.05");
  }
}
//=============================================
// WILLIE PROXIMITY DETECTION
//=============================================
function checkWillieProximity() {
  if (!sceneReady) return; // Don't check until scene is ready

  const worker = document.querySelector("#worker");
  const willieStation = document.querySelector("#willieStation");
  const speechBubble = document.querySelector("#willieSpeechBubble");

  if (!worker || !willieStation || !speechBubble) return;

  const workerPos = worker.getAttribute("position");
  const williePos = willieStation.getAttribute("position");

  const distance = Math.sqrt(
    Math.pow(workerPos.x - williePos.x, 2) +
      Math.pow(workerPos.z - williePos.z, 2)
  );

  const wasNearWillie = isNearWillie;
  isNearWillie = distance < willieProximityRange;

  // Show/hide speech bubble based on proximity
  speechBubble.setAttribute("visible", isNearWillie);

  // Log when entering/leaving Willie's area
  if (isNearWillie && !wasNearWillie) {
    console.log("Approached Willie - speech bubble shown");
  } else if (!isNearWillie && wasNearWillie) {
    console.log("Left Willie - speech bubble hidden");
  }
}
// ============================================
// PROXIMITY MESSAGES
// ============================================
function checkProximityMessages() {
  const worker = document.querySelector("#worker");
  if (!worker) return;

  const workerPos = worker.getAttribute("position");
  let closestMessage = null;
  let closestDistance = Infinity;

  proximityObjects.forEach((obj) => {
    // Skip if already shown and showOnce is true
    if (obj.showOnce && obj.shown) return;

    const entity = document.querySelector(`#${obj.id}`);
    if (!entity) return;

    const entityPos = entity.getAttribute("position");
    const distance = Math.sqrt(
      Math.pow(workerPos.x - entityPos.x, 2) +
        Math.pow(workerPos.z - entityPos.z, 2)
    );

    if (distance < obj.range && distance < closestDistance) {
      closestDistance = distance;
      closestMessage = obj;
    }
  });

  if (closestMessage) {
    showProximityMessage(closestMessage.message);
    if (closestMessage.showOnce) {
      closestMessage.shown = true;
    }
  } else {
    hideProximityMessage();
  }
}

function showProximityMessage(message) {
  const messageEl = document.getElementById("proximityMessage");
  const textEl = document.getElementById("messageText");

  if (messageEl && textEl) {
    textEl.textContent = message;
    messageEl.classList.add("visible");
  }
}

function hideProximityMessage() {
  const messageEl = document.getElementById("proximityMessage");
  if (messageEl) {
    messageEl.classList.remove("visible");
  }
}

// ============================================
// FFT AUDIO VISUALIZATION
// ============================================
function updateFFTVisualization() {
  if (!audioManager || !audioManager.isPlaying()) return;

  // Update audio analysis
  audioManager.update();

  // Update bass sphere
  const bassSphere = document.querySelector("#bassSphere");
  if (bassSphere) {
    const bassScale = 0.5 + audioManager.bass * 1.0; // Scale 0.5 to 1.5
    bassSphere.setAttribute("scale", `${bassScale} ${bassScale} ${bassScale}`);

    const intensity = 1.5 + audioManager.bass * 2.0;
    bassSphere.setAttribute("material", {
      emissive: "#00FFFF",
      emissiveIntensity: intensity,
      opacity: 0.5,
      transparent: true,
    });

    if (frameCount % 60 === 0) {
      console.log(
        "Bass:",
        audioManager.bass,
        "Scale:",
        bassScale,
        "Visible:",
        bassSphere.getAttribute("visible")
      );
    }
  }

  // Draw waveform visualization
  drawWaveform();
}

function drawWaveform() {
  const waveformPlane = document.querySelector("#waveformPlane");
  if (!waveformPlane) {
    console.log("Waveform plane not found!");
    return;
  }
  // Clear canvas// Transparent background
  waveformCanvas.background(0, 0, 0, 0);
  // Get waveform data
  const points = audioManager.getWaveformPoints(64);
  // Debug:  COMMENT WHEN LIVE Log waveform state occasionally
  // Can change to a trigger on to debug mode
  if (frameCount % 60 === 0) {
    console.log(
      "Waveform visible:",
      waveformPlane.getAttribute("visible"),
      "Points:",
      points.length
    );
  }

  // Draw circular waveform
  waveformCanvas.push();
  waveformCanvas.translate(256, 256);
  waveformCanvas.noFill();
  waveformCanvas.strokeWeight(3);
  // Multiple rings for depth effect
  const rings = 3;
  for (let ring = 0; ring < rings; ring++) {
    const baseRadius = 80 + ring * 40;
    const colorHue = (ring * 50 + frameCount * 0.5) % 360;

    waveformCanvas.colorMode(HSB, 360, 100, 100);
    waveformCanvas.stroke(colorHue, 80, 100);

    waveformCanvas.beginShape();
    for (let i = 0; i < points.length; i++) {
      const angle = (i / points.length) * TWO_PI;
      const waveValue = points[i];
      const radius = baseRadius + waveValue * 50 * (ring + 1);

      const x = cos(angle) * radius;
      const y = sin(angle) * radius;
      waveformCanvas.vertex(x, y);
    }
    waveformCanvas.endShape(CLOSE);
  }

  waveformCanvas.pop();

  // Apply canvas to plane texture
  const canvasEl = waveformCanvas.elt;
  const mesh = waveformPlane.getObject3D("mesh");

  if (mesh && mesh.material) {
    // Create or update the canvas texture
    if (!mesh.material.map || mesh.material.map.image !== canvasEl) {
      mesh.material.map = new THREE.CanvasTexture(canvasEl);
      mesh.material.map.minFilter = THREE.LinearFilter;
      mesh.material.map.magFilter = THREE.LinearFilter;
    }
    mesh.material.map.needsUpdate = true;
    mesh.material.needsUpdate = true;
  }
}
// ============================================
// POSITION DISPLAY
// ============================================
function displayWorkerPosition() {
  const worker = document.querySelector("#worker");
  if (!worker) return;
  // current visitor position and rotation
  const pos = worker.getAttribute("position");
  const rot = worker.getAttribute("rotation");

  // Update HTML overlay elements
  const posXEl = document.getElementById("posX");
  const posYEl = document.getElementById("posY");
  const posZEl = document.getElementById("posZ");
  const posRotEl = document.getElementById("posRot");

  if (posXEl) posXEl.textContent = pos.x.toFixed(2);
  if (posYEl) posYEl.textContent = pos.y.toFixed(2);
  if (posZEl) posZEl.textContent = pos.z.toFixed(2);
  if (posRotEl) posRotEl.textContent = rot.y.toFixed(0) + "°";
}
// ============================================
// P5 CANVAS CONTENT
// ============================================
function drawCanvasContent() {
  // Draw to first canvas
  p5Canvas.background(0, 0, 0);
  mathArt.drawParametricSinCurve(p5Canvas, 256, 256);
  // Draw desert scene (no background clear - scene draws its own sky)
  mathArt.drawDesertScene(desertCanvas);
  // Draw mountain/lava/smoke animation
  mathArt.drawUpwardLavaCanvas(mountainCanvas);
  orbitCanvas.background(0, 0, 0, 30); // Slight fade for trail effect
  mathArt.drawOrbit(orbitCanvas);
}
// ============================================
// SCREEN TEXTURE UPDATE// Set the p5js
// ============================================
function updateOrbitTexture() {
  const screen = document.querySelector("#orbitCanvas");
  if (screen && orbitCanvas) {
    const canvasEl = orbitCanvas.elt;
    screen.setAttribute("material", "src", canvasEl); // Add this line!

    const mesh = screen.getObject3D("mesh");
    if (mesh && mesh.material && mesh.material.map) {
      mesh.material.map.needsUpdate = true;
    }
  }
}
function updateScreenTexture() {
  const screen = document.querySelector("#screen");
  if (screen && p5Canvas) {
    const canvasEl = p5Canvas.elt;
    screen.setAttribute("material", "src", canvasEl);

    // Tell Three.js the texture needs updating
    const mesh = screen.getObject3D("mesh");
    if (mesh && mesh.material && mesh.material.map) {
      mesh.material.map.needsUpdate = true;
    }
  }
}
function updateDesertTexture() {
  const screen = document.querySelector("#egyptCanvas");
  if (screen && desertCanvas) {
    const canvasEl = desertCanvas.elt;
    screen.setAttribute("material", "src", canvasEl);

    // Tell Three.js the texture needs updating
    const mesh = screen.getObject3D("mesh");
    if (mesh && mesh.material && mesh.material.map) {
      mesh.material.map.needsUpdate = true;
    }
  }
}
function updateMountainTexture() {
  const screen = document.querySelector("#mountainPattern");
  if (screen && mountainCanvas) {
    const canvasEl = mountainCanvas.elt;
    screen.setAttribute("material", "src", canvasEl);

    // Tell Three.js the texture needs updating
    const mesh = screen.getObject3D("mesh");
    if (mesh && mesh.material && mesh.material.map) {
      mesh.material.map.needsUpdate = true;
    }
  }
}
function updateWillieTexture() {
  // Check if Willie hologram exists and sprites are loaded
  if (!willieHologram || !willieCanvas) return;

  if (
    !willieHologram.spriteFrames ||
    Object.keys(willieHologram.spriteFrames).length === 0
  ) {
    return; // Sprites not loaded yet
  }

  // Clear canvas with transparent background
  willieCanvas.clear();

  // Add hologram glow effect
  willieCanvas.push();

  // Outer glow
  willieCanvas.fill(0, 200, 255, 30);
  willieCanvas.noStroke();
  willieCanvas.ellipse(256, 256, 400, 400);

  // Inner glow
  willieCanvas.fill(0, 200, 255, 50);
  willieCanvas.ellipse(256, 256, 300, 300);

  willieCanvas.pop();

  // Update Willie animation
  willieHologram.update(isNearWillie);

  // Draw Willie sprite
  willieHologram.draw(willieCanvas);

  // Add hologram scanlines
  willieCanvas.push();
  willieCanvas.stroke(0, 200, 255, 40);
  willieCanvas.strokeWeight(1);
  for (let i = 0; i < 512; i += 4) {
    willieCanvas.line(0, i, 512, i);
  }
  willieCanvas.pop();

  // Apply texture to A-Frame element
  const willieScreen = document.querySelector("#willieScreen");
  if (willieScreen) {
    const canvasEl = willieCanvas.elt;
    const mesh = willieScreen.getObject3D("mesh");

    if (mesh && mesh.material) {
      if (!mesh.material.map || mesh.material.map.image !== canvasEl) {
        mesh.material.map = new THREE.CanvasTexture(canvasEl);
        mesh.material.map.minFilter = THREE.LinearFilter;
        mesh.material.map.magFilter = THREE.LinearFilter;
      }
      mesh.material.map.needsUpdate = true;
      mesh.material.transparent = true;
      mesh.material.needsUpdate = true;
    }
  }
}
// HANDDLE WALKING SOUND
function handleWalkingSound() {
  // Handle walking sound based on animation
  if (soundEffects && currentClip) {
    const isWalking =
      currentClip === "Armature|Walk" ||
      currentClip === "Armature|Sprint" ||
      currentClip === "Armature|Jump" ||
      currentClip === "Armature|Grounded";

    if (isWalking) {
      soundEffects.startWalking();
    } else {
      soundEffects.stopWalking();
    }
  }
}
//=================================================
// ================= SET UP WILLIE  ===============
// ==============================================
function setupWillie() {
  willieHologram = new WillieHologram(256, 256, willieData);
  willieHologram.preloadSprites();
  console.log("Willie hologram initialized");
}

//=======================

//                DRAW AND SETUP .
//  Could use regualr JS but for this need P5 to manage
// =============================================================================

function preload() {
  walkingSound = loadSound("assets/walking.mp3");
  // pickupSound = loadSound('assets/sounds/pickup.mp3');
  // dropSound = loadSound('assets/sounds/drop.mp3');
  // successSound = loadSound('assets/sounds/success.mp3');
  willieData = loadJSON("assets/sprites/sbw/data.json");
  console.log("Preloading sounds...");
}

function setup() {
  initializeOverlayElements();
  initializeGraphics();
  initializeMathArt();
  initializeAudioSystems();
  initializeManagers();
  initializeVoiceCommands();
  setupSceneListener();
}

// ============================================
// SETUP HELPER FUNCTIONS
// ============================================

function initializeOverlayElements() {
  overlayElement = document.getElementById("overlay");
  loadingScreen = document.getElementById("loadingScreen");
  instructionsScreen = document.getElementById("instructionsScreen");
}

function initializeGraphics() {
  // Create graphics buffers for screen textures (512x512 is power of 2)
  p5Canvas = createGraphics(512, 512);
  desertCanvas = createGraphics(512, 512);
  waveformCanvas = createGraphics(512, 512);
  mountainCanvas = createGraphics(512, 512);
  willieCanvas = createGraphics(512, 512);
  orbitCanvas = createGraphics(400, 400);

  // Initial clear for canvases
  desertCanvas.background(0, 0, 0);
  orbitCanvas.background(0, 0, 0);
  mountainCanvas.background(0, 70, 0);
}

function initializeMathArt() {
  mathArt = new MathArt();
}

function initializeAudioSystems() {
  // Initialize audio manager
  audioManager = new AudioManager();
  audioManager.init();

  // Initialize sound effects
  soundEffects = new SoundEffects();
  soundEffects.init();

  // Assign preloaded walking sound
  if (walkingSound) {
    soundEffects.sounds.customWalking = walkingSound;
    soundEffects.sounds.customWalking.setLoop(true);
    soundEffects.sounds.customWalking.setVolume(0.3);
    soundEffects.useCustomSounds = true;
    console.log("Walking sound ready");
  }
}

function initializeManagers() {
  keyManager = new KeyManager();
}

function initializeVoiceCommands() {
  voiceCommands = new VoiceCommandManager();
  const initialized = voiceCommands.init();

  if (!initialized) {
    console.warn("Voice commands not available in this browser");
    return;
  }

  // Register command handlers for continuous movement
  voiceCommands.onCommand("forward", () => startVoiceMovement("forward"));
  voiceCommands.onCommand("backward", () => startVoiceMovement("backward"));
  voiceCommands.onCommand("left", () => startVoiceMovement("left"));
  voiceCommands.onCommand("right", () => startVoiceMovement("right"));
  voiceCommands.onCommand("stop", () => stopVoiceMovement());

  console.log("Voice commands initialized - Press R to activate");
}

function setupSceneListener() {
  const scene = document.querySelector("a-scene");

  if (!scene) {
    console.error("A-Frame scene not found");
    return;
  }

  console.log("Waiting for A-Frame scene to load...");

  if (scene.hasLoaded) {
    console.log("Scene was already loaded, initializing now...");
    loadSceneContent();
  } else {
    console.log("Adding scene loaded listener...");
    scene.addEventListener(
      "loaded",
      () => {
        console.log("Scene loaded event fired!");
        loadSceneContent();
      },
      { once: true }
    );
  }
}
// ============================================
// MAIN DRAW LOOP
// ============================================
function draw() {
  if (!sceneReady) {
    // DEGUB- Check if draw loop is running
    if (frameCount % 60 === 0) {
      // console.log('Draw loop waiting for scene... frameCount:', frameCount);
    }
    return;
  }

  sceneManager.update();
  // update pickupmanager
  if (pickupManager) {
    pickupManager.update();
  }
  handleWalkingSound();
  updateCharacterMovement();
  updateVoiceMovement();
  updateCamera();
  updatePickupSystem();
  checkPowerpuffProximity();
  checkWillieProximity();
  checkProximityMessages();
  updateFFTVisualization();
  drawCanvasContent();
  displayWorkerPosition();
  updateScreenTexture();
  updateDesertTexture();
  updateMountainTexture();
  updateOrbitTexture();
  updateWillieTexture();
  drawAudioVisualizer();
}
//=============================================
// USER ACTIONS
//=============================================
function mousePressed() {}

function keyPressed() {
  const context = {
    sceneManager,
    audioManager,
    pickupManager,
    scoreManager,
    soundEffects,
    audioVisualizer3D,
    nearbyObject,
    isNearPowerpuff,
    mixer,
    clips,
    activeAction,
    currentClip,
  };

  keyManager.handleKeyPress(key, context);

  currentClip = context.currentClip;
  activeAction = context.activeAction;

  if (key === "h" || key === "H") {
    toggleHelp();
  }

  // Voice command toggle
  if (key === "r" || key === "R") {
    if (!voiceCommands) {
      console.warn("Voice commands not initialized");
      return;
    }

    if (!voiceCommandsActive) {
      voiceCommands.start();
      voiceCommandsActive = true;
      console.log(
        '🎤 Voice commands activated - say "forward", "back", "left", "right"'
      );
    } else {
      voiceCommands.stop();
      voiceCommandsActive = false;
      console.log("Voice commands deactivated");
    }
  }

  // Credits toggle
  if (key === "c" || key === "C") {
    toggleCredits();
  }
}
// ============================================
// LOADING/INSTRUCTIONS OVERLAY CONTROL
// ============================================
function transitionToInstructions() {
  if (!loadingScreen || !instructionsScreen) return;

  console.log("Transitioning to instructions screen...");
  loadingScreen.classList.remove("active");
  instructionsScreen.classList.add("active");

  // Setup start button listener
  const startButton = document.getElementById("startButton");
  if (startButton) {
    startButton.addEventListener("click", startExperience, { once: true });
  }
}

function startExperience() {
  if (!overlayElement) return;
  overlayElement.classList.add("fade-out");
  // fade out after
  setTimeout(() => {
    overlayElement.style.display = "none";
    console.log("Experience started!");
  }, 500);
}

// ============================================
// HELP OVERLAY CONTROL
// ============================================
function toggleHelp() {
  const helpOverlay = document.getElementById("helpOverlay");
  if (!helpOverlay) {
    console.warn("Help overlay not found");
    return;
  }

  if (helpOverlay.style.display === "none") {
    helpOverlay.style.display = "flex";
    console.log("❓ Help opened");
  } else {
    helpOverlay.style.display = "none";
    console.log("Help closed");
  }
}

// ============================================
// CREDITS OVERLAY CONTROL
// ============================================
function toggleCredits() {
  const creditsOverlay = document.getElementById("creditsOverlay");
  if (!creditsOverlay) {
    console.warn("Credits overlay not found");
    return;
  }

  if (creditsOverlay.style.display === "none") {
    creditsOverlay.style.display = "block";
    console.log("📜 Credits opened");
  } else {
    creditsOverlay.style.display = "none";
    console.log("Credits closed");
  }
}
