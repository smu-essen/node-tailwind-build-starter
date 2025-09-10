# 🚀 Project – Build & Workflow

This README is available in [Deutsch](README.de.md) 🇩🇪

# 🚀 Projekt – Build & Workflow

[![Node CI](https://github.com/<USERNAME>/node-tailwind-build-starter/actions/workflows/node-ci.yml/badge.svg)](https://github.com/<USERNAME>/node-tailwind-build-starter/actions/workflows/node-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Dieses Projekt verwendet ein Node.js-basiertes Build-System mit Tailwind CSS, Partials, Minify, `<picture>`-Automatik und iCloud-Backup.

---

## 📦 Installation

Nach dem Kopieren des Projekts bitte zunächst die benötigten Dev-Dependencies installieren:

```bash
npm i -D fs-extra fast-glob minimist html-minifier-terser esbuild tailwindcss postcss autoprefixer sharp svgo
```

Dann den Namen in package.json ändern - Name muss in Worksource und in iCloud/Projekte gleich sein!

## 📂 Projektordner

Standardmäßig werden folgende Verzeichnisse genutzt:

- **Arbeitsordner (Quellcode):** `~/WorkSource/PROJECT_NAME`
- **Webserver-Kopie (für Deployment):** `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Sites/PROJECT_NAME`
- **Projektordner mit Backups:** `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Projekte/PROJECT_NAME`

### Pfade anpassen

- Die Standardpfade sind in den Build- und Backup-Skripten (`scripts/build.mjs` und `scripts/backup.mjs`) hinterlegt.
- Du kannst die Pfade überschreiben, indem du Umgebungsvariablen setzt, bevor du den Build startest:

  ```bash
  export ICLOUD_SITES_DIR="/eigener/pfad/zu/Sites"
  export ICLOUD_PROJECTS_DIR="/eigener/pfad/zu/Projekte"
  ```

- Auf diese Weise kannst du die Verzeichnisse an dein Setup anpassen, ohne die Skripte zu ändern.

#### 🔑 SSH-Key einrichten (falls noch nicht vorhanden)

1. Prüfen, ob schon ein Key existiert:
   ```bash
   ls -al ~/.ssh
   ```
2. Falls nicht vorhanden, neuen SSH-Key erzeugen:
   ```bash
   ssh-keygen -t ed25519 -C "deine.email@domain.de"
   ```
3. Public-Key (`~/.ssh/id_ed25519.pub`) bei GitHub unter *Settings → SSH and GPG Keys → New SSH Key* einfügen.
4. Verbindung testen:
   ```bash
   ssh -T git@github.com
   ```

#### 📂 Repository auf GitHub erstellen

Bevor du dein Projekt pushen kannst, musst du ein Repository auf GitHub anlegen:

1. Gehe auf https://github.com/new
2. Repository-Name vergeben (am besten identisch zu deinem PROJECT_NAME)
3. Sichtbarkeit wählen (Public oder Private)
4. Keine README, .gitignore oder License anhaken (die Dateien liegen schon lokal)
5. Repository erstellen und die SSH-URL kopieren (Format: git@github.com:<USERNAME>/<REPO>.git)

Erst danach kannst du lokal mit `git remote add origin ...` verbinden und `git push` ausführen.

### 🚀 Neues Projekt bei GitHub anlegen

1. Neues Repository auf GitHub erstellen (ohne README, .gitignore, License).
2. Im Projektordner initialisieren:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Remote hinzufügen:
   ```bash
   git branch -M main
   git remote add origin git@github.com:<USERNAME>/<REPO>.git
   git push -u origin main
   ```

---

## 🔧 NPM-Scripts

### `npm run dev`
- Führt `scripts/build.mjs` im **DEV-Modus** aus
- HTML, CSS, JS werden gebaut & minifiziert
- Bilder werden **nur kopiert** (keine Derivate)
- `%BASE%` ist **leer** (z. B. für `dist/`)
- Es wird zusätzlich eine Kopie in iCloud erzeugt mit `%BASE% = /<PROJECT_NAME>`

---

### `npm run build`
- Führt `scripts/build.mjs` im **BUILD-Modus** aus
- HTML, CSS, JS werden gebaut & minifiziert
- Bilder werden mit `scripts/images.mjs` optimiert und als Derivate (480, 768, 1200, 1920) in **JPG/PNG, WebP, AVIF** erzeugt
- `<img data-picture="auto">` wird automatisch in `<picture>`-Tags umgeschrieben
- Sitemap wird erstellt
- `%BASE%` ist **leer** in `dist/`, in der iCloud-Kopie `/%PROJECT_NAME%`
- Kopie in:
  - `dist/` (ohne Base)
  - iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Sites/<PROJECT_NAME>`

---

### `npm run images`
- Führt `scripts/images.mjs` separat aus
- Generiert Bildderivate (480/768/1200/1920) inkl. AVIF & WebP
- Sinnvoll, wenn nur Bilder neu gebaut werden sollen

---

### `npm run backup`
- Führt `scripts/backup.mjs` aus
- Erstellt ein ZIP aller `src/`-Dateien
- Speichert das Backup in:
  - Lokal: `backup/project-backup-YYYY-MM-DD-HH-MM-SS.zip`
  - iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/Work/Projekte/<PROJECT_NAME>/backup/backup_<PROJECT_NAME>_YYYY-MM-DD-HH-MM-SS.zip`
- In iCloud werden **nur die letzten 5 Backups** behalten

---

### `npm run tw`
- Baut nur Tailwind CSS (einmalig, minified)
- Output: `dist/assets/css/style.css`

---

### `npm run clean`
- Entfernt das `dist/`-Verzeichnis (falls vorhanden)

---

## 🧪 Features
- Tailwind CSS (mit Autoprefixer)
- Partials (`@include`)
- HTML/JS/CSS minify
- `<picture>`-Automatik mit AVIF/WebP
- Sitemap-Erstellung
- Backup (lokal + iCloud, max. 5 Dateien)
- DEV: schnelle Builds (Bilder nur kopieren)
- BUILD: komplette Optimierung inkl. Bild-Derivate

---

## ✅ Nächste Schritte
- Inhalte in `src/` anpassen
- Partials (`src/partials/`) erweitern
- Eigene Farben/Fonts in `tailwind.config.js` konfigurieren
- `npm run build` zum Erzeugen der finalen Version verwenden
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