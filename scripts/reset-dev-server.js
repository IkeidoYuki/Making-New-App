const fs = require('node:fs');
const path = require('node:path');

const TARGETS = [
  '.expo',
  '.expo-shared',
  'metro-cache',
  path.join('node_modules', '.cache'),
];

function removeRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) {
    console.log(`[reset-dev-server] Skipped ${targetPath} (not found)`);
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  console.log(`[reset-dev-server] Removed ${targetPath}`);
}

console.log('[reset-dev-server] Clearing Metro/Expo caches...');
TARGETS.forEach(removeRecursive);
console.log('[reset-dev-server] Cache cleanup completed.');
