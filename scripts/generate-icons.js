const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(function(size) {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">',
    '  <rect width="' + size + '" height="' + size + '" rx="' + (size * 0.15) + '" fill="#5B3A29"/>',
    '  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="' + (size * 0.35) + '" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">R</text>',
    '  <text x="50%" y="72%" font-family="Arial, sans-serif" font-size="' + (size * 0.1) + '" fill="#D4C4B0" text-anchor="middle" dominant-baseline="middle">MARCENARIA</text>',
    '</svg>'
  ].join('\n');

  fs.writeFileSync(path.join(iconsDir, 'icon-' + size + 'x' + size + '.svg'), svg);
  console.log('Created icon-' + size + 'x' + size + '.svg');
});

console.log('All SVG icons created!');
