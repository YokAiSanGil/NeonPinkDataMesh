// main.js

// 1) Import Three as an ESM module if you reference THREE directly here
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.module.js';

// 2) Import your other modules
import { initScene, scene, camera, renderer } from './modules/sceneSetup.js';
import { initControls, updateFirstPersonCamera, lastInteractionTime, idleModeActive } from './modules/controls.js';
import { startIdleMode, updateIdleCamera } from './modules/idleMode.js';
import { initNodes, updateNodes, updateConnections } from './modules/meshManager.js';

// Example: we create a clock in main.js using the imported THREE
const clock = new THREE.Clock();
const IDLE_DELAY = 10000;
let modeIndicator;
let indicatorTimeout;

function showModeIndicator(mode) {
  modeIndicator.textContent = mode;
  modeIndicator.style.opacity = '1';
  clearTimeout(indicatorTimeout);
  indicatorTimeout = setTimeout(() => {
    modeIndicator.style.opacity = '0';
  }, 2000);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (Date.now() - lastInteractionTime > IDLE_DELAY) {
    if (!idleModeActive) {
      import('./modules/controls.js').then(module => {
        module.idleModeActive = true;
      });
      startIdleMode();
      showModeIndicator("Idle Mode");
    }
    updateIdleCamera();
  } else {
    updateFirstPersonCamera(delta);
  }

  updateNodes(delta);
  updateConnections();
  renderer.render(scene, camera);
}

function init() {
  initScene();
  initControls();
  initNodes();
  modeIndicator = document.getElementById('modeIndicator');
  showModeIndicator("First-Person Mode");
  animate();
}

init();