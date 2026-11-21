/**
 * One-time backdrop bake.
 *
 * The original art direction applied sepia / hue-rotate / saturate / brightness
 * filters plus full-screen `mix-blend-mode` glazes at runtime. Those force the
 * compositor to re-grade large bitmaps on every scroll frame, which is the main
 * cause of dropped frames on integrated GPUs and low-end phones.
 *
 * This script bakes the colour grade, crimson glaze, candlelit warmth and
 * chiaroscuro vignette directly into optimised WebP files. The browser then only
 * has to paint a normal `<img>` — zero per-frame filter work.
 *
 * Usage: npm run bake:backdrops
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const MEDIA_DIR = path.resolve(process.cwd(), 'public', 'media');

/** Pull the resized bitmap into memory so overlays can match its dimensions. */
async function grade({ input, output, width, quality, modulate, linear, overlay }) {
  let pipeline = sharp(path.join(MEDIA_DIR, input))
    .rotate()
    .resize({ width, withoutEnlargement: true });

  if (modulate) pipeline = pipeline.modulate(modulate);
  if (linear) pipeline = pipeline.linear(linear.a, linear.b);

  const { data, info } = await pipeline
    .toColourspace('srgb')
    .toBuffer({ resolveWithObject: true });

  let composed = sharp(data);
  if (overlay) {
    const svg = Buffer.from(overlay.svg(info.width, info.height));
    composed = composed.composite([{ input: svg, blend: overlay.blend ?? 'over' }]);
  }

  return composed.webp({ quality, effort: 5 }).toFile(path.join(MEDIA_DIR, output));
}

const jobs = [
  {
    // Deep burgundy sky tint + warm antique-gold dress highlights.
    input: 'hero-muse.jpg',
    output: 'hero-muse.webp',
    width: 1600,
    quality: 82,
    modulate: { brightness: 0.84, saturation: 1.42, hue: -18 },
    linear: { a: [1.06, 0.97, 1.04], b: [-3, -2, 5] },
    overlay: {
      blend: 'soft-light',
      svg: (w, h) => `
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4A0A18" stop-opacity="0.72" />
              <stop offset="46%" stop-color="#4A0A18" stop-opacity="0.10" />
              <stop offset="100%" stop-color="#4A0A18" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="58%" stop-color="#E0B268" stop-opacity="0" />
              <stop offset="100%" stop-color="#E0B268" stop-opacity="0.26" />
            </linearGradient>
          </defs>
          <rect width="${w}" height="${h}" fill="url(#sky)" />
          <rect width="${w}" height="${h}" fill="url(#gold)" />
        </svg>`,
    },
  },
  {
    // Dark painterly chiaroscuro with a crimson edge falloff.
    input: 'bg-pomegranates.jpg',
    output: 'bg-pomegranates.webp',
    width: 1400,
    quality: 80,
    modulate: { brightness: 0.54, saturation: 1.18, hue: -6 },
    linear: { a: [1.16, 1.13, 1.14], b: [-17, -16, -16] },
    overlay: {
      blend: 'multiply',
      svg: (w, h) => `
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="vig" cx="52%" cy="44%" r="72%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
              <stop offset="58%" stop-color="#D9B9A8" stop-opacity="0.94" />
              <stop offset="100%" stop-color="#5A0C10" stop-opacity="0.82" />
            </radialGradient>
          </defs>
          <rect width="${w}" height="${h}" fill="url(#vig)" />
        </svg>`,
    },
  },
  {
    // Candlelit Renaissance warmth with a soft gold key light.
    input: 'bg-fan.jpg',
    output: 'bg-fan.webp',
    width: 1400,
    quality: 80,
    modulate: { brightness: 0.70, saturation: 1.14, hue: -8 },
    linear: { a: [1.08, 1.0, 0.98], b: [-2, -1, 2] },
    overlay: {
      blend: 'soft-light',
      svg: (w, h) => `
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="candle" cx="64%" cy="58%" r="64%">
              <stop offset="0%" stop-color="#F0C070" stop-opacity="0.30" />
              <stop offset="46%" stop-color="#D89A52" stop-opacity="0.10" />
              <stop offset="100%" stop-color="#3A0A0C" stop-opacity="0.32" />
            </radialGradient>
          </defs>
          <rect width="${w}" height="${h}" fill="url(#candle)" />
        </svg>`,
    },
  },
  {
    // Lightweight woven tapestry tile for marquee / accordion / showcase.
    input: 'bg-tapestry.jpg',
    output: 'bg-tapestry.webp',
    width: 1200,
    quality: 72,
    modulate: { brightness: 0.92, saturation: 0.82 },
    linear: { a: [1.05, 1.04, 1.04], b: [-4, -4, -4] },
  },
];

await mkdir(MEDIA_DIR, { recursive: true });

for (const job of jobs) {
  const result = await grade(job);
  const kb = (result.size / 1024).toFixed(1);
  console.log(
    `✓ ${job.input} → ${job.output}  ${result.width}×${result.height}px  ${kb} kB`
  );
}

console.log('\nBackdrops baked. Components now paint plain WebP images at 0% GPU filter cost.');
