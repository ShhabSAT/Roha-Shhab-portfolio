#!/usr/bin/env node
/**
 * Automated media ingestion for the Roha Shhab portfolio.
 *
 * Scans ./raw-assets for folders whose names begin with 1–12, then:
 *   • Folders 1–11 → 900px-wide WebP plates at public/media/works/folder-XX/NN.webp
 *   • Folder 12     → public/media/works/reels/reel-NN.mp4
 *   • Regenerates    src/data/generatedMedia.ts
 *
 * Run: npm run import:media
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'raw-assets');
const WORKS_DIR = path.join(ROOT, 'public', 'media', 'works');
const GENERATED_FILE = path.join(ROOT, 'src', 'data', 'generatedMedia.ts');

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm)$/i;
const TARGET_WIDTH = 900;

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function naturalSort(files) {
  return [...files].sort((a, b) => collator.compare(a, b));
}

function folderNumber(name) {
  const match = name.match(/^\s*(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return n >= 1 && n <= 12 ? n : null;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/** Average colour of a one-pixel-high strip, used to extend square artwork seamlessly. */
async function edgeColor(buffer, width, height, fromTop) {
  const { data } = await sharp(buffer)
    .extract({
      left: 0,
      top: fromTop ? 0 : Math.max(0, height - 1),
      width,
      height: 1,
    })
    .resize(1, 1, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { r: data[0], g: data[1], b: data[2] };
}

/**
 * Produce an exact 3:4 WebP.
 *
 * Most source posts are 4:5 — only 6% of the width is trimmed to reach 3:4.
 * Square or wide artwork is never cropped; it is extended on the top/bottom
 * with the sampled edge colour so the original composition survives intact.
 */
async function convertPortrait(input, output) {
  // Bake EXIF rotation first so every later crop uses true pixel dimensions.
  const rotated = await sharp(input).rotate().toBuffer({ resolveWithObject: true });
  const srcW = rotated.info.width;
  const srcH = rotated.info.height;
  assert(srcW && srcH, `Unreadable image dimensions: ${input}`);

  const ratio = srcW / srcH;
  let pipeline;

  if (ratio <= 0.84) {
    // Portrait artwork (3:4 or 4:5): calculate the exact 3:4 centre crop by
    // hand, then downscale. This guarantees exact 3:4 even for small files
    // that must never be enlarged.
    const cropW = ratio > 0.75 ? Math.round(srcH * 0.75) : srcW;
    const cropH = ratio > 0.75 ? srcH : Math.round(srcW / 0.75);
    const left = Math.floor((srcW - cropW) / 2);
    const top = Math.floor((srcH - cropH) / 2);
    const outW = Math.min(TARGET_WIDTH, cropW);
    const outH = Math.round((outW * 4) / 3);

    pipeline = sharp(rotated.data)
      .extract({ left, top, width: cropW, height: cropH })
      .resize({ width: outW, height: outH, fit: 'fill' });
  } else {
    // Square or wide artwork: fit the full width, then extend top/bottom
    // with the sampled edge colours so no part of the composition is lost.
    const base = await sharp(rotated.data)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });

    const targetH = Math.round((base.info.width * 4) / 3);
    const padTotal = Math.max(0, targetH - base.info.height);
    const padTop = Math.floor(padTotal / 2);
    const padBottom = padTotal - padTop;

    const top = await edgeColor(base.data, base.info.width, base.info.height, true);
    const bottom = await edgeColor(base.data, base.info.width, base.info.height, false);

    let extended = base.data;
    if (padTop > 0) {
      extended = await sharp(extended)
        .extend({ top: padTop, bottom: 0, left: 0, right: 0, background: top })
        .toBuffer();
    }
    if (padBottom > 0) {
      extended = await sharp(extended)
        .extend({ top: 0, bottom: padBottom, left: 0, right: 0, background: bottom })
        .toBuffer();
    }

    pipeline = sharp(extended);
  }

  const info = await pipeline
    .toFormat('webp', { quality: 84, effort: 4 })
    .toFile(output);

  return { width: info.width, height: info.height, srcW, srcH };
}

async function main() {
  assert(fs.existsSync(RAW_DIR), `Missing source directory: ${RAW_DIR}`);

  const entries = fs.readdirSync(RAW_DIR, { withFileTypes: true });
  const folders = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const n = folderNumber(entry.name);
    if (!n) continue;
    assert(!folders.has(n), `Duplicate folder number ${n}: ${entry.name}`);
    folders.set(n, path.join(RAW_DIR, entry.name));
  }

  for (let n = 1; n <= 12; n += 1) {
    assert(folders.has(n), `Could not find a numbered folder for ${n} in raw-assets`);
  }

  // Rebuild the generated output so stale files never linger.
  fs.rmSync(WORKS_DIR, { recursive: true, force: true });
  fs.mkdirSync(WORKS_DIR, { recursive: true });

  const folderMedia = {};
  let imageCount = 0;

  for (let n = 1; n <= 11; n += 1) {
    const folder = folders.get(n);
    const files = naturalSort(
      fs
        .readdirSync(folder)
        .filter((file) => IMAGE_EXT.test(file) && fs.statSync(path.join(folder, file)).isFile())
    );

    assert(files.length > 0, `No images found in folder ${n}: ${folder}`);

    const outDir = path.join(WORKS_DIR, `folder-${pad2(n)}`);
    fs.mkdirSync(outDir, { recursive: true });

    folderMedia[n] = [];
    console.log(`\nFolder ${pad2(n)} — ${files.length} image(s)`);

    for (let i = 0; i < files.length; i += 1) {
      const outName = `${pad2(i + 1)}.webp`;
      const outPath = path.join(outDir, outName);
      const result = await convertPortrait(path.join(folder, files[i]), outPath);
      const rel = `/media/works/folder-${pad2(n)}/${outName}`;
      folderMedia[n].push(rel);
      imageCount += 1;
      console.log(
        `  ✓ ${rel}  ${result.width}×${result.height}  (from ${result.srcW}×${result.srcH})`
      );
    }
  }

  const reelFolder = folders.get(12);
  const videoFiles = naturalSort(
    fs
      .readdirSync(reelFolder)
      .filter((file) => VIDEO_EXT.test(file) && fs.statSync(path.join(reelFolder, file)).isFile())
  );

  assert(videoFiles.length > 0, `No videos found in folder 12: ${reelFolder}`);

  const reelDir = path.join(WORKS_DIR, 'reels');
  fs.mkdirSync(reelDir, { recursive: true });

  const reelVideos = [];
  console.log(`\nFolder 12 — ${videoFiles.length} video(s)`);

  for (let i = 0; i < videoFiles.length; i += 1) {
    const source = path.join(reelFolder, videoFiles[i]);
    const outName = `reel-${pad2(i + 1)}.mp4`;
    const outPath = path.join(reelDir, outName);
    fs.copyFileSync(source, outPath);
    const rel = `/media/works/reels/${outName}`;
    reelVideos.push(rel);
    console.log(
      `  ✓ ${rel}  ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB  (from ${videoFiles[i]})`
    );
  }

  const lines = [
    '// AUTO-GENERATED by scripts/import-media.mjs — do not edit by hand.',
    '// Run `npm run import:media` after adding or reordering raw-assets.',
    '',
    'export const FOLDER_MEDIA: Record<number, string[]> = {',
  ];

  for (let n = 1; n <= 11; n += 1) {
    lines.push(`  ${n}: [`);
    for (const src of folderMedia[n]) {
      lines.push(`    '${src}',`);
    }
    lines.push('  ],');
  }

  lines.push('};', '');
  lines.push('export const REEL_VIDEOS: string[] = [');
  for (const src of reelVideos) {
    lines.push(`  '${src}',`);
  }
  lines.push('];', '');

  fs.mkdirSync(path.dirname(GENERATED_FILE), { recursive: true });
  fs.writeFileSync(GENERATED_FILE, lines.join('\n'), 'utf8');

  console.log(
    `\nDone — ${imageCount} portrait WebP plates + ${reelVideos.length} reels.`
  );
  console.log(`Manifest: ${path.relative(ROOT, GENERATED_FILE)}`);
}

main().catch((error) => {
  console.error(`\nMedia import failed: ${error.message}`);
  process.exitCode = 1;
});
