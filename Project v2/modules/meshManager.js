// modules/meshManager.js

import { scene, camera } from './sceneSetup.js';
import * as THREE from 'three';
import {
  randomPointInSphere,
  randomVector3,
  getRandomCode,
  SPHERE_RADIUS,
  CONNECT_DIST,
  MAX_SPEED,
  ACCEL_FACTOR,
  ENCRYPTED_DISPLAY_DIST
} from './utils.js';

export const nodes = [];
const connections = {}; // { 'i_j': { line, a, b, stickyTimer } }

const NUM_POINTS = 300;

// Materials
const nodeGeometry = new THREE.SphereGeometry(2, 8, 8);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0099 });
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xff0099,
  transparent: true,
  opacity: 0.6
});

// For storing reference to #infoOverlay, etc.
let infoOverlay;

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredNode = null;

export function initNodes() {
  // Add overlay if needed
  infoOverlay = document.getElementById('infoOverlay');

  // Create each node
  for (let i = 0; i < NUM_POINTS; i++) {
    const { x, y, z } = randomPointInSphere(SPHERE_RADIUS);
    const position = new THREE.Vector3(x, y, z);

    const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    mesh.position.copy(position);

    const vel = new THREE.Vector3(...Object.values(randomVector3(0.5)));

    const sprite = createEncryptedSprite(getRandomCode());
    sprite.position.copy(position).add(new THREE.Vector3(10, 10, 0));
    scene.add(sprite);

    mesh.userData.sprite = sprite;
    mesh.userData.velocity = vel;
    mesh.userData.profileId = `Node-${i}`;
    mesh.userData.info =
      `Node #${i} at (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`;

    scene.add(mesh);
    nodes.push(mesh);
  }

  // Mouse hover/click events
  document.addEventListener('mousemove', onDocumentMouseMove);
  document.addEventListener('click', onDocumentClick);
}

// Create the text sprite
function createEncryptedSprite(initialText) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '24px monospace';
  ctx.fillStyle = '#ff0099';
  ctx.textAlign = 'center';
  ctx.fillText(initialText, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(50, 25, 1);
  sprite.userData = { canvas, ctx };
  return sprite;
}

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodes);
  hoveredNode = intersects.length > 0 ? intersects[0].object : null;
}

function onDocumentClick() {
  if (hoveredNode) {
    if (infoOverlay) {
      infoOverlay.style.display = 'block';
      infoOverlay.innerHTML = `<strong>${hoveredNode.userData.profileId}</strong><br/>${hoveredNode.userData.info}`;
    }
  } else {
    if (infoOverlay) {
      infoOverlay.style.display = 'none';
    }
  }
}

// Called each frame to update node positions, velocities, and sprites
export function updateNodes(delta) {
  nodes.forEach((node) => {
    const vel = node.userData.velocity;
    // Add random acceleration
    vel.x += (Math.random() - 0.5) * ACCEL_FACTOR;
    vel.y += (Math.random() - 0.5) * ACCEL_FACTOR;
    vel.z += (Math.random() - 0.5) * ACCEL_FACTOR;

    if (vel.length() > MAX_SPEED) {
      vel.clampLength(0, MAX_SPEED);
    }

    node.position.add(vel);
    handleSphereBoundary(node);

    // Update sprite if within ENCRYPTED_DISPLAY_DIST
    const sprite = node.userData.sprite;
    if (camera.position.distanceTo(node.position) < ENCRYPTED_DISPLAY_DIST) {
      sprite.visible = true;
      const newCode = getRandomCode();
      const { canvas, ctx } = sprite.userData;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0099';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(newCode, canvas.width / 2, canvas.height / 2);
      sprite.material.map.needsUpdate = true;
      sprite.position.copy(node.position).add(new THREE.Vector3(10, 10, 0));
    } else {
      sprite.visible = false;
    }
  });
}

// Called each frame to refresh or remove connections
export function updateConnections() {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].position.distanceTo(nodes[j].position);
      const key = getKey(i, j);

      if (dist < CONNECT_DIST) {
        if (!connections[key]) {
          const stickyDuration = Math.random() * 1.5 + 0.5;
          const geo = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position.clone(),
            nodes[j].position.clone()
          ]);
          const line = new THREE.Line(geo, lineMaterial.clone());
          scene.add(line);
          connections[key] = { line, a: nodes[i], b: nodes[j], stickyTimer: stickyDuration };
        } else {
          connections[key].line.geometry.setFromPoints([
            nodes[i].position.clone(),
            nodes[j].position.clone()
          ]);
          if (connections[key].stickyTimer > 0) {
            const avgVel = nodes[i].userData.velocity
              .clone()
              .add(nodes[j].userData.velocity)
              .multiplyScalar(0.5);
            nodes[i].userData.velocity.lerp(avgVel, 0.02);
            nodes[j].userData.velocity.lerp(avgVel, 0.02);
            connections[key].stickyTimer -= 0.0167; // approx 1/60
          } else {
            if (Math.random() < 0.005) {
              connections[key].stickyTimer = Math.random() * 1.5 + 0.5;
            }
          }
        }
      } else {
        if (connections[key]) {
          scene.remove(connections[key].line);
          connections[key].line.geometry.dispose();
          connections[key].line.material.dispose();
          delete connections[key];
        }
      }
    }
  }
}

function handleSphereBoundary(node) {
  const distance = node.position.length();
  if (distance >= SPHERE_RADIUS) {
    const velocity = node.userData.velocity;
    const normal = node.position.clone().normalize();
    const dot = velocity.dot(normal);
    velocity.sub(normal.multiplyScalar(2 * dot)); // reflection
    node.position.setLength(SPHERE_RADIUS * 0.99);
  }
}

function getKey(i, j) {
  return i < j ? `${i}_${j}` : `${j}_${i}`;
}