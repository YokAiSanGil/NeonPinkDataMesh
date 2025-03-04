// main.js
import { initScene, scene, camera, renderer } from './modules/sceneSetup.js';
import { initControls, updateFirstPersonCamera, lastInteractionTime, idleModeActive, updateInteractionTime } from './modules/controls.js';
import { startIdleMode, updateIdleCamera } from './modules/idleMode.js';
import { initNodes, updateNodes, updateConnections } from './modules/meshManager.js';

// If you placed your constants or timing in utils, import them
// We keep IDLE_DELAY here, or you could have placed it in utils.js
const IDLE_DELAY = 10000; // 10 seconds
const clock = new THREE.Clock();

// Mode indicator references
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

  // Check idle logic
  const now = Date.now();
  if (now - lastInteractionTime > IDLE_DELAY) {
    if (!idleModeActive) {
      // Switch to idle
      // (Set the flag in controls or here; let's do it in controls to keep consistency)
      // But we'll do it here for clarity:
      import('./modules/controls.js').then(module => {
        module.idleModeActive = true;
      });
      startIdleMode();
      showModeIndicator("Idle Mode");
    }
    // Update idle camera
    updateIdleCamera();
  } else {
    // If not idle
    updateFirstPersonCamera(delta);
  }

  // Update nodes
  updateNodes(delta);
  updateConnections();

  renderer.render(scene, camera);
}

// Initialize the entire app
function init() {
  initScene();
  initControls();
  initNodes();

  modeIndicator = document.getElementById('modeIndicator');
  showModeIndicator("First-Person Mode");

  animate();
}

// Start it all
init();