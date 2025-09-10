/**
 * images.mjs – Derivatives generator for "wendekreis"
 * - Reads from --src (default ./src/img)
 * - Writes to --out (default ./dist/assets/img)
 * - Generates sizes [480,768,1200,1920] in AVIF+WEBP + fallback (jpg/png)
 */
import path from "path";
import fse from "fs-extra";
import fg from "fast-glob";
import sharp from "sharp";
import minimist from "minimist";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const argv = minimist(process.argv.slice(2));
const SRC = path.resolve(ROOT, argv.src || "./src/img");
const OUT = path.resolve(ROOT, argv.out || "./dist/assets/img");

const WIDTHS = [480, 768, 1200, 1920];

async function main() {
  console.log(`→ Images from ${SRC} → ${OUT}`);
  await fse.ensureDir(OUT);

  const files = await fg(["**/*.{jpg,jpeg,png}"], { cwd: SRC });
  for (const rel of files) {
    const inPath = path.join(SRC, rel);
    const { name, ext, dir } = path.parse(rel);
    const outDir = path.join(OUT, dir);
    await fse.ensureDir(outDir);

    for (const w of WIDTHS) {
      const pipeline = sharp(inPath).resize({ width: w, withoutEnlargement: true });

      // fallback (jpg/png)
      const fallbackOut = path.join(outDir, `${name}-${w}${ext}`);
      await pipeline.toFile(fallbackOut);

      // webp
      const webpOut = path.join(outDir, `${name}-${w}.webp`);
      await sharp(inPath).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webpOut);

      // avif
      const avifOut = path.join(outDir, `${name}-${w}.avif`);
      await sharp(inPath).resize({ width: w, withoutEnlargement: true }).avif({ quality: 50 }).toFile(avifOut);
    }
  }
  console.log("✓ Images done.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
