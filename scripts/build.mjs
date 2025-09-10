import path from "path";
import fs from "fs";
import fse from "fs-extra";
import fg from "fast-glob";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { minify as minifyHtml } from "html-minifier-terser";
import esbuild from "esbuild";
import minimist from "minimist";
import os from "os";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const argv = minimist(process.argv.slice(2));
const IS_DEV = !!argv.dev;
const SKIP_PICTURES = !!argv.nopic;

// Paths
const SRC_DIR = path.join(ROOT, "src");
const DIST_DIR = path.join(ROOT, "dist");
const ASSETS_DIR = path.join(DIST_DIR, "assets");
const IMG_SRC = path.join(SRC_DIR, "img");
const IMG_DIST = path.join(ASSETS_DIR, "img");
const CSS_DIST = path.join(ASSETS_DIR, "css");
const JS_DIST = path.join(ASSETS_DIR, "js");

// Project name => used as %BASE% for iCloud copy
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const PROJECT_NAME = (pkg.name || "project").replace(/[^a-zA-Z0-9-_]/g, "-");
const PROJECT_BASE = `/${PROJECT_NAME}`;

// Generalized iCloud target:
// - Uses ICLOUD_SITES_DIR env var if set
// - Otherwise defaults to ~/Library/Mobile Documents/com~apple~CloudDocs/Work/Sites
const HOME = process.env.HOME || os.homedir();
const DEFAULT_ICLOUD_ROOT = path.join(
  HOME,
  "Library",
  "Mobile Documents",
  "com~apple~CloudDocs",
  "Work",
  "Sites"
);
const ICLOUD_ROOT = process.env.ICLOUD_SITES_DIR || DEFAULT_ICLOUD_ROOT;
const ICLOUD_DIR = path.join(ICLOUD_ROOT, PROJECT_NAME);

// HTML minify options
const HTML_MINIFY_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
  keepClosingSlash: true
};

const PICTURE_WIDTHS = [480, 768, 1200, 1920];

async function main() {
  console.time(IS_DEV ? "dev" : "build");
  await fse.emptyDir(DIST_DIR);
  await fse.ensureDir(CSS_DIST);
  await fse.ensureDir(JS_DIST);
  await fse.ensureDir(IMG_DIST);

  // 1) Tailwind CSS
  console.log("→ Tailwind CSS…");
  execSync(`npx tailwindcss -i ./src/css/input.css -o ${quote(CSS_DIST)}/style.css --minify`, { stdio: "inherit", cwd: ROOT });

  // 2) JS (esbuild each file, preserve structure)
  console.log("→ JS (esbuild)…");
  const jsFiles = await fg("src/js/**/*.js", { cwd: ROOT });
  await Promise.all(jsFiles.map(async rel => {
    const inFile = path.join(ROOT, rel);
    const outFile = path.join(JS_DIST, rel.replace(/^src\/js\//, "").replace(/\.js$/, ".min.js"));
    await fse.ensureDir(path.dirname(outFile));
    await esbuild.build({
      entryPoints: [inFile],
      bundle: false,
      minify: true,
      format: "esm",
      target: ["es2020"],
      outfile: outFile
    });
  }));

  // 3) Images
  if (IS_DEV || SKIP_PICTURES) {
    console.log("→ Images (DEV/skip): copying originals…");
    await copyImages(IMG_SRC, IMG_DIST);
  } else {
    console.log("→ Images: generating derivatives via images.mjs…");
    execSync(`node ./scripts/images.mjs --src="./src/img" --out="./dist/assets/img"`, { stdio: "inherit", cwd: ROOT });
  }

  // 4) HTML build: partials + %BASE% (empty) + picture transform (only if derivatives exist) + link normalize + minify
  console.log("→ HTML…");
  const htmlFiles = await fg(["src/**/*.html", "!src/partials/**"], { cwd: ROOT });
  for (const rel of htmlFiles) {
    const srcPath = path.join(ROOT, rel);
    const raw = await fse.readFile(srcPath, "utf8");
    const withIncludes = await resolveIncludes(raw, path.dirname(srcPath));
    const baseReplaced = withIncludes.replaceAll("%BASE%", ""); // dist WITHOUT base
    const withPictures = (!IS_DEV && !SKIP_PICTURES) ? await transformImages(baseReplaced, /*base for assets*/ "") : baseReplaced;
    const normalized = normalizeLinks(withPictures);
    const minified = await minifyHtml(normalized, HTML_MINIFY_OPTIONS);
    const outPath = path.join(DIST_DIR, path.relative(SRC_DIR, srcPath));
    await fse.ensureDir(path.dirname(outPath));
    await fse.writeFile(outPath, minified, "utf8");
  }

  // 5) Copy static files (non html/css/js/img)
  const staticFiles = await fg(["src/**/*", "!src/**/*.html", "!src/css/**", "!src/js/**", "!src/img/**"], { cwd: ROOT, dot: true });
  for (const rel of staticFiles) {
    const from = path.join(ROOT, rel);
    const to = path.join(DIST_DIR, path.relative(SRC_DIR, from));
    await fse.ensureDir(path.dirname(to));
    await fse.copy(from, to);
  }

  // 6) sitemap.xml (for dist, without BASE)
  console.log("→ sitemap.xml (dist)…");
  await buildSitemap(DIST_DIR, /*withBase*/ false, PROJECT_BASE);

  // 7) iCloud copy WITH %BASE% (/%PROJECT_NAME%)
  console.log("→ iCloud copy…");
  await fse.ensureDir(ICLOUD_DIR);
  // copy assets
  await fse.copy(path.join(DIST_DIR, "assets"), path.join(ICLOUD_DIR, "assets"), { overwrite: true });
  // re-render HTML for BASE
  const htmlFiles2 = await fg(["src/**/*.html", "!src/partials/**"], { cwd: ROOT });
  for (const rel of htmlFiles2) {
    const srcPath = path.join(ROOT, rel);
    const raw = await fse.readFile(srcPath, "utf8");
    const withIncludes = await resolveIncludes(raw, path.dirname(srcPath));
    const baseReplaced = withIncludes.replaceAll("%BASE%", PROJECT_BASE);
    const withPictures = (!IS_DEV && !SKIP_PICTURES) ? await transformImages(baseReplaced, PROJECT_BASE) : baseReplaced;
    const normalized = normalizeLinks(withPictures);
    const minified = await minifyHtml(normalized, HTML_MINIFY_OPTIONS);
    const outPath = path.join(ICLOUD_DIR, path.relative(SRC_DIR, srcPath));
    await fse.ensureDir(path.dirname(outPath));
    await fse.writeFile(outPath, minified, "utf8");
  }
  // sitemap for iCloud (with BASE)
  console.log("→ sitemap.xml (iCloud)…");
  await buildSitemap(ICLOUD_DIR, /*withBase*/ true, PROJECT_BASE);

  console.timeEnd(IS_DEV ? "dev" : "build");
  console.log("✓ Done.");
}

async function resolveIncludes(html, baseDir) {
  const includeRegex = /@include\s+(.+)\s*$/gm;
  let match;
  while ((match = includeRegex.exec(html)) !== null) {
    const includePath = match[1].trim().replaceAll(/['"]/g, "");
    const full = path.resolve(baseDir, includePath);
    if (!fs.existsSync(full)) {
      html = html.replace(match[0], `<!-- include not found: ${includePath} -->`);
      continue;
    }
    let frag = await fse.readFile(full, "utf8");
    frag = await resolveIncludes(frag, path.dirname(full));
    html = html.replace(match[0], frag);
  }
  return html;
}

// Replace <img data-picture="auto" src="img/foo.jpg" alt="..."> with <picture>
// BASE_FOR_PATHS: "" for dist; "/%PROJECT_NAME%" for iCloud copy
async function transformImages(html, BASE_FOR_PATHS) {
  const re = /<img([^>]*?)\sdata-picture\s*=\s*["']auto["']([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gmi;
  return html.replace(re, (full, pre, mid, src, post) => {
    const parsed = path.parse(src);
    const name = parsed.name;
    const dir = parsed.dir.replace(/^\.?\/*/, "").replace(/^src\/?img\/?/, "").replace(/^img\/?/, "");
    const ext = (parsed.ext || ".jpg").replace(/^\./, ""); // 'jpg' or 'png'
    const fallbackExt = /^(jpe?g|png)$/i.test(ext) ? ext : "jpg";

    const altMatch = full.match(/\balt\s*=\s*["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : "";
    const loading = /loading=/.test(full) ? "" : ' loading="lazy"';
    const decoding = /decoding=/.test(full) ? "" : ' decoding="async"';
    const sizes = '(max-width: 480px) 480w, (max-width: 768px) 768w, (max-width: 1200px) 1200w, 1920w';

    const makePath = (w, ext) => {
      const sub = dir ? `${dir}/` : "";
      const basePrefix = BASE_FOR_PATHS ? `${BASE_FOR_PATHS}/assets/img/` : `/assets/img/`;
      return `${basePrefix}${sub}${name}-${w}.${ext}`;
    };

    const picture = `
<picture>
  <source type="image/avif" srcset="${[480,768,1200,1920].map(w => `${makePath(w,"avif")} ${w}w`).join(", ")}" sizes="${sizes}">
  <source type="image/webp" srcset="${[480,768,1200,1920].map(w => `${makePath(w,"webp")} ${w}w`).join(", ")}" sizes="${sizes}">
  <img src="${makePath(1200, fallbackExt)}" alt="${escapeHtml(alt)}"${loading}${decoding}>
</picture>`.trim();

    return picture;
  });
}

function normalizeLinks(html) {
  // /index.html#foo -> /#foo  |  /index.html -> /
  return html
    .replaceAll(/\/index\.html(#|\b)/g, "/$1")
    .replaceAll(/href="\#(.*?)"/g, 'href="#$1"'); // keep anchors intact
}

async function buildSitemap(targetDir, withBase, PROJECT_BASE) {
  const pages = await fg(["**/*.html", "!partials/**", "!**/404.html"], { cwd: targetDir });
  const lastmod = new Date().toISOString().split("T")[0];
  const urls = pages.map(p => {
    // normalize: foo/index.html -> foo/
    let urlPath = "/" + p.replace(/index\.html$/, "").replace(/\/$/, "");
    // ensure trailing slash for directories
    urlPath = (urlPath === "/" ? "/" : urlPath + "/");
    const href = withBase ? `${PROJECT_BASE}${urlPath}` : `${urlPath}`;
    return `  <url><loc>${href}</loc><lastmod>${lastmod}</lastmod></url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  await fse.writeFile(path.join(targetDir, "sitemap.xml"), xml, "utf8");
}

async function copyImages(from, to) {
  if (!fs.existsSync(from)) return;
  await fse.ensureDir(to);
  await fse.copy(from, to, { overwrite: true });
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function quote(p) {
  return `"${p.replace(/"/g, '\\"')}"`;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
