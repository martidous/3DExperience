const CONFIG = {
  ANIMATION_SPEED: 0.02,
  SPAWN_INTERVAL: 2000,
  MAX_OBJECTS: 10,
};

const POSITIONS = {
  NEAR: { x: 0, y: 1.6, z: -2 },
  MID: { x: 0, y: 1.6, z: -5 },
  FAR: { x: 0, y: 1.6, z: -8 },
};

const CANVASTITLE={
  p5canvas:{name:"p5"},
  waveformCanvas:{name:"waveform"},
}
// Proximity Messages System
const proximityObjects = [
  {
    id: 'powerpuffModel',
    range: 3.5,
    message: 'Press P to play music and start audio visualization',
    showOnce: false,
    shown: false
  },
  {
    id: 'holoEmitterModel',
    range: 3.0,
    message: 'Press V to play the hologram video',
    showOnce: false,
    shown: false
  },
  {
    id: 'mountainFrame',
    range: 3.5,
    message: 'Mountain Lava Animation - Watch the volcanic eruption!',
    showOnce: true,
    shown: false
  },
  {
    id: 'egyptCanvas',
    range: 3.5,
    message: 'Desert Scene - Explore the Egypt view',
    showOnce: true,
    shown: false
  },
  {
    id: 'screen',
    range: 3.5,
    message: 'Parametric Curves - Mathematical beauty in motion',
    showOnce: true,
    shown: false
  }
];

// Energy Core Positions (20 total: 10 cultural + 10 exploration)
const ENERGY_CORE_POSITIONS = {
  // CULTURAL EXHIBIT CORES (10 cores placed near exhibits)
  cultural: [
    { x: 3.5, y: 1.5, z: 19.0, name: "Willie Station" },
    { x: 4.2, y: 1.5, z: 1.5, name: "Powerpuff Stage" },
    { x: -10.0, y: 2.0, z: 20.5, name: "Hologram Plaza" },
    { x: 7.0, y: 2.5, z: 3.2, name: "Mountain Gallery" },
    { x: -3.5, y: 1.5, z: -22.5, name: "Sunflower Garden" },
    { x: 5.5, y: 2.5, z: 10.2, name: "Math Art Hall" },
    { x: 6.5, y: 2.5, z: 1.8, name: "Audio Pavilion" },
    { x: -2.5, y: 1.5, z: 24.0, name: "Worker Commons" },
    { x: -5.0, y: 1.5, z: 16.0, name: "West Wing" },
    { x: 0.5, y: 1.5, z: 3.0, name: "Central Plaza" }
  ],

  // RANDOM EXPLORATION CORES - 10 
  exploration: [
    { x: -8.0, y: 1.5, z: -15.0, name: "North Garden" },
    { x: 12.0, y: 1.5, z: -10.0, name: "Northeast Path" },
    { x: 15.0, y: 1.5, z: 5.0, name: "East Courtyard" },
    { x: 10.0, y: 1.5, z: 15.0, name: "Southeast Corner" },
    { x: -15.0, y: 1.5, z: 8.0, name: "West Garden" },
    { x: -12.0, y: 1.5, z: -5.0, name: "Northwest Overlook" },
    { x: -5.0, y: 1.5, z: 28.0, name: "South Terrace" },
    { x: 8.0, y: 1.5, z: 22.0, name: "South Plaza" },
    { x: 0.0, y: 2.0, z: 10.0, name: "Central Tower" },
    { x: -3.0, y: 1.5, z: -8.0, name: "Hidden Alcove" }
  ]
};

// Energy core configuration 
const ENERGY_CORE_CONFIG = {
  glowColor: '#00FFFF',
  emissiveIntensity: 0.8,
  rotationSpeed: 0.01,
  floatAmplitude: 0.15,
  floatSpeed: 0.002
};

//staic positions 
const STATIC_OBJECT_ZONES = [
  { position: { x: 3, y: 1, z: 1 }, radius: 3.5, name: "Powerpuff/Audio Visualizer" },
  { position: { x: 2, y: 2.5, z: 19 }, radius: 4.0, name: "Willie Station" },
  { position: { x: -11, y: 3, z: 20 }, radius: 3.0, name: "Hologram Display" },
  { position: { x: 4.9, y: 3.0, z: 9.8 }, radius: 2.0, name: "Parametric Canvas" },
  { position: { x: -3.90, y: 1.3, z: -23.10 }, radius: 2.5, name: "Sunflower Canvas" },
  { position: { x: 6.4, y: 3.0, z: 3.5 }, radius: 2.5, name: "Mountain Frame" },
  { position: { x: 5, y: 3, z: -2.28 }, radius: 2.0, name: "Waveform Plane" },
  { position: { x: -1.7, y: 1, z: 25 }, radius: 1.5, name: "Worker Start Position" }
];

/**
 *
 * first left room wall
 * [Log] Position: X=-5.60, Y=1.00, Z=16.30
   [Log] Rotation: Y=180.00 (sketch.js, line 535)
 */
/**
 * 
 * Puff and worker
 * Position
 * Position: X=1.80, Y=1.00, Z=1.70
 */
/**
[Log] Village has NO animations (static model) 
[Log] ========== MODEL DIMENSIONS ========== 
[Log] Width (X): – "40.68" – "units" 
[Log] Height (Y): – "25.18" – "units" (
[Log] Depth (Z): – "96.28" – "units" 
[Log] Min corner: – "X:-20.34, Y:-1.07, Z:-62.70" 
[Log] Max corner: – "X:20.34, Y:24.11, Z:33.59" 
[Log] ========================================= 
 * 
 */
