// main.js (the "entry point")
import { scene, camera, renderer, labelRenderer } from './scene.js';
import { createGrid, nodes, lines, crypticCodes } from './mesh.js';
import { setupControls, raycaster, mouse } from './controls.js';
import { setupIdle, updateIdle } from './idle.js';
import { encryptString, getRandomCode } from './utils.js';

// 1) Build your grid
createGrid(); // populates scene with nodes and lines

// 2) Set up controls
setupControls(); // adds event listeners

// 3) Set up idle
setupIdle(); // idle orbit logic, if you want

// 4) A basic animate function
let prevTime = performance.now();
function animate() {
  requestAnimationFrame(animate);

  // compute deltaTime
  const currentTime = performance.now();
  const deltaTime = currentTime - prevTime;
  prevTime = currentTime;

  // wave effect or any custom logic
  // example: nodes.forEach(node => { ... });

  // update lines
  // lines.forEach(line => {
  //   const { startIdx, endIdx } = line.userData;
  //   line.geometry.setFromPoints([
  //     nodes[startIdx].position,
  //     nodes[endIdx].position,
  //   ]);
  // });

  // idle camera update
  updateIdle(deltaTime);

  // standard render
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// 5) Go!
animate();
console.log('PinkNeonVibes: main.js started, animation loop running...');