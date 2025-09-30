const fs = require("fs");
const path = require("path");

const appJsonPath = path.join(process.cwd(), "app.json");
const app = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

function incIos(to) {
  const cur = app.expo.ios?.buildNumber ?? "1";
  const next = to !== undefined ? String(to) : String(Number(cur) + 1 || 1);
  app.expo.ios = app.expo.ios || {};
  app.expo.ios.buildNumber = next;
  console.log(`[iOS] buildNumber: ${cur} -> ${next}`);
}

function incAndroid(to) {
  const cur = app.expo.android?.versionCode ?? 1;
  const next = to !== undefined ? Number(to) : Number(cur) + 1;
  app.expo.android = app.expo.android || {};
  app.expo.android.versionCode = next;
  console.log(`[Android] versionCode: ${cur} -> ${next}`);
}

const args = process.argv.slice(2);
// usage: node scripts/bump-build.js ios [--to 5]
//        node scripts/bump-build.js android
//        node scripts/bump-build.js both
let target = "both";
let to;
for (let i = 0; i < args.length; i++) {
  if (["ios", "android", "both"].includes(args[i])) target = args[i];
  if (args[i] === "--to") to = args[i + 1];
}

if (target === "ios" || target === "both") incIos(to);
if (target === "android" || target === "both") incAndroid(to);

fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + "\n");
console.log(`Saved: ${appJsonPath}`);
