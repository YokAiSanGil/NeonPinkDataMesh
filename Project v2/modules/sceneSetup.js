// modules/sceneSetup.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.module.js';

export let scene, camera, renderer;

export function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 50, 400);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Example: boundary
  const boundaryGeometry = new THREE.SphereGeometry(1500, 32, 32);
  const boundaryMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0099,
    wireframe: true,
    transparent: true,
    opacity: 0.05
  });
  const boundaryMesh = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
  scene.add(boundaryMesh);

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}