// The illustrated scenes, one per section banner.
//
// Drawings, not arrangements of shapes: every person here is a set of contour
// paths from `figures.mjs`, placed and scaled. The gold plate is flat colour
// laid behind the linework and offset a little, which is the register the rest
// of the Slop identity prints in — ink drawing over a misregistered second ink.
//
// Everything is composed against one constraint, and it is a tight one.
// `object-fit: cover` crops the banner to two very different shapes, and the
// hero then lays a cream scrim over the lower two thirds so the title stays
// legible. Measured at the two viewports the work is marked at:
//
//   1920  the image scales to 0.75 and the layout shows 96% of its height, so
//         almost nothing is cropped away vertically — but the scrim takes the
//         bottom half.
//   390   the full height shows and the middle 21% of the width, so only
//         x 0.40W–0.60W is guaranteed to be on screen.
//
// Both agree on the vertical: above y 0.33H nothing is washed, y 0.5H is about
// half washed, and below y 0.6H a black line composites to pale grey. So the
// rule every scene follows is: subject between y 0.04H and y 0.5H, anything
// below that only ever ground or legs, and the composition centred — or
// repeating — inside x 0.40W–0.60W so the phone crop lands on a whole scene.
//
// `node scripts/preview-scenes.mjs` renders all six with the crop and the
// scrim faked on top, which is the only honest way to look at them.

import { glyph } from "../src/lib/glyph.mjs";
import {
  BACK_HEAD,
  BOWED_HEAD,
  LAPTOP,
  PROJECTOR,
  STAMP,
  STANDING,
  TALKING_HEAD,
  TYPING,
  drawn,
  place,
  sheet,
} from "./figures.mjs";

const INK = "#17130f";
const GOLD = "#b97d1c";
const CREAM = "#f2ece0";

/** The canvas the scenes are drawn on, sized so the crop above holds. */
export const SCENE_WIDTH = 2560;
export const SCENE_HEIGHT = 500;

const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * The second ink is carried by rubrication — some of the figures are printed
 * in gold outright — rather than by a blob of colour behind the drawing. Two
 * plates, both of them linework, which is what two-colour printing does and
 * what stops the gold reading as a stain under each person.
 */
const RUBRIC = 0.3;

/** A short run of the invented script, for boards and speech bubbles. */
function writtenLine(x, y, count, cw, ch, rand) {
  const ink = [];
  const gold = [];
  for (let i = 0; i < count; i += 1) {
    const g = glyph(
      rand() < 0.5 ? "r" : "l",
      1 + Math.floor(rand() * 4),
      Math.floor(rand() * 5),
      cw,
      ch,
      rand() < 0.25 ? 1 : 0,
    );
    ink.push(`<g transform="translate(${x + i * cw} ${y})">${g.ink}</g>`);
    if (g.gold) gold.push(`<g transform="translate(${x + i * cw} ${y})">${g.gold}</g>`);
  }
  const stroke = cw * 0.1;
  return {
    ink: `<g fill="none" stroke="${INK}" stroke-width="${stroke}" stroke-linecap="round">${ink.join("")}</g>`,
    gold: `<g fill="${GOLD}" stroke="${GOLD}" stroke-width="${stroke}" stroke-linecap="round">${gold.join("")}</g>`,
  };
}

// -------------------------------------------------------------- scenes -----

/** Lectures — someone at a board with writing on it, and a room listening to them. */
export function lectureTheatre(seed, W) {
  const rand = mulberry32(seed);
  const ink = [];
  const gold = [];

  // Board and lecturer read as one group, and the group — not the board on its
  // own — is centred, so the phone crop takes both.
  const bw = 470;
  const bx = W * 0.5 - (bw - 150) / 2;

  ink.push(drawn(`<path d="M${bx} 18 L${bx + bw} 22 L${bx + bw - 4} 168 L${bx + 4} 164 Z"/>`, 6));
  for (let line = 0; line < 2; line += 1) {
    const written = writtenLine(bx + 38, 34 + line * 58, 12, 32, 54, rand);
    ink.push(written.ink);
    gold.push(written.gold);
  }

  // The lecturer, turned to the board, arm up at what they have just written.
  ink.push(place(bx - 196, 30, 1.34, drawn(STANDING, 5)));

  // The room, in three ranks. The nearest is drawn heaviest and largest, and
  // every rank runs off both edges of the frame.
  const ranks = [
    { y: 104, s: 0.95, step: 196, w: 4.4, opacity: 0.34 },
    { y: 120, s: 1.35, step: 288, w: 4.6, opacity: 0.62 },
    { y: 142, s: 1.9, step: 402, w: 5, opacity: 1 },
  ];
  for (const rank of ranks) {
    for (let i = 0, x = -rank.step * 0.6; x < W + rank.step; i += 1, x += rank.step) {
      const dx = (rand() - 0.5) * rank.step * 0.22;
      // The near rank opens up around the lecturer rather than closing over
      // them: a room drawn from the back still has to show who is talking.
      if (rank.s > 1.5 && x + dx > bx - 300 && x + dx < bx + 70) continue;
      const rubric = rand() < RUBRIC;
      const body = place(x + dx, rank.y, rank.s, drawn(BACK_HEAD, rank.w, rubric ? GOLD : INK, rank.opacity));
      (rubric ? gold : ink).push(body);
    }
  }

  return { ink, gold };
}

/** Workshops — everybody talking at once, and none of them in the same language. */
export function everyoneTalking(seed, W) {
  const rand = mulberry32(seed);
  const ink = [];
  const gold = [];
  const step = 330;

  for (let i = 0, x = -120; x < W + step; i += 1, x += step) {
    const facing = i % 2 === 0 ? 1 : -1;
    const y = 152 + (i % 3) * 10;

    // Flipped about its own centre, so half the room is arguing with the
    // other half rather than everybody facing the same way.
    const rubric = i % 3 === 1;
    const body = drawn(TALKING_HEAD, 4.8, rubric ? GOLD : INK);
    (rubric ? gold : ink).push(
      facing === 1
        ? place(x, y, 1.6, body)
        : `<g transform="translate(${x + 188} ${y}) scale(${-1.6} ${1.6})">${body}</g>`,
    );

    // How much anyone has to say varies. One of these is a sentence and the
    // next is a single syllable, and they are all going at once.
    const count = [4, 1, 3, 2, 5][i % 5];
    const cw = 40;
    const bw = count * cw + 52;
    const bh = 98;
    const bx = x + (facing === 1 ? 74 : -bw + 76);
    const by = 16 + (i % 3) * 20;
    const tipX = x + facing * 56;

    ink.push(
      drawn(
        `<path d="M${bx + 28} ${by} L${bx + bw - 28} ${by} Q${bx + bw} ${by} ${bx + bw} ${by + 28} ` +
          `L${bx + bw} ${by + bh - 28} Q${bx + bw} ${by + bh} ${bx + bw - 28} ${by + bh} ` +
          `L${tipX + facing * 34} ${by + bh} L${tipX} ${by + bh + 42} L${tipX + facing * 6} ${by + bh} ` +
          `L${bx + 28} ${by + bh} Q${bx} ${by + bh} ${bx} ${by + bh - 28} ` +
          `L${bx} ${by + 28} Q${bx} ${by} ${bx + 28} ${by} Z"/>`,
        5,
      ),
    );
    const written = writtenLine(bx + 26, by + 10, count, cw, 74, rand);
    ink.push(written.ink);
    gold.push(written.gold);
  }

  return { ink, gold };
}

/** Screenings — a projector, the beam, and whatever is happening on the screen. */
export function projector(seed, W) {
  const rand = mulberry32(seed);
  const ink = [];
  const gold = [];

  const sx = 790;
  const sy = 14;
  const sw = 1040;
  const sh = 212;
  const px = 500;
  const py = 148;

  // The beam, thrown from the lens to the corners of the screen.
  gold.push(`<path d="M${px} ${py} L${sx} ${sy} L${sx} ${sy + sh} Z" fill="${GOLD}" opacity="0.2"/>`);

  // The screen. Everything on it is drawn into the ink layer, in order, so the
  // lit shapes knock out of the dark rather than printing behind it.
  const hz = sy + sh * 0.72;
  ink.push(
    `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="4" fill="${INK}" opacity="0.93"/>`,
    `<rect x="${sx}" y="${hz}" width="${sw}" height="${sy + sh - hz}" fill="${CREAM}" opacity="0.14"/>`,
    `<circle cx="${sx + sw * 0.74}" cy="${hz - 30}" r="60" fill="${GOLD}" opacity="0.95"/>`,
    `<path d="M${sx + 26} ${hz} L${sx + sw - 26} ${hz}" stroke="${CREAM}" stroke-width="3" ` +
      `stroke-linecap="round" opacity="0.5"/>`,
  );
  // Three of them on a ridge, watching the thing come down. Whatever the film
  // is, this is the shot — and it is drawn in the same line as everyone else,
  // in cream, because on the screen they are the lit part.
  for (const [at, s] of [
    [0.15, 0.46],
    [0.25, 0.36],
    [0.33, 0.27],
  ]) {
    ink.push(place(sx + sw * at, hz - 200 * s, s, drawn(STANDING, 11, CREAM, 0.95)));
  }

  // The projector, running.
  ink.push(place(px - 268, py - 88, 1.45, drawn(PROJECTOR, 6)));

  // The audience, in the dark, cut off by the bottom of the frame.
  for (let i = 0, x = -170; x < W + 300; i += 1, x += 312) {
    const dx = (rand() - 0.5) * 70;
    // Nobody sits in front of the projector.
    if (x + dx > px - 420 && x + dx < px + 60) continue;
    const rubric = i % 4 === 2;
    (rubric ? gold : ink).push(
      place(x + dx, 148, 1.68, drawn(BACK_HEAD, 5.2, rubric ? GOLD : INK)),
    );
  }

  return { ink, gold };
}

/** Assessment — people at laptops, and the sheet it all gets typed into. */
export function submitting(seed, W, H) {
  const rand = mulberry32(seed);
  const ink = [];
  const gold = [];
  const cell = 132;

  // The sheet: ruled grid with a shaded header row, faint behind the drawing.
  const rules = [];
  for (let x = 0; x <= W; x += cell) rules.push(`<path d="M${x} 0 L${x} ${H}"/>`);
  for (let y = 14; y <= H; y += cell) rules.push(`<path d="M0 ${y} L${W} ${y}"/>`);
  ink.push(drawn(rules.join(""), 2, INK, 0.18));

  // The header row: names, not a shaded band. A heavier rule under it is what
  // actually says "this is the top of a sheet".
  const heads = [];
  for (let x = 0; x < W; x += cell) heads.push(`<path d="M${x + 22} 78 L${x + cell - 38} 78"/>`);
  ink.push(drawn(heads.join(""), 7, INK, 0.34));
  ink.push(drawn(`<path d="M0 108 L${W} 108"/>`, 4, INK, 0.34));

  // One row of entries, high enough that the scrim still leaves it readable.
  for (const y of [166, 232]) {
    for (let x = 0; x < W; x += cell) {
      const roll = rand();
      if (roll < 0.28) {
        gold.push(drawn(`<path d="M${x + 38} ${y} L${x + 58} ${y + 22} L${x + 94} ${y - 24}"/>`, 11, GOLD, 0.92));
      } else if (roll < 0.78) {
        ink.push(
          drawn(`<path d="M${x + 24} ${y + 2} L${x + 24 + cell * (0.3 + rand() * 0.4)} ${y + 2}"/>`, 6, INK, 0.26),
        );
      }
    }
  }

  // Three of them at it, spread so any crop lands on one whole desk.
  for (const [x, isGold] of [
    [420, false],
    [1280, true],
    [2140, false],
  ]) {
    const stroke = isGold ? GOLD : INK;
    (isGold ? gold : ink).push(
      // Head bowed over the keyboard, arms forward onto it. The laptop is
      // placed where those hands land, not where there happens to be room.
      place(x - 240, 92, 1.5, drawn(BOWED_HEAD + TYPING, 5, stroke)) +
        place(x - 118, 152, 1.22, drawn(LAPTOP, 5.5, stroke)),
    );
    ink.push(drawn(`<path d="M${x - 400} 258 L${x + 210} 261"/>`, 8));
  }

  return { ink, gold };
}

/** People — five of them, close enough to be looked at one at a time. */
export function crowd(seed, W) {
  const rand = mulberry32(seed);
  const ink = [];
  const gold = [];

  // Five, not a crowd: the page underneath names three people, and a wall of
  // heads says the opposite of what it is illustrating. They are spaced on the
  // full width but the middle three fall inside the phone crop.
  const cast = [
    { at: 0.13, s: 1.7, figure: BACK_HEAD, gold: false },
    { at: 0.32, s: 2.0, figure: TALKING_HEAD, gold: true },
    { at: 0.5, s: 2.3, figure: BACK_HEAD, gold: false },
    { at: 0.68, s: 2.0, figure: BOWED_HEAD, gold: true },
    { at: 0.87, s: 1.7, figure: TALKING_HEAD, gold: false },
  ];

  for (const person of cast) {
    const x = W * person.at - 56 * person.s;
    const y = 300 - 104 * person.s;
    const body = place(x, y, person.s, drawn(person.figure, 4.6, person.gold ? GOLD : INK));
    (person.gold ? gold : ink).push(body);
  }

  // A second, much fainter rank, so the five are in a room rather than a line.
  for (let i = 0, x = -60; x < W + 200; i += 1, x += 246) {
    if (i % 3 === 2) continue;
    ink.push(place(x + (rand() - 0.5) * 60, 96, 1.0, drawn(BACK_HEAD, 4.4, INK, 0.22)));
  }

  return { ink, gold };
}

/** Policies — the paperwork, and the one sheet in three that has been signed off. */
export function paperwork(seed, W) {
  const rand = mulberry32(seed);
  const ink = [];
  const gold = [];
  const step = 226;

  for (let i = 0, x = -80; x < W + step; i += 1, x += step) {
    const tilt = (rand() - 0.5) * 9;
    const y = 22 + (rand() - 0.5) * 26;
    const s = 1.72;
    const pivot = `${x + 59 * s} ${y + 80 * s}`;

    const page = [
      `<rect x="${x}" y="${y}" width="${118 * s}" height="${160 * s}" fill="${CREAM}" opacity="0.94"/>`,
      place(x, y, s, drawn(sheet(rand), 4.2)),
    ];

    // Every third sheet is stamped, and the stamp sits over the writing — so
    // it is drawn on this plate rather than the gold one, which prints behind
    // the sheets. It carries the misregistration offset itself instead.
    if (i % 3 === 1) {
      page.push(
        `<g transform="translate(${x + 78 * s + 5} ${y + 116 * s + 4}) rotate(-12) scale(${s})">` +
          drawn(STAMP, 6, GOLD, 0.95) +
          `</g>`,
      );
    }

    ink.push(`<g transform="rotate(${tilt} ${pivot})">${page.join("")}</g>`);
  }

  return { ink, gold };
}
