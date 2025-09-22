const fs = require('node:fs');
const path = require('node:path');

const ASSETS = [
  {
    filename: 'icon.png',
    description: 'Default app icon (1x1 solid color placeholder).',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMwqfj2HwAFKAKi8NmfRgAAAABJRU5ErkJggg=='
  },
  {
    filename: 'adaptive-icon.png',
    description: 'Adaptive icon foreground (1x1 solid color placeholder).',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMwqfj2HwAFKAKi8NmfRgAAAABJRU5ErkJggg=='
  },
  {
    filename: 'splash.png',
    description: 'Splash image placeholder (1x1 white pixel).',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII='
  }
];

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

ASSETS.forEach(({ filename, base64, description }) => {
  const destination = path.join(assetsDir, filename);
  if (fs.existsSync(destination)) {
    console.log(`[prepare-assets] Skipping ${filename} because it already exists.`);
    return;
  }

  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(destination, buffer);
  console.log(`[prepare-assets] Created ${filename}. ${description}`);
});
