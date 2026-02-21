const sharp = require("../node_modules/sharp");
const path = require("path");
const fs = require("fs");

const outDir = path.join(__dirname, "../extension/icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function generateIcon(size) {
  const r = Math.floor(size * 0.22);
  const fs2 = Math.floor(size * 0.58);
  const svg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${r}" fill="#6366f1"/>
      <text x="${size / 2}" y="${size / 2}" font-family="Arial, Helvetica, sans-serif"
        font-weight="800" font-size="${fs2}px" fill="white"
        text-anchor="middle" dominant-baseline="central">T</text>
    </svg>`
  );
  const out = path.join(outDir, `icon${size}.png`);
  await sharp(svg).png().toFile(out);
  console.log(`✓ icon${size}.png`);
}

Promise.all([16, 48, 128].map(generateIcon))
  .then(() => console.log("Icons generated."))
  .catch(console.error);
