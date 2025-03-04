// modules/sceneSetup.js

import * as THREE from 'three';

export let scene, camera, renderer;
let boundaryMesh;

// Initialize everything
export function initScene() {
  scene = new THREE.Scene();

  // Perspective Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 50, 400);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Optional boundary sphere
  const boundaryGeometry = new THREE.SphereGeometry(1500, 32, 32);
  const boundaryMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0099,
    wireframe: true,
    transparent: true,
    opacity: 0.05
  });
  boundaryMesh = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
  scene.add(boundaryMesh);

  // Handle window resizing
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}