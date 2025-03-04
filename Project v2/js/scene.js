// scene.js
export const scene = new THREE.Scene();

// Basic camera. You can tweak this or do so in main.js
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Main WebGL renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CSS2D renderer
export const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

// Optionally, set some defaults here
camera.position.set(0, 300, 300);
camera.lookAt(0, 0, 0);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  console.log('PinkNeonVibes: Window resized');
});