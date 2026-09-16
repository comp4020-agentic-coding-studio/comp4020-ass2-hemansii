/**
 * One glyph of the invented script, assembled from parts.
 *
 * This is the geometry the hero artwork is built from, lifted out of
 * `scripts/make-artwork.mjs` so the script on the week 8 page and the writing
 * on the home page are drawn by the same function rather than by two that
 * happen to agree. It is plain `.mjs` with JSDoc types because both a Node
 * script and an Astro component have to import it.
 *
 * The parts are the featural principle week 8 teaches: a letter's shape tells
 * you something about the sound. Which side the bow sits on says where in the
 * mouth the consonant is made; the grade says how. The mark above the stem is
 * the vowel, and — the one part the hero never happens to show, because it
 * writes only open syllables — a mark below the stem is a coda.
 *
 * Nothing here knows which sound is which. That mapping lives in
 * `src/lib/example-language.ts`, so the shapes stay reusable by any language.
 *
 * @typedef {"r" | "l"} Side  which side of the stem the bow sits on
 * @typedef {1 | 2 | 3 | 4} Grade  1 short stem, 2 full stem, 3 doubled bow, 4 barred
 * @typedef {0 | 1 | 2 | 3 | 4} Mark  0 no mark, 1 dot, 2 two dots, 3 rising stroke, 4 arc
 */

/**
 * @param {Side} side
 * @param {Grade} grade
 * @param {Mark} vowel
 * @param {number} cw  cell width
 * @param {number} ch  cell height
 * @param {Mark} [coda]  a mark below the stem; 0 or omitted for an open syllable
 * @returns {{ ink: string, gold: string }} two SVG fragments, one per ink
 */
export function glyph(side, grade, vowel, cw, ch, coda = 0) {
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

  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="${cw * 0.045}" />`;

  /** The five mark shapes, drawn around a baseline `my`. */
  const marks = (my) => ({
    0: "",
    1: dot(sx, my),
    2: `${dot(sx - cw * 0.1, my)}${dot(sx + cw * 0.1, my)}`,
    3: `<path d="M${sx - cw * 0.11} ${my + ch * 0.035} L${sx + cw * 0.11} ${my - ch * 0.035}" />`,
    4: `<path d="M${sx - cw * 0.12} ${my + ch * 0.03} Q${sx} ${my - ch * 0.06} ${sx + cw * 0.12} ${my + ch * 0.03}" />`,
  });

  const mark = marks(top - ch * 0.11)[vowel];
  // Same shapes, below the stem instead of above it: position is what
  // distinguishes a vowel from a coda, which is as featural as the bows.
  const codaMark = coda ? marks(bot + ch * 0.12)[coda] : "";

  return { ink: `<path d="${d.join(" ")}" />`, gold: `${mark}${codaMark}` };
}
