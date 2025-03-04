// idle.js
import { camera } from './scene.js';

let idleActive = false;
let idleTimer = 0;
const IDLE_TIME_THRESHOLD = 5000; // 5 seconds for example

export function setupIdle() {
  // For instance, track mouse or key usage, reset idleTimer
  document.addEventListener('mousemove', () => idleTimer = 0);
  document.addEventListener('keydown', () => idleTimer = 0);

  // then in your animation loop, you’d check idleTimer and move camera
}

export function updateIdle(deltaTime) {
  idleTimer += deltaTime;
  if (idleTimer > IDLE_TIME_THRESHOLD) {
    idleActive = true;
    // smoothly orbit camera
  } else {
    idleActive = false;
  }
}