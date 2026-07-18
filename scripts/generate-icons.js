const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`Generated icon-${size}x${size}.png`);
  }

  console.log('All PNG icons generated!');
}

generateIcons().catch(console.error);
