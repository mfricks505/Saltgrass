// Run this in your saltgrass folder:
// node generate-icons.js
//
// Generates Android app icons from the Saltgrass SVG
// Requires: npm install sharp (run this first)

const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

// The SVG as a buffer — simplified version optimized for small sizes
const SVG = `
<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#4A5240" rx="180"/>
  <!-- Sun -->
  <circle cx="512" cy="420" r="240" fill="#E8DFC8"/>
  <!-- Ground -->
  <path d="M272 470 C360 445 420 465 480 450 C570 430 650 460 752 435 L752 510 L272 510 Z" fill="#3D4535"/>
  <!-- Grass -->
  <path d="M280 580 C295 500 320 470 335 565
           M325 580 C340 495 365 475 368 565
           M600 580 C615 500 640 470 655 565
           M645 580 C660 495 685 475 688 565"
    stroke="#1A1E14" stroke-width="18" stroke-linecap="round" fill="none"/>
  <!-- Hunter silhouette -->
  <g fill="#1A1E14">
    <circle cx="390" cy="355" r="36"/>
    <path d="M355 390 C330 450 335 540 368 610 L460 610 C445 535 448 450 420 390 Z"/>
    <path d="M358 410 L270 355 L252 374 L348 440 Z"/>
    <path d="M415 410 L510 345 L528 364 L438 455 Z"/>
    <path d="M285 318 L610 215 L625 238 L305 345 Z"/>
  </g>
  <!-- Fisherman silhouette -->
  <g fill="#1A1E14">
    <circle cx="610" cy="362" r="33"/>
    <path d="M580 395 C555 450 568 530 598 610 L675 610 C662 520 652 445 635 395 Z"/>
    <path d="M588 420 L690 358 L708 378 L622 468 Z"/>
  </g>
  <!-- Fishing rod -->
  <path d="M705 355 C800 190 920 185 908 420"
    stroke="#1A1E14" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M908 420 C872 495 800 548 728 572"
    stroke="#E8DFC8" stroke-width="4" fill="none"/>
  <!-- Wordmark -->
  <text x="512" y="800"
    text-anchor="middle"
    font-family="Arial Black, Impact, sans-serif"
    font-size="108" font-weight="900"
    fill="#E8DFC8" letter-spacing="3">SALTGRASS</text>
  <!-- Copper accent lines -->
  <path d="M340 840 H450 M574 840 H684"
    stroke="#D4982E" stroke-width="10" stroke-linecap="round"/>
</svg>`

const SIZES = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

const BASE = 'android/app/src/main/res'

async function generate() {
  for (const { dir, size } of SIZES) {
    const outDir  = path.join(BASE, dir)
    const outFile = path.join(outDir, 'ic_launcher.png')
    const outRound = path.join(outDir, 'ic_launcher_round.png')

    await sharp(Buffer.from(SVG))
      .resize(size, size)
      .png()
      .toFile(outFile)

    await sharp(Buffer.from(SVG))
      .resize(size, size)
      .png()
      .toFile(outRound)

    console.log(`✓ ${dir} — ${size}x${size}px`)
  }

  // Also generate Play Store icon (512x512)
  await sharp(Buffer.from(SVG))
    .resize(512, 512)
    .png()
    .toFile('saltgrass-play-store-icon.png')

  console.log('✓ Play Store icon — 512x512px')
  console.log('\nAll icons generated. Run: npx cap sync')
}

generate().catch(console.error)
