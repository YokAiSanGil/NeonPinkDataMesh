// modules/controls.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.module.js';
import { camera } from './sceneSetup.js';

const Hammer = window.Hammer;

export let lastInteractionTime = Date.now();
export let idleModeActive = false;

// For tracking key states
const keys = {
  KeyW: false, KeyA: false, KeyS: false, KeyD: false,
  KeyQ: false, KeyE: false,
  Space: false, ShiftLeft: false, ShiftRight: false
};

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };
const movementSpeed = 300;
const rotationSpeed = 0.1;
const keyboardRotationSpeed = 1.0;

export function initControls() {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);

  document.addEventListener('wheel', onMouseWheel, { passive: false });

  // For pinch/zoom
  const pinchManager = new Hammer.Manager(document.body);
  const pinch = new Hammer.Pinch();
  pinchManager.add(pinch);

  pinchManager.on('pinch', onPinch);
  pinchManager.on('pinchend', onPinchEnd);
}

// ADD THIS FUNCTION
export function updateFirstPersonCamera(delta) {
  // Q / E rotate camera yaw
  if (keys.KeyQ) {
    targetRotation.x += keyboardRotationSpeed * delta;
  }
  if (keys.KeyE) {
    targetRotation.x -= keyboardRotationSpeed * delta;
  }

  // Smooth out rotation
  currentRotation.x += (targetRotation.x - currentRotation.x) * rotationSpeed;
  currentRotation.y += (targetRotation.y - currentRotation.y) * rotationSpeed;

  camera.rotation.y = currentRotation.x;
  camera.rotation.x = currentRotation.y;

  // Movement in local camera space
  const moveDist = movementSpeed * delta;
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const up = new THREE.Vector3(0, 1, 0);

  const moveVec = new THREE.Vector3();
  if (keys.KeyW) moveVec.add(forward);
  if (keys.KeyS) moveVec.sub(forward);
  if (keys.KeyA) moveVec.sub(right);
  if (keys.KeyD) moveVec.add(right);
  if (keys.Space) moveVec.add(up);
  if (keys.ShiftLeft || keys.ShiftRight) moveVec.sub(up);

  if (moveVec.length() > 0) {
    moveVec.normalize().multiplyScalar(moveDist);
    camera.position.add(moveVec);
  }
}

// Event helpers
function onKeyDown(e) {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
    updateInteractionTime();
  }
}
function onKeyUp(e) {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
  }
}
function onMouseDown(e) {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
  updateInteractionTime();
}
function onMouseUp() {
  isDragging = false;
}
function onMouseMove(e) {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  targetRotation.x -= deltaX * 0.002;
  targetRotation.y -= deltaY * 0.002;
  previousMousePosition = { x: e.clientX, y: e.clientY };
  updateInteractionTime();
}
function onMouseWheel(e) {
  e.preventDefault();
  updateInteractionTime();
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  camera.position.addScaledVector(forward, Math.sign(e.deltaY) * 20);
}
function onPinch(e) {
  updateInteractionTime();
  const scaleDiff = e.scale; // you can adjust the zoom factor as needed
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  camera.position.addScaledVector(forward, (scaleDiff - 1) * 20);
}
function onPinchEnd() {
  // Reset pinch scale, if needed
}
function updateInteractionTime() {
  lastInteractionTime = Date.now();
  if (idleModeActive) idleModeActive = false;
}