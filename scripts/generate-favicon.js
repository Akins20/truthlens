const sharp = require("../node_modules/sharp");
const path = require("path");

async function generate() {
  const sizes = [
    { size: 32, out: "../src/app/favicon.ico" },   // Next.js favicon
    { size: 180, out: "../public/apple-icon.png" }, // Apple touch icon
    { size: 192, out: "../public/icon-192.png" },   // PWA
    { size: 512, out: "../public/icon-512.png" },   // PWA large
  ];

  for (const { size, out } of sizes) {
    const r = Math.floor(size * 0.22);
    const fs = Math.floor(size * 0.55);
    const svg = Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${r}" fill="#6366f1"/>
        <text x="${size / 2}" y="${size / 2}" font-family="Arial, Helvetica, sans-serif"
          font-weight="800" font-size="${fs}px" fill="white"
          text-anchor="middle" dominant-baseline="central">T</text>
      </svg>`
    );
    await sharp(svg).png().toFile(path.join(__dirname, out));
    console.log(`✓ ${out}`);
  }
}

generate().catch(console.error);
