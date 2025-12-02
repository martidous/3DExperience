class DebugHelpers {
  static logModelInfo(selector, modelName) {
    const model = document.querySelector(selector);
    if (!model) {
      console.warn(`${modelName} element not found with selector: ${selector}`);
      return;
    }

    model.addEventListener("model-loaded", () => {
      const mesh = model.getObject3D("mesh");
      console.log(`Model Info (${modelName}):`, mesh);
      console.log(`========== ${modelName.toUpperCase()} MODEL INFO ==========`);
      
      // Check for animations
      if (mesh && mesh.animations && mesh.animations.length > 0) {
        console.log(`${modelName} has animations!`);
        console.log("Animation names:", mesh.animations.map((a) => a.name));
        console.log("Animation count:", mesh.animations.length);
      } else {
        console.log(`${modelName} has NO animations (static model)`);
      }
      
      // Calculate and log model dimensions
      if (mesh) {
        const bbox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        bbox.getSize(size);

        console.log("========== MODEL DIMENSIONS ==========");
        console.log("Width (X):", size.x.toFixed(2), "units");
        console.log("Height (Y):", size.y.toFixed(2), "units");
        console.log("Depth (Z):", size.z.toFixed(2), "units");
        console.log(
          "Min corner:",
          `X:${bbox.min.x.toFixed(2)}, Y:${bbox.min.y.toFixed(2)}, Z:${bbox.min.z.toFixed(2)}`
        );
        console.log(
          "Max corner:",
          `X:${bbox.max.x.toFixed(2)}, Y:${bbox.max.y.toFixed(2)}, Z:${bbox.max.z.toFixed(2)}`
        );
        console.log("=========================================");
      }
    });
  }

  static logWorkerPosition() {
    const worker = document.querySelector('#worker');
    if (worker) {
      const pos = worker.getAttribute('position');
      const rot = worker.getAttribute('rotation');
      console.log('========== WORKER POSITION ==========');
      console.log(`Position: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}, Z=${pos.z.toFixed(2)}`);
      console.log(`Rotation: Y=${rot.y.toFixed(2)}`);
      console.log('=====================================');
    }
  }
}