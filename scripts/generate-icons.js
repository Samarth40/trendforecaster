import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 64, 192, 512];
const inputSvg = join(__dirname, '../public/logo.svg');
const publicDir = join(__dirname, '../public');

async function generateIcons() {
  // Ensure public directory exists
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Generate favicon.ico (multi-size ICO file)
  const faviconBuffer = await sharp(inputSvg)
    .resize(64, 64)
    .toFormat('png')
    .toBuffer();

  await sharp(faviconBuffer)
    .toFile(join(publicDir, 'favicon.ico'));

  // Generate PNG files
  for (const size of sizes) {
    if (size === 192 || size === 512) {
      await sharp(inputSvg)
        .resize(size, size)
        .toFormat('png')
        .toFile(join(publicDir, `logo${size}.png`));
    }
  }
}

generateIcons().catch(console.error); 