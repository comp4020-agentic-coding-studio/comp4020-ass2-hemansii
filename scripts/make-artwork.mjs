// Generates the site artwork: a specimen sheet of an invented script.
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

/**
 * One glyph, assembled from parts.
 * side  — which side of the stem the bow sits on
 * grade — 1 short stem, 2 full stem, 3 doubled bow, 4 barred
 * vowel — the mark above the stem, carried by the gold ink
 */
function glyph(side, grade, vowel, cw, ch) {
  const sx = side === "r" ? cw * 0.32 : cw * 0.68;
  const r = cw * 0.23;
  const cy = ch * 0.55;
  const sweep = side === "r" ? 1 : 0;
  const top = grade >= 2 ? ch * 0.15 : cy - r;
  const bot = grade === 4 ? ch * 0.9 : cy + r;

  const d = [
    `M${sx} ${top} L${sx} ${bot}`,
    `M${sx} ${cy - r} A${r} ${r} 0 0 ${sweep} ${sx} ${cy + r}`,
  ];
  if (grade === 3) {
    const r2 = r * 0.52;
    d.push(`M${sx} ${cy - r2} A${r2} ${r2} 0 0 ${sweep} ${sx} ${cy + r2}`);
  }
  if (grade === 4) {
    d.push(`M${sx - r * 0.85} ${cy + r * 1.5} L${sx + r * 0.85} ${cy + r * 1.5}`);
  }

  const my = top - ch * 0.11;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="${cw * 0.045}" />`;
  const mark = {
    0: "",
    1: dot(sx, my),
    2: `${dot(sx - cw * 0.1, my)}${dot(sx + cw * 0.1, my)}`,
    3: `<path d="M${sx - cw * 0.11} ${my + ch * 0.035} L${sx + cw * 0.11} ${my - ch * 0.035}" />`,
    4: `<path d="M${sx - cw * 0.12} ${my + ch * 0.03} Q${sx} ${my - ch * 0.06} ${sx + cw * 0.12} ${my + ch * 0.03}" />`,
  }[vowel];

  return { ink: `<path d="${d.join(" ")}" />`, gold: mark };
}

/** Lines of glyph "words", laid out like a page of writing. */
function specimen({ width, cw, ch, top, left, lines, seed, wordMin, wordMax, wordSpace = 1.2 }) {
  const rand = mulberry32(seed);
  const ink = [];
  const gold = [];

  for (let row = 0; row < lines; row += 1) {
    let x = left;
    const y = top + row * ch * 1.55;
    // A ragged right edge, because real writing does not end flush.
    const limit = width - left - cw * (row % 3) * 1.6;
    while (x < limit) {
      const word = wordMin + Math.floor(rand() * (wordMax - wordMin + 1));
      for (let i = 0; i < word && x < limit; i += 1) {
        const g = glyph(
          rand() < 0.5 ? "r" : "l",
          1 + Math.floor(rand() * 4),
          Math.floor(rand() * 5),
          cw,
          ch,
        );
        ink.push(`<g transform="translate(${x} ${y})">${g.ink}</g>`);
        if (g.gold) gold.push(`<g transform="translate(${x} ${y})">${g.gold}</g>`);
        x += cw;
      }
      // A word space wide enough to read as a break rather than a wobble.
      x += cw * wordSpace;
    }
  }
  return { ink, gold };
}

function svg({ width, height, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${CREAM}"/>
  ${body}
</svg>`;
}

/** The two ink layers, gold offset from black — riso misregistration. */
function inked({ ink, gold, strokeInk, strokeGold, dx = 5, dy = 4 }) {
  return `
  <g transform="translate(${dx} ${dy})" fill="${GOLD}" stroke="${GOLD}"
     stroke-width="${strokeGold}" stroke-linecap="round" opacity="0.92">${gold.join("")}</g>
  <g fill="none" stroke="${INK}" stroke-width="${strokeInk}" stroke-linecap="round"
     stroke-linejoin="round">${ink.join("")}</g>`;
}

// ---------------------------------------------------------------- hero -----
// 2560x1086, matching the dimensions the starter hero occupied.
{
  const width = 2560;
  const height = 1086;
  // An even, all-over texture with no single focal point. The hero is cropped
  // to different aspect ratios by the layout, so anything with a focus loses it
  // at one of the marking viewports; a page of writing survives any crop.
  const { ink, gold } = specimen({
    width,
    cw: 74,
    ch: 128,
    top: 132,
    left: 150,
    lines: 5,
    seed: 4022,
    wordMin: 2,
    wordMax: 6,
    wordSpace: 1.25,
  });

  const body = inked({ ink, gold, strokeInk: 7, strokeGold: 7 });
  await sharp(Buffer.from(svg({ width, height, body })))
    .avif({ quality: 62 })
    .toFile("src/assets/images/hero-home.avif");
  console.log("wrote src/assets/images/hero-home.avif");
}

// ---------------------------------------------------------------- card -----
// 1200x630 — the link-preview card, which has to carry the course name because
// it is seen on its own, with no page around it.
{
  const width = 1200;
  const height = 630;
  // Three lines, stopping well clear of the title block underneath.
  const { ink, gold } = specimen({
    width,
    cw: 52,
    ch: 86,
    top: 78,
    left: 84,
    lines: 3,
    seed: 22,
    wordMin: 2,
    wordMax: 5,
    wordSpace: 1.3,
  });

  const text = `
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="${INK}">
    <text x="84" y="486" font-size="34" letter-spacing="7" fill="${GOLD}">SLOP4022</text>
    <text x="84" y="556" font-size="66" font-weight="700">Nobody Speaks This Yet</text>
  </g>`;

  const body = inked({ ink, gold, strokeInk: 5, strokeGold: 5, dx: 4, dy: 3 }) + text;
  await sharp(Buffer.from(svg({ width, height, body })))
    .png()
    .toFile("src/assets/images/card.png");
  console.log("wrote src/assets/images/card.png");
}
