import sharp from 'sharp';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const imagesToConvert = [
  'daiane&victor-previas-19.jpg',
  'hero-bg.png',
];

for (const filename of imagesToConvert) {
  const inputPath = path.join(publicDir, filename);
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  const outputPath = path.join(publicDir, `${baseName}.webp`);

  try {
    const info = await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`✅ Convertido: ${filename} → ${baseName}.webp`);
    console.log(`   Tamanho: ${(info.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.error(`❌ Erro ao converter ${filename}:`, err.message);
  }
}
