// A contact sheet of the six section banners, for looking at while drawing.
//
// The banners are only ever seen through the hero, which crops them and lays a
// cream wash over the lower part for the title. Judging a drawing by opening
// the site means rebuilding it, and judging it by opening the AVIF means
// judging a version of it nobody sees. This renders all six at once, with the
// wash faked on top and the phone crop marked, so a change can be looked at in
// one go.
//
//   node scripts/preview-scenes.mjs        -> /tmp/scenes.png
//
// Nothing on the site imports this; it is a drawing aid, not part of the build.

import sharp from "sharp";

import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
  crowd,
  everyoneTalking,
  lectureTheatre,
  paperwork,
  projector,
  submitting,
} from "./scenes.mjs";

const CREAM = "#f2ece0";
const SCENES = [
  ["lectures", lectureTheatre, 4022],
  ["workshops", everyoneTalking, 771],
  ["screenings", projector, 1211],
  ["assessment", submitting, 1503],
  ["people", crowd, 3310],
  ["policies", paperwork, 96],
];

/** The scrim the hero lays over the banner, so the preview fades where it does. */
const WASH = `
  <linearGradient id="wash" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="${CREAM}" stop-opacity="0.94"/>
    <stop offset="0.38" stop-color="${CREAM}" stop-opacity="0.88"/>
    <stop offset="0.68" stop-color="${CREAM}" stop-opacity="0.30"/>
    <stop offset="1" stop-color="${CREAM}" stop-opacity="0"/>
  </linearGradient>`;

const plates = ({ ink, gold }, dx = 5, dy = 4) =>
  `<g transform="translate(${dx} ${dy})" opacity="0.92">${gold.join("")}</g><g>${ink.join("")}</g>`;

const W = SCENE_WIDTH;
const H = SCENE_HEIGHT;
const LABEL = 44;
const tiles = SCENES.map(([name, scene, seed], i) => {
  const y = i * (H + LABEL);
  // The phone shows the middle 21% of the width; mark it.
  const cropL = W * 0.395;
  const cropR = W * 0.605;
  return `
  <g transform="translate(0 ${y})">
    <text x="0" y="30" font-family="monospace" font-size="26" fill="#17130f">${name}</text>
    <g transform="translate(0 ${LABEL})">
      <rect width="${W}" height="${H}" fill="${CREAM}"/>
      ${plates(scene(seed, W, H))}
      <rect width="${W}" height="${H}" fill="url(#wash)"/>
      <path d="M${cropL} 0 L${cropL} ${H} M${cropR} 0 L${cropR} ${H}"
            stroke="#c0392b" stroke-width="3" stroke-dasharray="14 10" opacity="0.55"/>
    </g>
  </g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${SCENES.length * (H + LABEL)}"
  viewBox="0 0 ${W} ${SCENES.length * (H + LABEL)}">
  <defs>${WASH}</defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${tiles.join("")}
</svg>`;

await sharp(Buffer.from(svg)).resize({ width: 1400 }).png().toFile("/tmp/scenes.png");
console.log("wrote /tmp/scenes.png");
