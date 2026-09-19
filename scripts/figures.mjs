// The drawn figures the banners are made of.
//
// Line art, not silhouettes: each figure is a set of contour paths authored by
// hand in its own 0–120 box and then placed and scaled by the scenes. Drawing
// them as outline rather than as filled shapes is what makes them read as
// drawings — a filled blob at this scale is a pictogram, and six pictograms
// look like clip art however carefully they are arranged.
//
// Stroke widths are in local units and scale with the figure, so a small
// distant person is drawn in a finer line than a large near one, which is how
// the depth in these scenes is carried.

/** Wrap paths as ink linework. */
export const drawn = (body, width = 5, stroke = "#17130f", opacity = 1) =>
  `<g fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ` +
  `stroke-linejoin="round" opacity="${opacity}">${body}</g>`;

/** Place a figure at a point, at a size. */
export const place = (x, y, s, body) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;

// --------------------------------------------------------------- heads -----

/**
 * The back of a head, turned slightly. The audience figure: what you draw when
 * the person is listening rather than doing anything.
 */
export const BACK_HEAD =
  `<path d="M28 47 C23 23 40 8 58 10 C76 12 84 28 81 47 C79 59 70 66 58 66 C43 66 30 59 28 47 Z"/>` +
  `<path d="M33 34 C41 21 55 15 68 20"/>` +
  `<path d="M2 106 C7 85 24 76 45 73 L46 63"/>` +
  `<path d="M69 62 L71 73 C92 77 108 86 112 106"/>`;

/** A head in profile, mouth open — the figure that is saying something. */
export const TALKING_HEAD =
  `<path d="M46 66 C34 61 26 48 29 35 C32 18 47 7 62 9 C72 11 78 19 79 29 L81 37 L89 47 ` +
  `L79 50 L80 55 C79 59 75 61 70 60 L69 65 C64 69 52 70 46 66 Z"/>` +
  `<path d="M31 28 C38 13 55 7 70 15"/>` +
  `<path d="M70 55 C75 55 78 54 80 52"/>` +
  `<path d="M4 106 C9 86 27 77 49 74 L50 67"/>` +
  `<path d="M70 65 L74 75 C95 79 110 88 114 106"/>`;

/** A head three-quarter on, looking down at something on the desk. */
export const BOWED_HEAD =
  `<path d="M30 42 C27 20 43 7 60 10 C77 13 85 28 82 45 C80 58 72 66 60 67 C46 68 32 58 30 42 Z"/>` +
  `<path d="M33 30 C42 15 58 10 72 18"/>` +
  `<path d="M3 106 C8 86 25 77 46 74 L47 65"/>` +
  `<path d="M70 65 L72 75 C93 79 108 87 112 106"/>`;

// ------------------------------------------------------------- figures -----

/**
 * Someone standing and talking, one arm out. The lecturer, and the three on
 * the ridge in the film — anywhere a whole person has to be in frame.
 */
export const STANDING =
  `<path d="M40 26 C40 11 50 2 62 2 C75 2 84 11 84 26 C84 41 75 49 62 49 C50 49 40 40 40 26 Z"/>` +
  `<path d="M44 17 C51 5 68 2 80 10"/>` +
  `<path d="M46 48 L44 60 C30 64 22 74 22 88 L26 122"/>` +
  `<path d="M78 48 L80 60 C94 64 102 74 102 88 L98 122"/>` +
  `<path d="M26 122 L98 122"/>` +
  `<path d="M30 124 L28 196 L50 196 L52 124"/>` +
  `<path d="M72 124 L74 196 L96 196 L98 124"/>` +
  `<path d="M99 80 C116 77 127 64 129 48 C131 42 138 44 137 51 C136 58 132 63 128 66"/>` +
  `<path d="M26 74 C14 91 11 113 15 133 C12 139 16 145 21 142"/>`;

/** Someone sitting at a desk with both arms forward, typing. */
export const TYPING =
  `<path d="M4 106 C9 86 26 77 46 74 L47 65"/>` +
  `<path d="M70 65 L72 75 C88 78 100 84 106 94"/>` +
  `<path d="M74 78 C92 80 106 88 114 100"/>` +
  `<path d="M40 79 C56 86 70 95 79 104"/>`;

// -------------------------------------------------------------- things -----

/** A sheet of paper with writing on it, drawn slightly askew. */
export const sheet = (rand) => {
  const lines = [];
  for (let i = 0; i < 5; i += 1) {
    const w = i === 4 ? 40 : 52 + rand() * 30;
    const dip = (rand() - 0.5) * 4;
    lines.push(
      `<path d="M22 ${44 + i * 24} Q${22 + w / 2} ${44 + i * 24 + dip} ${22 + w} ${44 + i * 24}"/>`,
    );
  }
  return (
    `<path d="M10 8 L104 6 L108 150 L14 153 Z"/>` +
    `<path d="M88 6 L88 26 L108 25"/>` +
    lines.join("")
  );
};

/** A round stamp, pressed on crooked. */
export const STAMP =
  `<circle cx="0" cy="0" r="26"/><circle cx="0" cy="0" r="18"/>` +
  `<path d="M-11 0 L-3 9 L12 -10"/>`;

/** A laptop, lid open, three-quarter on from the far side of the desk. */
export const LAPTOP =
  `<path d="M26 4 L98 11 L106 64 L18 58 Z"/>` +
  `<path d="M34 14 L92 19"/>` +
  `<path d="M18 58 L106 64 L124 84 L0 78 Z"/>` +
  `<path d="M30 68 L96 72"/>`;

/** A film projector: body, lens, and the two reels. */
export const PROJECTOR =
  `<path d="M6 54 L6 96 C6 102 10 106 16 106 L92 106 C98 106 102 102 102 96 L102 54 ` +
  `C102 48 98 44 92 44 L16 44 C10 44 6 48 6 54 Z"/>` +
  `<path d="M102 60 L128 48 L128 102 L102 90 Z"/>` +
  `<circle cx="34" cy="14" r="26"/><circle cx="34" cy="14" r="5"/>` +
  `<circle cx="88" cy="20" r="19"/><circle cx="88" cy="20" r="4"/>` +
  `<path d="M34 -12 L34 40 M8 14 L60 14"/>` +
  `<path d="M60 14 C74 12 84 16 88 20"/>`;
