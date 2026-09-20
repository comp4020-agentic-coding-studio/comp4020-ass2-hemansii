// Composes the six section banners from the illustrations in art/illustrations.
//
//   node scripts/make-banners.mjs
//
// The illustrations arrive at 1376x768 — near 16:9. The hero band is nothing
// like that shape: it is 1920x416 on a desktop and 390x360 on a phone, and the
// image is `object-fit: cover`, so feeding a 16:9 source straight in would show
// the middle third of its height and nothing else. Torsos, no heads.
//
// So each illustration is cropped to a wide band of itself and set on a sheet
// of its own paper colour at 2560x555 — the desktop hero's shape, so a desktop
// keeps the whole sheet. A phone keeps only the middle fifth of its width,
// which is why the band is centred rather than ranged left. The paper tone is
// sampled from the illustration rather than fixed, because the six were drawn
// on six slightly different creams, and the edges are feathered into it so the
// join does not read as a cut.
//
// The vertical windows below are chosen per illustration: faces in the top
// third, ground at the foot. The hero scrim in src/styles/hero.css washes the
// bottom of the band towards the paper so the title can sit on it, so anything
// down there is going to dissolve into the page — which is fine for a floor and
// fatal for a face.
import sharp from "sharp";

const WIDTH = 2560;
const HEIGHT = 555;
/** Columns over which the illustration fades into what is behind it. */
const FEATHER = 150;
/** Columns of the illustration stretched out to make the paper either side of it. */
const SAMPLE = 70;
/** Vertical steps those columns are reduced to before being stretched. */
const STEPS = 6;
/** Which of the sampled pixels, light to dark, is taken as a step's paper tone. */
const PAPER_PERCENTILE = 0.8;

/** The paper the illustration was drawn on: the most common colour in it. */
async function paper(file) {
  const { data, info } = await sharp(file)
    .resize(64, 36, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const seen = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
    const bucket = seen.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n += 1;
    bucket.r += data[i];
    bucket.g += data[i + 1];
    bucket.b += data[i + 2];
    seen.set(key, bucket);
  }
  const best = [...seen.values()].sort((a, b) => b.n - a.n)[0];
  return {
    r: Math.round(best.r / best.n),
    g: Math.round(best.g / best.n),
    b: Math.round(best.b / best.n),
  };
}

/**
 * The paper tone of a sampled block of the drawing, in STEPS horizontal bands.
 *
 * Each band is the pixel at PAPER_PERCENTILE of its own luminance order, which
 * on a line drawing is paper rather than ink however much ink is in the band.
 */
function paperSteps({ data, info }) {
  const out = Buffer.alloc(STEPS * 3);
  const rows = Math.floor(info.height / STEPS);
  for (let step = 0; step < STEPS; step += 1) {
    const pixels = [];
    for (let y = step * rows; y < (step + 1) * rows; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const at = (y * info.width + x) * info.channels;
        pixels.push([data[at] * 0.299 + data[at + 1] * 0.587 + data[at + 2] * 0.114, at]);
      }
    }
    pixels.sort((a, b) => a[0] - b[0]);
    const at = pixels[Math.floor((pixels.length - 1) * PAPER_PERCENTILE)][1];
    out[step * 3] = data[at];
    out[step * 3 + 1] = data[at + 1];
    out[step * 3 + 2] = data[at + 2];
  }
  return out;
}

/**
 * The band of each illustration that is kept: `top` and `height` cut it out of
 * the 1376x768 drawing, `sides` trims the left and right edges, and `shift`
 * moves it off the centre of the sheet.
 *
 * Only the projector needs a shift: its subject is the screen on the right
 * rather than anything in the middle, and a centred crop leaves a phone looking
 * at an empty beam. Two need their sides trimmed, because whatever is at the
 * edge of the band gets pulled outwards to make the paper beside it (see
 * `band` below) — the lecture room ends in a slab of gold and the cinema in a
 * black curtain, and stretched across a third of the sheet either of those
 * stops being a drawing and becomes a colour field.
 */
const BANNERS = [
  ["lectures", "banner-lectures", 170, 470, [205, 146], 0],
  ["workshops", "banner-workshops", 50, 520, [0, 0], 0],
  ["screenings", "banner-screenings", 55, 505, [70, 91], -190],
  ["assessment", "banner-assessment", 60, 520, [0, 0], 0],
  ["people", "banner-people", 105, 500, [0, 0], 0],
  ["policies", "banner-policies", 100, 490, [0, 0], 0],
];

/**
 * The kept band, scaled to the full height of the sheet and feathered at both
 * edges.
 *
 * What the band is feathered into is the band's own outermost columns, pulled
 * sideways over a flat fill of the paper the drawing is on. Filling with the
 * flat colour alone was the obvious thing and it does not work: these are drawn
 * on paper that shades across the sheet, and some of them run a band of colour
 * along a wall, so one average leaves a seam a long way in from the join.
 *
 * Getting the stretch itself to stop looking like a stretch took three goes.
 * Blurring the columns leaves whatever was at the edge — a bookshelf, the
 * roller of a screen — legible as a smear a third of the way across. Averaging
 * them into a single column kills the horizontal detail but keeps the vertical:
 * one dark row becomes a dark rule running the full width of the margin, which
 * is the screen roller on the cinema and the gold wall on the marking sheet.
 *
 * An average is the wrong statistic for this. These are line drawings: the ink
 * is dark, sparse and the thing we want gone, and the paper is light and most
 * of what is there. So each of six horizontal steps takes the eightieth
 * lightest percentile of its pixels instead of their mean, which reads the
 * paper and steps over anything drawn on it, and the six are stretched into a
 * gradient that carries the shading without carrying the objects.
 *
 * The gradient runs under the feathered edge of the drawing rather than butting
 * up against it. Six steps cannot follow the drawing's own edge row by row, so
 * ending the fill where the drawing starts leaves the flat colour visible
 * between them and a hard vertical line down the join.
 */
async function band(file, top, height, sides, shift) {
  const meta = await sharp(file).metadata();
  const kept = meta.width - sides[0] - sides[1];
  const width = Math.round(kept * (HEIGHT / height));
  const art = await sharp(file)
    .extract({ left: sides[0], top, width: kept, height })
    .resize(width, HEIGHT, { fit: "fill" })
    .png()
    .toBuffer();

  const left = Math.round((WIDTH - width) / 2) + shift;
  const margins = [];
  for (const side of [
    { at: 0, from: 0, to: left + FEATHER },
    { at: width - SAMPLE, from: left + width - FEATHER, to: WIDTH },
  ]) {
    const span = side.to - side.from;
    // Nothing to fill on this side: the drawing already runs off the sheet.
    if (span <= FEATHER) continue;
    const outer = side.from === 0;
    const sample = await sharp(art)
      .extract({ left: side.at, top: 0, width: SAMPLE, height: HEIGHT })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const strip = await sharp(paperSteps(sample), { raw: { width: 1, height: STEPS, channels: 3 } })
      .resize(span, HEIGHT, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let sx = 0; sx < span; sx += 1) {
      const x = side.from + sx;
      // Under the feather the strip is exactly what the drawing is not, so the
      // two always sum to one and the flat fill behind them is never reached.
      // Past it the strip is opaque, then fades away towards the sheet edge.
      const alpha = outer
        ? x >= left
          ? 1 - (x - left) / FEATHER
          : (x / left) ** 0.7
        : x < left + width
          ? 1 - (left + width - 1 - x) / FEATHER
          : ((WIDTH - 1 - x) / (WIDTH - left - width)) ** 0.7;
      const value = Math.round(255 * Math.min(1, Math.max(0, alpha)));
      for (let y = 0; y < HEIGHT; y += 1) {
        strip.data[(y * span + sx) * strip.info.channels + 3] = value;
      }
    }
    margins.push({ input: strip.data, raw: strip.info, left: side.from, top: 0 });
  }

  const { data, info } = await sharp(art).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let x = 0; x < info.width; x += 1) {
    const edge = Math.min(x, info.width - 1 - x);
    if (edge >= FEATHER) continue;
    const alpha = edge / FEATHER;
    for (let y = 0; y < info.height; y += 1) {
      const at = (y * info.width + x) * info.channels + 3;
      data[at] = Math.round(data[at] * alpha);
    }
  }

  return [...margins, { input: data, raw: info, left, top: 0 }];
}

for (const [source, name, top, height, sides, shift] of BANNERS) {
  const file = `art/illustrations/${source}.png`;
  const pap = await paper(file);
  const layers = await band(file, top, height, sides, shift);
  await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 4, background: pap } })
    .composite(layers)
    .avif({ quality: 64 })
    .toFile(`src/assets/images/${name}.avif`);
  console.log(`wrote src/assets/images/${name}.avif`);
}
