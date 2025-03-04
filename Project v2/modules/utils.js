// modules/utils.js
export function getRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function randomPointInSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return { x, y, z };
}

export function randomVector3(scale = 1) {
  return {
    x: (Math.random() - 0.5) * 2 * scale,
    y: (Math.random() - 0.5) * 2 * scale,
    z: (Math.random() - 0.5) * 2 * scale
  };
}

// Some constants
export const SPHERE_RADIUS = 1500;
export const CONNECT_DIST = 300;
export const MAX_SPEED = 1.9;
export const ACCEL_FACTOR = 0.04;
export const ENCRYPTED_DISPLAY_DIST = 200;