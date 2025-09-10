/**
 * release.mjs
 * Creates a clean ZIP for releases (without node_modules, dist, backup, .git).
 * Filename: <name>-v<version>-<YYYYMMDD-HHMMSS>.zip
 * Optional: --build  (runs `npm run build` before zipping)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import minimist from "minimist";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const args = minimist(process.argv.slice(2));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const name = String(pkg.name || "project").replace(/[^a-zA-Z0-9-_]/g, "-");
const version = String(pkg.version || "0.0.0");

const stamp = new Date()
  .toISOString()
  .replace(/[:T]/g, "")
  .slice(0, 15); // YYYYMMDDHHMMSS
const prettyStamp = `${stamp.slice(0,8)}-${stamp.slice(8,12)}`; // YYYYMMDD-HHMM

const releaseDir = path.join(ROOT, "release");
fs.mkdirSync(releaseDir, { recursive: true });
const zipName = `${name}-v${version}-${prettyStamp}.zip`;
const zipPath = path.join(releaseDir, zipName);

if (args.build) {
  console.log("→ Running build before packaging…");
  execSync("npm run build", { stdio: "inherit", cwd: ROOT });
}

// Ensure zip is available
try {
  execSync("zip -v >/dev/null 2>&1 || true");
} catch {
  console.error("zip utility not found. Please install zip.");
  process.exit(1);
}

console.log(`→ Creating release zip: ${zipPath}`);
// Build exclusion list
const exclude = [
  "node_modules/*",
  "dist/*",
  "backup/*",
  "release/*",
  ".git/*",
  ".vscode/*",
  ".idea/*",
  "**/.DS_Store",
  ".DS_Store",
  "npm-debug.log*",
  "yarn-*.log",
  "pnpm-debug.log*"
].map(p => `-x "${p}"`).join(" ");

// Use zip from project root to keep relative paths nice
// Include everything in root (.) while excluding patterns
const cmd = `cd "${ROOT}" && zip -r "${zipPath}" . ${exclude}`;
execSync(cmd, { stdio: "inherit" });

console.log("✓ Release ZIP created:", zipPath);
console.log("\nNext steps:");
console.log("  • Attach the ZIP to a GitHub Release, or");
console.log("  • Host it and link from your blog article.");
console.log("\nTip:");
console.log("  npm run release -- --build   # build first, then zip");