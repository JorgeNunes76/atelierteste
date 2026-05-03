// gen-favicons.mjs — gera favicon.png, apple-touch-icon.png, icon-192.png, icon-512.png
// Usa apenas Node.js built-ins + Vite (sem dependências externas)
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

mkdirSync(iconsDir, { recursive: true });

function drawFavicon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fundo creme
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, size, size);

  // Monograma "AA" em gold
  const fontSize = Math.round(size * 0.52);
  ctx.fillStyle = '#C4956A';
  ctx.font = `${fontSize}px Georgia`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AA', size / 2, size / 2);

  // Linha decorativa
  ctx.strokeStyle = '#C4956A';
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = Math.max(1, Math.round(size * 0.012));
  ctx.beginPath();
  ctx.moveTo(size * 0.16, size * 0.72);
  ctx.lineTo(size * 0.84, size * 0.72);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

const files = [
  { path: join(publicDir, 'favicon.png'),           size: 32  },
  { path: join(publicDir, 'apple-touch-icon.png'),  size: 180 },
  { path: join(iconsDir,  'icon-192.png'),           size: 192 },
  { path: join(iconsDir,  'icon-512.png'),           size: 512 },
];

for (const { path, size } of files) {
  writeFileSync(path, drawFavicon(size));
  console.log(`✅ ${path.split('\\').pop()} (${size}×${size})`);
}

console.log('\n🎨 Favicons gerados com sucesso!');
