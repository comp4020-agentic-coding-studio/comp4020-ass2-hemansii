// Generates the two pieces of artwork the site draws rather than illustrates:
// the home hero and the link-preview card. The six section banners are cut from
// drawings instead, in `scripts/make-banners.mjs`.
//
// The course teaches that a featural script builds its letters out of a small
// number of reusable parts, so that a letter's shape tells you something about
// the sound it stands for (week 8 — Tengwar, Hangul). The artwork is built the
// same way rather than drawn: every glyph here is a stem, plus a bow on one
// side, plus a grade, plus a vowel mark. Nothing is hand-placed.
//
// Two inks only, from the Slop palette in astro-theme-slop/slop.css — the gold
// is --at-primary verbatim. The gold layer is offset a little from the black
// one, which is what two-ink risograph misregistration actually looks like and
// is the register the rest of the Slop identity is printed in.
//
// The hero is that, straight: speech drawn as a spectrogram.
//
//   node scripts/make-artwork.mjs
//
// Rerun after changing anything here; the outputs are committed.

import sharp from "sharp";

const CREAM = "#f2ece0";
const INK = "#17130f";
const GOLD = "#b97d1c";

/** Deterministic PRNG, so the same seed always produces the same specimen. */
const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function svg({ width, height, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${CREAM}"/>
  ${body}
</svg>`;
}

/** Render one cream-ground artwork to AVIF. */
async function write(file, width, height, body) {
  await sharp(Buffer.from(svg({ width, height, body })))
    .avif({ quality: 62 })
    .toFile(`src/assets/images/${file}`);
  console.log(`wrote src/assets/images/${file}`);
}

/** Speech, as the spectrogram the phonology week teaches you to read. */
function bars(seed, W, H) {
  const rand = mulberry32(seed, W, H);
  const out = [];
  const mid = H * 0.5;
  for (let x = 60, i = 0; x < W - 40; x += 34, i += 1) {
    const envelope =
      Math.sin(i * 0.07) * 0.5 + Math.sin(i * 0.19 + 1.3) * 0.3 + Math.sin(i * 0.41) * 0.2;
    const h = (0.12 + Math.abs(envelope) * 0.78) * (H * 0.42) * (0.55 + rand() * 0.65);
    const gold = rand() < 0.38;
    out.push(
      `<path d="M${x} ${mid - h} L${x} ${mid + h}" stroke="${gold ? GOLD : INK}" ` +
        `stroke-width="18" stroke-linecap="round" opacity="${gold ? 0.92 : 0.84}"/>`,
    );
  }
  return out.join("");
}

const W = 2560;
const H = 1086;

// ---------------------------------------------------------------- hero -----
// Speech, drawn as the spectrogram the phonology week teaches you to read. The
// hero is cropped to different aspect ratios by the layout — object-fit cover
// shows the centre 45% of the height at 1920 and the centre 46% of the width at
// 390 — so the motif has to survive any crop. A band of bars does; anything
// with a focal point, or with letterforms big enough to be sliced, does not.
await write("hero-home.avif", W, H, bars(4022, W, H));

// ---------------------------------------------------------------- card -----
// 1200x630 — the link-preview card, which carries the course name because it is
// seen on its own, with no page around it.
{
  const width = 1200;
  const height = 630;
  const text = `
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="${INK}">
    <text x="84" y="486" font-size="34" letter-spacing="7" fill="${GOLD}">SLOP4022</text>
    <text x="84" y="556" font-size="66" font-weight="700">Nobody Speaks This Yet</text>
  </g>`;
  const body = `<g opacity="0.55">${bars(22, width, height * 0.72)}</g>${text}`;
  await sharp(Buffer.from(svg({ width, height, body })))
    .png()
    .toFile("src/assets/images/card.png");
  console.log("wrote src/assets/images/card.png");
}
