# 🚀 Project – Build & Workflow

This README is available in [Deutsch](README.de.md) 🇩🇪

# 🚀 Project – Build & Workflow

[![Node CI](https://github.com/<USERNAME>/node-tailwind-build-starter/actions/workflows/node-ci.yml/badge.svg)](https://github.com/<USERNAME>/node-tailwind-build-starter/actions/workflows/node-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This project uses a Node.js-based build system with Tailwind CSS, partials, minify, `<picture>` automation, and iCloud backup.

---

## 📦 Installation

After copying the project, please install the required dev dependencies:

```bash
npm i -D fs-extra fast-glob minimist html-minifier-terser esbuild tailwindcss postcss autoprefixer sharp svgo
```

Then change the name in package.json – the name must be the same in Worksource and in iCloud/Projekte!

## 📂 Project directories

By default, the following directories are used:

- **Working directory (source code):** `~/WorkSource/PROJECT_NAME`
- **Webserver copy (for deployment):** `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Sites/PROJECT_NAME`
- **Project folder with backups:** `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Projekte/PROJECT_NAME`

### How to change paths

- The defaults are set in the build and backup scripts (`scripts/build.mjs` and `scripts/backup.mjs`).
- You can override the defaults by setting environment variables before running the build:

  ```bash
  export ICLOUD_SITES_DIR="/custom/path/to/Sites"
  export ICLOUD_PROJECTS_DIR="/custom/path/to/Projekte"
  ```

- This way, you can adapt the locations to your personal setup without editing the scripts.

#### 🔑 Set up SSH key (if not already done)

1. Check if a key already exists:
   ```bash
   ls -al ~/.ssh
   ```
2. If not, generate a new SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your.email@domain.com"
   ```
3. Add the public key (`~/.ssh/id_ed25519.pub`) to GitHub under *Settings → SSH and GPG Keys → New SSH Key*.
4. Test the connection:
   ```bash
   ssh -T git@github.com
   ```

#### 📂 Create repository on GitHub

Before you can push your project, you need to create a repository on GitHub:

1. Go to https://github.com/new
2. Choose a repository name (ideally identical to your PROJECT_NAME)
3. Choose visibility (Public or Private)
4. Do not check README, .gitignore or License (these files already exist locally)
5. Create the repository and copy the SSH URL (Format: git@github.com:<USERNAME>/<REPO>.git)

Only after this can you connect locally with `git remote add origin ...` and run `git push`.

### 🚀 Create a new project on GitHub

1. Create a new repository on GitHub (without README, .gitignore, License).
2. Initialize in the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Add remote:
   ```bash
   git branch -M main
   git remote add origin git@github.com:<USERNAME>/<REPO>.git
   git push -u origin main
   ```

---

## 🔧 NPM Scripts

### `npm run dev`
- Runs `scripts/build.mjs` in **DEV mode**
- Builds & minifies HTML, CSS, JS
- Images are **only copied** (no derivatives)
- `%BASE%` is **empty** (e.g. for `dist/`)
- Additionally, a copy is created in iCloud with `%BASE% = /<PROJECT_NAME>`

---

### `npm run build`
- Runs `scripts/build.mjs` in **BUILD mode**
- Builds & minifies HTML, CSS, JS
- Images are optimized with `scripts/images.mjs` and derivatives (480, 768, 1200, 1920) are generated in **JPG/PNG, WebP, AVIF**
- `<img data-picture="auto">` is automatically rewritten to `<picture>` tags
- Sitemap is created
- `%BASE%` is **empty** in `dist/`, in the iCloud copy `/%PROJECT_NAME%`
- Copy in:
  - `dist/` (without base)
  - iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Sites/<PROJECT_NAME>`

---

### `npm run images`
- Runs `scripts/images.mjs` separately
- Generates image derivatives (480/768/1200/1920) including AVIF & WebP
- Useful if only images need to be rebuilt

---

### `npm run backup`
- Runs `scripts/backup.mjs`
- Creates a ZIP of all `src/` files
- Saves the backup in:
  - Local: `backup/project-backup-YYYY-MM-DD-HH-MM-SS.zip`
  - iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Projekte/<PROJECT_NAME>/backup/backup_<PROJECT_NAME>_YYYY-MM-DD-HH-MM-SS.zip`
- **Only the last 5 backups** are kept in iCloud

---

### `npm run tw`
- Builds only Tailwind CSS (once, minified)
- Output: `dist/assets/css/style.css`

---

### `npm run clean`
- Removes the `dist/` directory (if present)

---

## 🧪 Features
- Tailwind CSS (with Autoprefixer)
- Partials (`@include`)
- HTML/JS/CSS minify
- `<picture>` automation with AVIF/WebP
- Sitemap creation
- Backup (local + iCloud, max. 5 files)
- DEV: fast builds (images only copied)
- BUILD: full optimization including image derivatives

---

## ✅ Next steps
- Adjust content in `src/`
- Expand partials (`src/partials/`)
- Configure your own colors/fonts in `tailwind.config.js`
- Use `npm run build` to generate the final version

---

## 👤 Autor
- **Sven Muscheid** – [www.dcm-net.de](https://www.dcm-net.de)
- GitHub: [@smu-essen](https://github.com/smu-essen)

## 📄 Lizenz
MIT © 2025 [Sven Muscheid](https://www.dcm-net.de)