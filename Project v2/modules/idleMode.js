// modules/idleMode.js

import { camera, scene } from './sceneSetup.js';
import { idleModeActive } from './controls.js';
import * as THREE from 'three';

let idleStartTime = 0;
let idleR = 0, idleY = 0, theta0 = 0;
let ellipseA, ellipseB, ellipseAngle;
let idleLookTarget = new THREE.Vector3();
let idleStartQuaternion = new THREE.Quaternion();
let idleStartPosition = new THREE.Vector3();

const accelerationTime = 15;
const constantAngularSpeed = 0.03;

// Begin idle mode
export function startIdleMode() {
  // NB: we use controls.js to set idleModeActive = true
  idleStartTime = Date.now();

  // Evaluate current position
  idleStartPosition.copy(camera.position);
  idleR = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
  idleY = camera.position.y;
  theta0 = Math.atan2(camera.position.z, camera.position.x);

  ellipseA = idleR * 1.6;
  ellipseB = idleR * 0.8;
  ellipseAngle = Math.random() * Math.PI * 2;

  idleStartQuaternion.copy(camera.quaternion);
  idleLookTarget.set(0, 0, 0);
}

// Called on each frame once we’re in idle mode
export function updateIdleCamera() {
  const tIdle = (Date.now() - idleStartTime) / 1000;
  let angle;

  if (tIdle < accelerationTime) {
    const k = 3 / accelerationTime;
    angle = theta0 + (constantAngularSpeed / k) * (1 - Math.exp(-k * tIdle));
  } else {
    const angleAtAccelEnd = theta0 +
      (constantAngularSpeed / (3 / accelerationTime)) *
      (1 - Math.exp(-(3 / accelerationTime) * accelerationTime));
    angle = angleAtAccelEnd + constantAngularSpeed * (tIdle - accelerationTime);
  }

  // Elliptical orbit, factoring in ellipse orientation
  const rotatedAngle = angle + ellipseAngle;

  const targetX = ellipseA * Math.cos(rotatedAngle) * Math.cos(ellipseAngle) -
                  ellipseB * Math.sin(rotatedAngle) * Math.sin(ellipseAngle);
  const targetZ = ellipseA * Math.cos(rotatedAngle) * Math.sin(ellipseAngle) +
                  ellipseB * Math.sin(rotatedAngle) * Math.cos(ellipseAngle);

  const targetY = idleY;
  const targetPos = new THREE.Vector3(targetX, targetY, targetZ);

  // Smooth transition
  let orientationFactor = Math.min(tIdle / 3, 1);
  if (tIdle < 3) {
    camera.position.lerpVectors(idleStartPosition, targetPos, orientationFactor * 0.05);
  } else {
    camera.position.copy(targetPos);
  }

  // Smoothly orient camera to center
  const lookAtMatrix = new THREE.Matrix4();
  lookAtMatrix.lookAt(camera.position, idleLookTarget, camera.up);

  const targetQuaternion = new THREE.Quaternion();
  targetQuaternion.setFromRotationMatrix(lookAtMatrix);

  const currentIdleQuaternion = new THREE.Quaternion();
  currentIdleQuaternion.slerpQuaternions(
    idleStartQuaternion,
    targetQuaternion,
    orientationFactor
  );

  camera.quaternion.slerp(currentIdleQuaternion, 0.05);
}