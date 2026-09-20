// Contact sheet for the six section banners, with the hero's scrim and crops
// faked on top so they can be judged without rebuilding the site.
//
//   node scripts/preview-banners.mjs && open /tmp/banners.png
//
// The dashed box is what a 390px phone keeps; everything outside it is desktop
// only. The wash across the foot is the gradient from src/styles/hero.css.
import sharp from "sharp";

const NAMES = [
  "banner-lectures",
  "banner-workshops",
  "banner-screenings",
  "banner-assessment",
  "banner-people",
  "banner-policies",
];

const W = 1400;
const H = Math.round((555 / 2560) * W);
const GAP = 14;

/** The scrim from src/styles/hero.css, as an overlay of the same shape. */
const scrim = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="s" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#f2ece0" stop-opacity="0.90"/>
    <stop offset="0.28" stop-color="#f2ece0" stop-opacity="0.86"/>
    <stop offset="0.46" stop-color="#f2ece0" stop-opacity="0.36"/>
    <stop offset="0.64" stop-color="#f2ece0" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#s)"/>
  <rect x="${Math.round(W * 0.383)}" y="1" width="${Math.round(W * 0.234)}" height="${H - 2}"
        fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="9 7"/>
</svg>`;

const tiles = [];
for (const [i, name] of NAMES.entries()) {
  const flat = await sharp(`src/assets/images/${name}.avif`).resize(W, H).png().toBuffer();
  const tile = await sharp(flat)
    .composite([{ input: Buffer.from(scrim) }])
    .png()
    .toBuffer();
  tiles.push({ input: tile, left: 0, top: i * (H + GAP) });
}

await sharp({
  create: {
    width: W,
    height: NAMES.length * (H + GAP),
    channels: 3,
    background: "#fffdfa",
  },
})
  .composite(tiles)
  .png()
  .toFile("/tmp/banners.png");
console.log("wrote /tmp/banners.png");
