// utils.js
export function encryptString(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return str
    .split('')
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
}

export function getRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
  return Array(3)
    .fill()
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
}

// etc.