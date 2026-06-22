#!/usr/bin/env node
// One-off / re-runnable maintenance script: resizes and recompresses everything
// under src/assets/ in place, capping resolution per asset category based on
// how large it's ever actually displayed (see RULES below). Skips vectors and
// favicons. Run with: npm run optimize-assets

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(__dirname, "..", "src", "assets");
const SKIP_EXTENSIONS = new Set([".svg", ".ico"]);

// First matching rule wins. maxDimension caps the longer edge (aspect ratio
// preserved); withoutEnlargement means already-small files are left alone.
const RULES = [
  {
    name: "backgrounds & banners (photo-like, avoid palette banding)",
    test: (relPath) => relPath.startsWith("backgrounds/") || /Banner(-NoDiver)?\.(jpe?g|png)$/i.test(relPath),
    maxDimension: 2400,
    jpegQuality: 80,
    pngPalette: false,
  },
  {
    name: "social icons (small, flat-color)",
    test: (relPath) => relPath.startsWith("logos/socials/"),
    maxDimension: 320,
    jpegQuality: 85,
    pngPalette: true,
  },
  {
    name: "partner logos (small, flat-color)",
    test: (relPath) => relPath.startsWith("logos/partners/"),
    maxDimension: 450,
    jpegQuality: 85,
    pngPalette: true,
  },
  {
    name: "kilele logo variants (header/brand logos)",
    test: (relPath) => relPath.startsWith("logos/") && /^kilele/i.test(path.basename(relPath)),
    maxDimension: 1200,
    jpegQuality: 85,
    pngPalette: true,
  },
  {
    name: "photos (placeholder, key art, 2025 archive)",
    test: (relPath) => relPath === "images/placeholder.jpg" || relPath.startsWith("images/2025/") || /Key-Art/i.test(relPath) || /LogoDates/i.test(relPath),
    maxDimension: 1600,
    jpegQuality: 80,
    pngPalette: false,
  },
  {
    name: "fallback",
    test: () => true,
    maxDimension: 2000,
    jpegQuality: 82,
    pngPalette: false,
  },
];

function findRule(relPath) {
  return RULES.find((r) => r.test(relPath));
}

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(abs));
    } else {
      files.push(abs);
    }
  }
  return files;
}

async function processFile(absPath) {
  const relPath = path.relative(ASSETS_DIR, absPath).split(path.sep).join("/");
  const ext = path.extname(absPath).toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) return null;

  const before = fs.statSync(absPath).size;
  const rule = findRule(relPath);

  let img = sharp(absPath, { failOn: "none" }).resize({
    width: rule.maxDimension,
    height: rule.maxDimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (ext === ".jpg" || ext === ".jpeg") {
    img = img.jpeg({ quality: rule.jpegQuality, mozjpeg: true });
  } else if (ext === ".png") {
    img = img.png({ compressionLevel: 9, palette: rule.pngPalette, quality: 90 });
  } else if (ext === ".webp") {
    img = img.webp({ quality: rule.jpegQuality });
  } else {
    return null; // unknown/unsupported type, skip
  }

  const buffer = await img.toBuffer();

  if (buffer.length < before) {
    fs.writeFileSync(absPath, buffer);
    return { relPath, before, after: buffer.length };
  }
  return { relPath, before, after: before, skipped: true };
}

async function main() {
  const files = walk(ASSETS_DIR);
  const results = [];

  for (const absPath of files) {
    try {
      const result = await processFile(absPath);
      if (result) results.push(result);
    } catch (err) {
      console.error(`Failed: ${path.relative(ASSETS_DIR, absPath)}: ${err.message}`);
    }
  }

  results.sort((a, b) => b.before - a.before);

  let totalBefore = 0;
  let totalAfter = 0;
  for (const r of results) {
    totalBefore += r.before;
    totalAfter += r.after;
    const pct = r.before > 0 ? (100 * (1 - r.after / r.before)).toFixed(0) : 0;
    const label = r.skipped ? "unchanged" : "optimized";
    console.log(
      `${label.padEnd(9)} ${r.relPath.padEnd(55)} ${(r.before / 1024).toFixed(0).padStart(6)} KB -> ${(r.after / 1024).toFixed(0).padStart(6)} KB (${pct}%)`
    );
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)} MB -> ${(totalAfter / 1024 / 1024).toFixed(1)} MB`
  );
}

main();
