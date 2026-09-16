// Generates every piece of artwork on the site: the home hero, the link-preview
// card, and one banner per section.
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
// Six motifs, two inks, one rule — assembled from parts, never hand-placed —
// so the sections read as one family rather than as six stock images. Each is
// drawn from something the course deals in: speech as a waveform, writing as a
// page of script, the bow of a letter past reading size, a marking grid, a
// strip of film.
//
//   node scripts/make-artwork.mjs
//
// Rerun after changing anything here; the outputs are committed.

import sharp from "sharp";

import { glyph } from "../src/lib/glyph.mjs";

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
 * Lines of glyph "words", laid out like a page of writing.
 *
 * `rubricate` is the proportion of letters printed entirely in the second ink
 * rather than just their vowel mark — rubrication, which is what two-colour
 * printing was invented to do. It is the difference between artwork that reads
 * as warm and artwork that reads as grey under the hero's scrim.
 *
 * `codaRate` is how often a syllable closes. The script writes a coda as a mark
 * below the stem, so this is also what keeps the texture from being uniformly
 * top-heavy.
 */
function specimen({
  width,
  cw,
  ch,
  top,
  left,
  lines,
  seed,
  wordMin,
  wordMax,
  wordSpace = 1.2,
  rubricate = 0,
  codaRate = 0,
}) {
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
          rand() < codaRate ? (rand() < 0.5 ? 1 : 3) : 0,
        );
        const at = (parts) => `<g transform="translate(${x} ${y})">${parts}</g>`;
        if (rand() < rubricate) {
          gold.push(at(g.ink + g.gold));
        } else {
          ink.push(at(g.ink));
          if (g.gold) gold.push(at(g.gold));
        }
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

/** Render one cream-ground artwork to AVIF. */
async function write(file, width, height, body) {
  await sharp(Buffer.from(svg({ width, height, body })))
    .avif({ quality: 62 })
    .toFile(`src/assets/images/${file}`);
  console.log(`wrote src/assets/images/${file}`);
}

/** Deterministic PRNG, so the same seed always produces the same banner. */

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

/** The bow of a letter, blown up past reading size — the workshop is where you make them. */
function bows(seed, W, H) {
  const rand = mulberry32(seed, W, H);
  const out = [];
  for (let i = 0; i < 46; i += 1) {
    const r = 90 + rand() * 330;
    const x = rand() * W;
    const y = 120 + rand() * (H - 240);
    const sweep = rand() < 0.5 ? 1 : 0;
    const gold = rand() < 0.42;
    const width = 9 + rand() * 13;
    out.push(
      `<path d="M${x} ${y - r} A${r} ${r} 0 0 ${sweep} ${x} ${y + r}" fill="none" ` +
        `stroke="${gold ? GOLD : INK}" stroke-width="${width}" stroke-linecap="round" ` +
        `opacity="${gold ? 0.9 : 0.82}"/>`,
    );
    if (rand() < 0.45) {
      out.push(
        `<path d="M${x} ${y - r} L${x} ${y + r}" fill="none" stroke="${gold ? INK : GOLD}" ` +
          `stroke-width="${width * 0.7}" stroke-linecap="round" opacity="0.75"/>`,
      );
    }
  }
  return out.join("");
}

/** A marking grid: ruled cells, some of them ticked. */
function grid(seed, W, H) {
  const rand = mulberry32(seed, W, H);
  const out = [];
  const cell = 148;
  for (let x = 0; x <= W; x += cell) {
    out.push(
      `<path d="M${x} 0 L${x} ${H}" stroke="${INK}" stroke-width="2" opacity="0.16"/>`,
    );
  }
  for (let y = 0; y <= H; y += cell) {
    out.push(`<path d="M0 ${y} L${W} ${y}" stroke="${INK}" stroke-width="2" opacity="0.16"/>`);
  }
  for (let y = cell / 2; y < H; y += cell) {
    for (let x = cell / 2; x < W; x += cell) {
      const roll = rand();
      if (roll < 0.62) continue;
      const gold = rand() < 0.55;
      const c = gold ? GOLD : INK;
      if (roll < 0.84) {
        // A tick.
        out.push(
          `<path d="M${x - 26} ${y + 2} L${x - 6} ${y + 24} L${x + 30} ${y - 26}" fill="none" ` +
            `stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" ` +
            `opacity="0.9"/>`,
        );
      } else {
        // A weight, filled in.
        out.push(`<circle cx="${x}" cy="${y}" r="20" fill="${c}" opacity="0.85"/>`);
      }
    }
  }
  return out.join("");
}

/** Stems at speaking height: a row of people, more or less. */
function stems(seed, W, H) {
  const rand = mulberry32(seed, W, H);
  const out = [];
  const base = H * 0.78;
  for (let x = 70; x < W - 40; x += 58) {
    const h = 180 + rand() * 420;
    const gold = rand() < 0.4;
    const c = gold ? GOLD : INK;
    out.push(
      `<path d="M${x} ${base} L${x} ${base - h}" stroke="${c}" stroke-width="14" ` +
        `stroke-linecap="round" opacity="${gold ? 0.92 : 0.82}"/>`,
    );
    out.push(`<circle cx="${x}" cy="${base - h - 30}" r="17" fill="${c}" opacity="0.9"/>`);
  }
  return out.join("");
}

/** Ruled lines, and the occasional one that is not like the others. */
function rules(seed, W, H) {
  const rand = mulberry32(seed, W, H);
  const out = [];
  for (let y = 78, i = 0; y < H; y += 74, i += 1) {
    const gold = rand() < 0.22;
    const short = rand() < 0.3;
    const x2 = short ? W * (0.35 + rand() * 0.4) : W - 120;
    out.push(
      `<path d="M120 ${y} L${x2} ${y}" stroke="${gold ? GOLD : INK}" ` +
        `stroke-width="${gold ? 12 : 6}" stroke-linecap="round" opacity="${gold ? 0.9 : 0.5}"/>`,
    );
  }
  return out.join("");
}

/**
 * A strip of film: frames and sprocket holes, drawn rather than blocked in.
 *
 * Outlined on cream rather than printed as a dark band, because every banner
 * on the site carries a near-black title over a light scrim — a dark motif
 * here would take the title down with it.
 */
function filmstrip(seed, W, H) {
  const rand = mulberry32(seed);
  const out = [];
  const top = H * 0.16;
  const height = H * 0.68;
  const frameW = 300;
  const gap = 34;

  for (const y of [top, top + height]) {
    out.push(`<path d="M0 ${y} L${W} ${y}" stroke="${INK}" stroke-width="7" opacity="0.8"/>`);
  }
  for (let x = 40; x < W; x += frameW + gap) {
    const gold = rand() < 0.3;
    out.push(
      `<rect x="${x}" y="${top + 96}" width="${frameW}" height="${height - 192}" rx="10" ` +
        `fill="${gold ? GOLD : "none"}" fill-opacity="0.17" stroke="${gold ? GOLD : INK}" ` +
        `stroke-width="6" opacity="${gold ? 0.95 : 0.7}"/>`,
    );
  }
  for (let x = 58; x < W; x += 86) {
    for (const y of [top + 26, top + height - 60]) {
      out.push(
        `<rect x="${x}" y="${y}" width="46" height="32" rx="8" fill="none" stroke="${INK}" ` +
          `stroke-width="5" opacity="0.55"/>`,
      );
    }
  }
  return out.join("");
}

/** The page of writing, at the size the lectures banner wants it. */
function writing(width, height, seed) {
  const { ink, gold } = specimen({
    width,
    cw: 74,
    ch: 128,
    top: 132,
    left: 150,
    lines: Math.max(1, Math.round(height / 198)),
    seed,
    wordMin: 2,
    wordMax: 6,
    wordSpace: 1.25,
    rubricate: 0.22,
    codaRate: 0.3,
  });
  return inked({ ink, gold, strokeInk: 7, strokeGold: 7 });
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

// ------------------------------------------------------------- banners -----
// The script goes to the lectures banner, which is where the language is
// taught, and where the week 8 page points when it says these are the same
// letterforms.
const BANNERS = [
  ["banner-lectures", (w, h) => writing(w, h, 4022)],
  ["banner-workshops", (w, h) => bows(771, w, h)],
  ["banner-assessment", (w, h) => grid(1503, w, h)],
  ["banner-people", (w, h) => stems(3310, w, h)],
  ["banner-policies", (w, h) => rules(96, w, h)],
  ["banner-screenings", (w, h) => filmstrip(1211, w, h)],
];

for (const [name, motif] of BANNERS) {
  await write(`${name}.avif`, W, H, motif(W, H));
}
