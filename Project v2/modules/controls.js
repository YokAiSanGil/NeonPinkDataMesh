// modules/controls.js

import { camera } from './sceneSetup.js';
import * as THREE from 'three';

// Key states
const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  KeyQ: false,
  KeyE: false,
  Space: false,
  ShiftLeft: false,
  ShiftRight: false
};

// Rotation states
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };

export let lastInteractionTime = Date.now();
export let idleModeActive = false;

const movementSpeed = 300; // units per second
const rotationSpeed = 0.1;
const keyboardRotationSpeed = 1.0;

export function initControls() {
  // Keyboard
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // Mouse
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);

  // Touch
  document.addEventListener('touchstart', onTouchStart);
  document.addEventListener('touchend', onTouchEnd);
  document.addEventListener('touchmove', onTouchMove);

  // Mouse wheel for zoom
  document.addEventListener('wheel', onMouseWheel, { passive: false });

  // Pinch
  // If you rely on Hammer.js from <script> in index.html, it’s accessible globally
  const pinchManager = new Hammer.Manager(document.body);
  const pinch = new Hammer.Pinch();
  pinchManager.add(pinch);

  pinchManager.on('pinch', onPinch);
  pinchManager.on('pinchend', onPinchEnd);
}

function onKeyDown(event) {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = true;
    updateInteractionTime();
  }
}

function onKeyUp(event) {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = false;
  }
}

function onMouseDown(event) {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
  updateInteractionTime();
}

function onMouseUp() {
  isDragging = false;
}

function onMouseMove(event) {
  if (!isDragging) return;
  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y
  };

  if (Math.abs(deltaMove.x) > 2 || Math.abs(deltaMove.y) > 2) {
    targetRotation.x -= deltaMove.x * 0.002;
    targetRotation.y -= deltaMove.y * 0.002;
    previousMousePosition = { x: event.clientX, y: event.clientY };
    updateInteractionTime();
  }
}

function onMouseWheel(event) {
  event.preventDefault();
  updateInteractionTime();

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const zoomSpeed = 20;
  camera.position.addScaledVector(forward, Math.sign(event.deltaY) * zoomSpeed);
}

let currentPinchScale = 1;
function onPinch(event) {
  updateInteractionTime();

  const scaleDiff = event.scale / currentPinchScale;
  currentPinchScale = event.scale;

  const zoomFactor = 20; // sensitivity
  const zoomAmount = (scaleDiff - 1) * zoomFactor;

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  camera.position.addScaledVector(forward, zoomAmount);
}

function onPinchEnd() {
  currentPinchScale = 1;
}

// Touch
function onTouchStart(event) {
  if (event.touches.length === 1) {
    isDragging = true;
    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
    updateInteractionTime();
  }
}

function onTouchEnd() {
  isDragging = false;
}

function onTouchMove(event) {
  if (!isDragging || event.touches.length !== 1) return;
  const deltaMove = {
    x: event.touches[0].clientX - previousMousePosition.x,
    y: event.touches[0].clientY - previousMousePosition.y
  };

  targetRotation.x -= deltaMove.x * 0.002;
  targetRotation.y -= deltaMove.y * 0.002;
  previousMousePosition = {
    x: event.touches[0].clientX,
    y: event.touches[0].clientY
  };
  updateInteractionTime();
}

// Called from main or anywhere we need to reset idle timers
export function updateInteractionTime() {
  lastInteractionTime = Date.now();
  if (idleModeActive) {
    idleModeActive = false;
  }
}

// Update first-person camera each frame
export function updateFirstPersonCamera(delta) {
  // Q / E for yaw rotation
  if (keys.KeyQ) {
    targetRotation.x += keyboardRotationSpeed * delta;
  }
  if (keys.KeyE) {
    targetRotation.x -= keyboardRotationSpeed * delta;
  }

  currentRotation.x += (targetRotation.x - currentRotation.x) * rotationSpeed;
  currentRotation.y += (targetRotation.y - currentRotation.y) * rotationSpeed;

  // Apply rotation
  camera.rotation.y = currentRotation.x;
  camera.rotation.x = currentRotation.y;

  // Movement
  const moveDist = movementSpeed * delta;
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const up = new THREE.Vector3(0, 1, 0);

  const moveVector = new THREE.Vector3(0, 0, 0);
  if (keys.KeyW) moveVector.add(forward);
  if (keys.KeyS) moveVector.sub(forward);
  if (keys.KeyA) moveVector.sub(right);
  if (keys.KeyD) moveVector.add(right);
  if (keys.Space) moveVector.add(up);
  if (keys.ShiftLeft || keys.ShiftRight) moveVector.sub(up);

  if (moveVector.length() > 0) {
    moveVector.normalize().multiplyScalar(moveDist);
    camera.position.add(moveVector);
  }
}