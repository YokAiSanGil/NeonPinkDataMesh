// modules/controls.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.module.js';
import { camera } from './sceneSetup.js';

// Hammer is loaded globally, so we use window.Hammer.
const Hammer = window.Hammer;

export let lastInteractionTime = Date.now();
export let idleModeActive = false;

// Define key states for free-fly controls
// Movement keys: W/S for forward/backward, A/D for left/right, R/F for up/down,
// and Q/E for roll.
const keys = {
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false,
  KeyR: false,  // Move Up
  KeyF: false,  // Move Down
  KeyQ: false,  // Roll Left
  KeyE: false,  // Roll Right
  ShiftLeft: false, // Turbo mode
  ShiftRight: false // Turbo mode
};

// Mouse sensitivity for immediate rotation (yaw and pitch)
const mouseSensitivity = 0.002;

export function initControls() {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('mousemove', onMouseMove);

  // Enable pointer lock for immersive controls.
  document.body.addEventListener('click', () => {
    if (document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
    }
  });

  // Set up Hammer for pinch/zoom if needed.
  const pinchManager = new Hammer.Manager(document.body);
  const pinch = new Hammer.Pinch();
  pinchManager.add(pinch);
  pinchManager.on('pinch', onPinch);
  pinchManager.on('pinchend', onPinchEnd);
}

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

function onMouseMove(e) {
  // Calculate delta values for yaw (horizontal) and pitch (vertical).
  const deltaYaw = -e.movementX * mouseSensitivity;
  const deltaPitch = -e.movementY * mouseSensitivity;

  // Create a delta Euler rotation using a fixed order.
  // Using 'YXZ' means that yaw is applied first, then pitch.
  const deltaEuler = new THREE.Euler(deltaPitch, deltaYaw, 0, 'YXZ');

  // Convert the Euler delta into a quaternion.
  const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);

  // Multiply the current camera quaternion by the delta quaternion.
  // This applies the rotation relative to the camera’s current orientation.
  camera.quaternion.multiply(deltaQuat);

  updateInteractionTime();
}

// Optional pinch for zooming
function onPinch(e) {
  updateInteractionTime();
  const zoomAmount = (e.scale - 1) * 20;
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  camera.position.addScaledVector(forward, zoomAmount);
}

function onPinchEnd() {
  // Reset or additional logic if needed.
}

/**
 * updateFirstPersonCamera applies free-fly movement independent of camera position.
 * - Movement is in local space using camera.quaternion.
 * - Speed is constant regardless of where the camera is.
 * - Turbo mode multiplies the base speed.
 * - Roll is applied directly via Q/E keys.
 */
export function updateFirstPersonCamera(delta) {
  // Base movement speed (units per second)
  let speed = 300;
  // Turbo multiplier when Shift is held
  if (keys.ShiftLeft || keys.ShiftRight) {
    speed *= 3;
  }

  // Construct a movement vector from key inputs.
  // W/S: forward/back, A/D: left/right, R/F: up/down.
  const moveVec = new THREE.Vector3();
  if (keys.KeyW) moveVec.z -= 1;
  if (keys.KeyS) moveVec.z += 1;
  if (keys.KeyA) moveVec.x -= 1;
  if (keys.KeyD) moveVec.x += 1;
  if (keys.KeyR) moveVec.y += 1;
  if (keys.KeyF) moveVec.y -= 1;

  if (moveVec.length() > 0) {
    moveVec.normalize().multiplyScalar(speed * delta);
    // Apply the camera's local orientation to move in the correct direction.
    moveVec.applyQuaternion(camera.quaternion);
    camera.position.add(moveVec);
  }

  // Apply roll using quaternions for a consistent effect regardless of pitch.
  // Q for roll left, E for roll right.
  const rollSpeed = 0.02; // Radians per update
  if (keys.KeyQ || keys.KeyE) {
    let rollAngle = 0;
    if (keys.KeyQ) {
      rollAngle = rollSpeed;
    }
    if (keys.KeyE) {
      rollAngle = -rollSpeed;
    }
    // Create a quaternion representing rotation about the camera's local z-axis.
    let rollQuat = new THREE.Quaternion();
    rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rollAngle);
    // Multiply the camera's quaternion on the right to apply a local rotation.
    camera.quaternion.multiply(rollQuat);
  }
}

function updateInteractionTime() {
  lastInteractionTime = Date.now();
  if (idleModeActive) idleModeActive = false;
}