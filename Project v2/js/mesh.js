// mesh.js
import { scene } from './scene.js'; // we only need scene for adding objects

// Some grid constants, or you can make them config variables
const gridSize = 20;
const gridWidth = 15;
const gridDepth = 15;

const nodeGeometry = new THREE.SphereGeometry(2, 8, 8);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0099 });
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0099 });

export const nodes = [];
export const lines = [];
export const crypticCodes = [];

// Create the entire grid
export function createGrid() {
  // If you have custom random code functions, import them or define them here
  for (let z = 0; z < gridDepth; z++) {
    for (let x = 0; x < gridWidth; x++) {
      const baseX = (x - gridWidth / 2) * gridSize;
      const baseZ = (z - gridDepth / 2) * gridSize;
      const y = 0;

      // Node
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      node.position.set(baseX, y, baseZ);
      node.userData = {
        basePosition: node.position.clone(),
        encryptedCode: `ENC-${x}-${z}`, // or your generateEncryptedCode(x,z)
      };
      scene.add(node);
      nodes.push(node);

      // Sprite / cryptic code
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.font = '20px monospace';
      ctx.fillStyle = '#ff00ff';
      ctx.textAlign = 'center';
      ctx.fillText('XYZ', 64, 32); // or your getRandomCode()

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(15, 7.5, 1);
      sprite.position.set(baseX, y + 5, baseZ);
      scene.add(sprite);

      crypticCodes.push({ sprite, canvas, ctx });

      // Lines
      if (x < gridWidth - 1) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(baseX, y, baseZ),
          new THREE.Vector3(baseX + gridSize, y, baseZ),
        ]);
        const line = new THREE.Line(lineGeo, lineMaterial);
        // store indices in userData
        line.userData = {
          startIdx: z * gridWidth + x,
          endIdx: z * gridWidth + (x + 1),
        };
        scene.add(line);
        lines.push(line);
      }
      if (z < gridDepth - 1) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(baseX, y, baseZ),
          new THREE.Vector3(baseX, y, baseZ + gridSize),
        ]);
        const line = new THREE.Line(lineGeo, lineMaterial);
        line.userData = {
          startIdx: z * gridWidth + x,
          endIdx: (z + 1) * gridWidth + x,
        };
        scene.add(line);
        lines.push(line);
      }
    }
  }

  // Return anything else you might need
  return { nodes, lines, crypticCodes, gridSize, gridWidth, gridDepth };
}