class ColorPalette {
  constructor() {
    this.vibrantColors = [
      "#E0FF70", // Bright Yellow-Green (was lime green)
      "#FF1744", // Vivid Red-Pink (was dark pink)
      "#FF6B9D", // Hot Pink (was light salmon)
      "#00D9FF", // Bright Cyan (was sky blue)
      "#6C5CE7", // Bright Purple (was dark purple)
      "#00B8FF", // Electric Blue (was blue)
      "#00FFC8", // Bright Aqua (was turquoise)
      "#FFC107", // Bright Amber (was orange)
      "#FF3D3D", // Bright Red (was red)
      "#00FF85", // Neon Green (was green)
    ];
  }

  getRandom() {
    return random(this.vibrantColors);
  }

  getGradient(index1, index2) {
    return [this.vibrantColors[index1], this.vibrantColors[index2]];
  }
}
