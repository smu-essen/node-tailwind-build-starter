import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const projectName = (pkg.name || "project").replace(/[^a-zA-Z0-9-_]/g, "");

const stamp = new Date().toISOString().replace(/[:T]/g,"-").split(".")[0];
const zipName = `project-backup-${stamp}.zip`;
fs.mkdirSync(path.join(__dirname, "..", "backup"), { recursive: true });
const zipPath = path.join(__dirname, "..", "backup", zipName);

const zipCmd = process.platform === "win32"
  ? `powershell -command "Compress-Archive -Path src -DestinationPath '${zipPath}'"`
  : `zip -r '${zipPath}' src`;

console.log("→ Creating backup:", zipPath);
execSync(zipCmd, { stdio: "inherit" });

// Generalized iCloud backup root:
// - Uses ICLOUD_PROJECTS_DIR env var if set
// - Otherwise defaults to ~/Library/Mobile Documents/com~apple~CloudDocs/Work/Projekte
const HOME = process.env.HOME || os.homedir();
const DEFAULT_ICLOUD_ROOT = path.join(
  HOME,
  "Library",
  "Mobile Documents",
  "com~apple~CloudDocs",
  "Work",
  "Projekte"
);
const ICLOUD_ROOT = process.env.ICLOUD_PROJECTS_DIR || DEFAULT_ICLOUD_ROOT;

const icloudBackupDir = path.join(ICLOUD_ROOT, projectName, "backup");
fs.mkdirSync(icloudBackupDir, { recursive: true });

const dateStamp = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
const icloudZipName = `backup_${projectName}_${dateStamp}.zip`;
const icloudZipPath = path.join(icloudBackupDir, icloudZipName);
fs.copyFileSync(zipPath, icloudZipPath);

const files = fs.readdirSync(icloudBackupDir)
  .filter(f => f.startsWith(`backup_${projectName}_`) && f.endsWith(".zip"))
  .map(f => ({ name: f, time: fs.statSync(path.join(icloudBackupDir, f)).mtimeMs }))
  .sort((a, b) => b.time - a.time);

if (files.length > 5) {
  for (const file of files.slice(5)) {
    fs.unlinkSync(path.join(icloudBackupDir, file.name));
  }
}

console.log("✓ Backup created.");