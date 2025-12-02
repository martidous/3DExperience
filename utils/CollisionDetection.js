/**
 * Collision Detection Utility
 * Validates if a position is safe (doesn't conflict with static objects)
 */

/**
 * Check if a position is safe from collisions with static objects
 * @param {Object} pos - Position to check {x, y, z}
 * @param {number} minDistance - Minimum safe distance from objects (default 2.5)
 * @returns {Object} - {safe: boolean, conflictsWith: string|null}
 */
function isPositionSafe(pos, minDistance = 2.5) {
  // Check against all static object zones
  for (const zone of STATIC_OBJECT_ZONES) {
    const dx = pos.x - zone.position.x;
    const dy = pos.y - zone.position.y;
    const dz = pos.z - zone.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < (zone.radius + minDistance)) {
      return {
        safe: false,
        conflictsWith: zone.name,
        distance: distance.toFixed(2),
        minRequired: (zone.radius + minDistance).toFixed(2)
      };
    }
  }

  return { safe: true, conflictsWith: null };
}

/**
 * Get all positions that would conflict with a given position
 * @param {Object} pos - Position to check {x, y, z}
 * @param {number} minDistance - Minimum safe distance
 * @returns {Array} - Array of conflict objects
 */
function getAllConflicts(pos, minDistance = 2.5) {
  const conflicts = [];

  for (const zone of STATIC_OBJECT_ZONES) {
    const dx = pos.x - zone.position.x;
    const dy = pos.y - zone.position.y;
    const dz = pos.z - zone.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < (zone.radius + minDistance)) {
      conflicts.push({
        name: zone.name,
        distance: distance.toFixed(2),
        minRequired: (zone.radius + minDistance).toFixed(2)
      });
    }
  }

  return conflicts;
}

/**
 * Validate all energy core positions against static objects
 * Logs warnings for any conflicts
 */
function validateAllEnergyCorePositions() {
  console.log('🔍 Validating energy core positions...');

  let conflictCount = 0;
  const allPositions = [
    ...ENERGY_CORE_POSITIONS.cultural,
    ...ENERGY_CORE_POSITIONS.exploration
  ];

  allPositions.forEach((corePos, index) => {
    const result = isPositionSafe(corePos, 2.0); // Slightly smaller buffer for cores

    if (!result.safe) {
      conflictCount++;
      console.warn(
        `Core "${corePos.name}" at (${corePos.x}, ${corePos.y}, ${corePos.z}) ` +
        `conflicts with "${result.conflictsWith}" ` +
        `(distance: ${result.distance}, min required: ${result.minRequired})`
      );
    }
  });

  if (conflictCount === 0) {
    console.log('✅ All 20 energy core positions are safe!');
  } else {
    console.log(`⚠️ Found ${conflictCount} potential conflicts`);
  }

  return conflictCount;
}
