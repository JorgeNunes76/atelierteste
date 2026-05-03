/**
 * gen-favicons-pure.mjs
 * Gera favicon PNG usando apenas Node.js built-ins.
 * Cria um PNG mínimo válido com fundo creme e texto "AA" dourado.
 */
import { createWriteStream, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import zlib from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// CRC32 para PNG
function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const crcInput = Buffer.concat([typeBuffer, dataBuffer]);
  return Buffer.concat([
    uint32BE(dataBuffer.length),
    typeBuffer,
    dataBuffer,
    uint32BE(crc32(crcInput))
  ]);
}

function createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB) {
  // Criar imagem RGB simples
  // Cada pixel é [R, G, B]
  const pixels = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push(bgR, bgG, bgB);
    }
    pixels.push(row);
  }

  // Desenhar um "A" simples como bloco de pixels (para tamanhos pequenos como 32px)
  // Para o favicon de 32px vamos fazer uma versão simplificada
  // Circulo/quadrado dourado centralizado com "A"
  
  const cx = size / 2;
  const cy = size / 2;
  
  // Linha horizontal dourada (decoração)
  const lineY = Math.round(size * 0.72);
  const lineX1 = Math.round(size * 0.15);
  const lineX2 = Math.round(size * 0.85);
  const lineThick = Math.max(1, Math.round(size * 0.025));
  
  for (let y = lineY; y < lineY + lineThick && y < size; y++) {
    for (let x = lineX1; x <= lineX2 && x < size; x++) {
      const idx = (y * size + x) * 3;
      pixels[y][x * 3]     = Math.round(fgR * 0.7 + bgR * 0.3);
      pixels[y][x * 3 + 1] = Math.round(fgG * 0.7 + bgG * 0.3);
      pixels[y][x * 3 + 2] = Math.round(fgB * 0.7 + bgB * 0.3);
    }
  }

  // Monograma "AA" - desenhado como forma geométrica simples
  // Dois triângulos/A lado a lado
  const letterH = Math.round(size * 0.55);
  const letterW = Math.round(size * 0.25);
  const startY = Math.round(size * 0.17);
  const gap = Math.round(size * 0.04);
  const totalW = letterW * 2 + gap;
  const startX = Math.round((size - totalW) / 2);

  function drawA(offsetX) {
    const thick = Math.max(1, Math.round(size * 0.07));
    // Lado esquerdo do A (diagonal esquerda)
    for (let i = 0; i <= letterH; i++) {
      const t = i / letterH;
      const x = Math.round(offsetX + t * (letterW / 2));
      const y = startY + i;
      for (let dx = 0; dx < thick && x + dx < size; dx++) {
        if (y < size) {
          pixels[y][(x + dx) * 3]     = fgR;
          pixels[y][(x + dx) * 3 + 1] = fgG;
          pixels[y][(x + dx) * 3 + 2] = fgB;
        }
      }
    }
    // Lado direito do A (diagonal direita)
    for (let i = 0; i <= letterH; i++) {
      const t = i / letterH;
      const x = Math.round(offsetX + letterW - t * (letterW / 2));
      const y = startY + i;
      for (let dx = 0; dx < thick && x + dx < size; dx++) {
        if (y < size) {
          pixels[y][(x + dx) * 3]     = fgR;
          pixels[y][(x + dx) * 3 + 1] = fgG;
          pixels[y][(x + dx) * 3 + 2] = fgB;
        }
      }
    }
    // Barra horizontal do A
    const barY = startY + Math.round(letterH * 0.52);
    const barThick = Math.max(1, Math.round(size * 0.055));
    const barX1 = Math.round(offsetX + letterW * 0.2);
    const barX2 = Math.round(offsetX + letterW * 0.8);
    for (let dy = 0; dy < barThick; dy++) {
      for (let x = barX1; x <= barX2 && x < size; x++) {
        const y = barY + dy;
        if (y < size) {
          pixels[y][x * 3]     = fgR;
          pixels[y][x * 3 + 1] = fgG;
          pixels[y][x * 3 + 2] = fgB;
        }
      }
    }
  }

  drawA(startX);
  drawA(startX + letterW + gap);

  // Converter pixels para buffer PNG
  const rawRows = pixels.map(row => {
    const rowBuf = Buffer.from(row);
    const filterByte = Buffer.from([0]); // filter type None
    return Buffer.concat([filterByte, rowBuf]);
  });
  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // PNG header + chunks
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);       // width
  ihdrData.writeUInt32BE(size, 4);       // height
  ihdrData.writeUInt8(8, 8);             // bit depth
  ihdrData.writeUInt8(2, 9);             // color type: RGB
  ihdrData.writeUInt8(0, 10);            // compression
  ihdrData.writeUInt8(0, 11);            // filter
  ihdrData.writeUInt8(0, 12);            // interlace

  return Buffer.concat([
    pngSignature,
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

// Cores: fundo #FAF7F2 = (250, 247, 242), gold #C4956A = (196, 149, 106)
const [bgR, bgG, bgB] = [250, 247, 242];
const [fgR, fgG, fgB] = [196, 149, 106];

mkdirSync(join(publicDir, 'icons'), { recursive: true });

const files = [
  { path: join(publicDir, 'favicon.png'),            size: 32  },
  { path: join(publicDir, 'apple-touch-icon.png'),   size: 180 },
  { path: join(publicDir, 'icons', 'icon-192.png'),  size: 192 },
  { path: join(publicDir, 'icons', 'icon-512.png'),  size: 512 },
];

import { writeFileSync } from 'fs';

for (const { path, size } of files) {
  const png = createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB);
  writeFileSync(path, png);
  console.log(`✅ ${path.split('\\').pop().padEnd(22)} ${size}×${size}px  (${png.length} bytes)`);
}

console.log('\n🎨 Favicons criados em public/');
