// Turn the four Higgsfield renders into the four bard states the player wants.
//
//   npm install sharp
//   cd .art-work && node ../tools/make_bard_art.mjs
//
// Expects idle-raw.png, talk-raw.png, dig-raw.png and play-raw.png in the working
// directory — square renders on a white studio backdrop — and writes out/bard-*.webp.
// Why it is shaped this way is written up in assets/art/README.md.
//
//   1. cut the white studio background away (flood fill from the border)
//   2. find each frame's face, so all four line up on it
//   3. drop them into one 720x780 canvas with a shared scale
//   4. write WebP with alpha
//
// The face is the anchor rather than the whole figure: the sheet music in `dig`
// and the raised strumming arm in `play` push the outer bounds around, but the
// eye tracks the face, and that is what must hold still through a cross-fade.
// Within the face box the chin edge turns out to be the steady part (it lands
// within half a pixel across all four), so the anchor is (face centre x, chin y).

import sharp from 'sharp';

const NAMES = ['idle', 'talk', 'dig', 'play'];

// Canvas — 3x of the 240x260 the stage draws at, per assets/art/README.md.
const OUT_W = 720, OUT_H = 780;

const SIDE_MARGIN = 0.06;   // clear space either side of the widest state
const TOP_MARGIN = 0.02;    // clear space above the feather

const INK = [0x24, 0x1a, 0x12];  // background RGB under the cut, so any resampling
                                 // fringe reads as part of the black outline

/** Neutral and near-white — the studio backdrop, not the cream cloak. */
function isBackdrop(r, g, b) {
  const lo = Math.min(r, g, b), hi = Math.max(r, g, b);
  return lo >= 238 && hi - lo <= 8;
}

/** Warm mid-light, red > green > blue — the face and hands. */
function isSkin(r, g, b) {
  return r > 230 && g > 195 && g < 245 && b > 170 && b < 230
      && r > g && g > b && r - b >= 22 && r - b <= 75;
}

/** Flood the backdrop in from all four edges; returns a Uint8Array mask (1 = backdrop). */
function cutBackdrop(data, W, H, C) {
  const bg = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0, tail = 0;

  const push = (p) => {
    if (bg[p]) return;
    const i = p * C;
    if (!isBackdrop(data[i], data[i + 1], data[i + 2])) return;
    bg[p] = 1;
    queue[tail++] = p;
  };

  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }

  while (head < tail) {
    const p = queue[head++], x = p % W, y = (p / W) | 0;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W);
    if (y < H - 1) push(p + W);
  }
  return bg;
}

/** Keep the span holding the bulk of a tally, so a stray pixel cannot stretch a box. */
function span(tally, n) {
  const peak = Math.max(...tally);
  const floor = peak * 0.12;
  let lo = 0, hi = n - 1;
  while (lo < n && tally[lo] < floor) lo++;
  while (hi > lo && tally[hi] < floor) hi--;
  return [lo, hi];
}

/** Bounding box of the face: skin pixels in the upper part of the frame. */
function faceBox(data, W, H, C, bg) {
  const limit = (H * 0.72) | 0;   // below this we are into the hands and the lute
  const cols = new Int32Array(W), rows = new Int32Array(H);
  let total = 0;
  for (let y = 0; y < limit; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (bg[p]) continue;
      const i = p * C;
      if (!isSkin(data[i], data[i + 1], data[i + 2])) continue;
      cols[x]++; rows[y]++; total++;
    }
  }
  if (!total) throw new Error('no face found');
  const [x0, x1] = span(cols, W);
  const [, y1] = span(rows, limit);
  return { cx: (x0 + x1) / 2, chin: y1, w: x1 - x0 };
}

/** Bounding box of everything that survived the cut. */
function contentBox(bg, W, H) {
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (bg[y * W + x]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { x0, x1, y0, y1 };
}

/* ─────────────────────────────────────────────────────────────── read them in */

const frames = [];
for (const name of NAMES) {
  const { data, info } = await sharp(`${name}-raw.png`).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const bg = cutBackdrop(data, W, H, C);
  const face = faceBox(data, W, H, C, bg);
  const box = contentBox(bg, W, H);

  // Straight RGBA, backdrop knocked out and repainted ink so the downscale
  // cannot bleed white into the outlines.
  const rgba = Buffer.alloc(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    const s = p * C, d = p * 4;
    if (bg[p]) {
      rgba[d] = INK[0]; rgba[d + 1] = INK[1]; rgba[d + 2] = INK[2]; rgba[d + 3] = 0;
    } else {
      rgba[d] = data[s]; rgba[d + 1] = data[s + 1]; rgba[d + 2] = data[s + 2]; rgba[d + 3] = 255;
    }
  }
  frames.push({ name, W, H, rgba, face, box });
  console.log(`${name}: face w=${face.w} cx=${Math.round(face.cx)} chin=${face.chin}  content ${box.x0}..${box.x1} / ${box.y0}..${box.y1}`);
}

/* ──────────────────────────────────── one shared scale, measured from the face */

// Extents of every state, expressed relative to its own face anchor. Union of
// these is how much room the character needs across all four states.
let RX0 = Infinity, RX1 = -Infinity, RY0 = Infinity, RY1 = -Infinity;
for (const f of frames) {
  RX0 = Math.min(RX0, f.box.x0 - f.face.cx);
  RX1 = Math.max(RX1, f.box.x1 - f.face.cx);
  RY0 = Math.min(RY0, f.box.y0 - f.face.chin);
  RY1 = Math.max(RY1, f.box.y1 - f.face.chin);
}
const unionW = RX1 - RX0, unionH = RY1 - RY0;

// Fit the width with margins; let the lute bleed off the bottom edge the way the
// drawn bard does, rather than leaving a cut line hanging over the stage floor.
const scale = Math.min(
  (OUT_W * (1 - 2 * SIDE_MARGIN)) / unionW,
  (OUT_H * (1 - TOP_MARGIN)) / unionH,
);

// Where the face anchor lands: union centred across, union top at the margin.
const anchorX = OUT_W / 2 - ((RX0 + RX1) / 2) * scale;
const anchorY = OUT_H * TOP_MARGIN - RY0 * scale;

console.log(`\nunion ${Math.round(unionW)}x${Math.round(unionH)} -> scale ${scale.toFixed(4)}`);
console.log(`anchor (chin) at ${Math.round(anchorX)},${Math.round(anchorY)} = ${(anchorY / OUT_H * 100).toFixed(1)}% down`);

/* ──────────────────────────────────────────────────────── scale, blit, encode */

for (const f of frames) {
  const w = Math.round(f.W * scale), h = Math.round(f.H * scale);
  const { data: src } = await sharp(f.rgba, { raw: { width: f.W, height: f.H, channels: 4 } })
    .resize(w, h, { kernel: 'lanczos3' })
    .raw().toBuffer({ resolveWithObject: true });

  // Blit by hand with clipping — the scaled frame is larger than the canvas and
  // sits at a negative offset, which sharp's composite refuses.
  const left = Math.round(anchorX - f.face.cx * scale);
  const top = Math.round(anchorY - f.face.chin * scale);
  const canvas = Buffer.alloc(OUT_W * OUT_H * 4, 0);
  for (let y = Math.max(0, -top); y < h; y++) {
    const dy = y + top;
    if (dy >= OUT_H) break;
    for (let x = Math.max(0, -left); x < w; x++) {
      const dx = x + left;
      if (dx >= OUT_W) break;
      src.copy(canvas, (dy * OUT_W + dx) * 4, (y * w + x) * 4, (y * w + x) * 4 + 4);
    }
  }

  await sharp(canvas, { raw: { width: OUT_W, height: OUT_H, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(`out/bard-${f.name}.webp`);

  console.log(`bard-${f.name}.webp  scaled ${w}x${h} placed at ${left},${top}`);
}
