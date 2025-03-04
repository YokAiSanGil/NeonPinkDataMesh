// controls.js
import { camera, scene } from './scene.js';
import { nodes } from './mesh.js';

export const raycaster = new THREE.Raycaster();
export const mouse = new THREE.Vector2();

export function setupControls() {
  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  document.addEventListener('click', () => {
    // your click logic
  });
}