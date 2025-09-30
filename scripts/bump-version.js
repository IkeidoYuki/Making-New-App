const fs = require("fs");
const path = require("path");

const appJsonPath = path.join(process.cwd(), "app.json");
const app = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

function bumpSemver(v, type) {
  const [maj, min, pat] = (v || "0.0.0").split(".").map(n => parseInt(n, 10) || 0);
  if (type === "major") return `${maj + 1}.0.0`;
  if (type === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${(pat || 0) + 1}`; // patch
}

const type = (process.argv[2] || "patch").toLowerCase(); // patch | minor | major
const cur = app.expo.version || "1.0.0";
const next = bumpSemver(cur, type);
app.expo.version = next;

// 任意: メジャー/マイナー/パッチいずれでも iOS の buildNumber を "1" にリセット
app.expo.ios = app.expo.ios || {};
app.expo.ios.buildNumber = "1";

console.log(`[Version] ${cur} -> ${next} (iOS buildNumber reset to 1)`);
fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + "\n");
console.log(`Saved: ${appJsonPath}`);
