// 화로에 걸리는 것들 · 불 · 벽 그림을 재생기에 넣을 크기로 다듬는다.
//
//   npm install sharp
//   cd .art-work && node ../tools/make_hearth_art.mjs
//
// raw-*.png (gpt-image-2, 1024x1024) 를 읽어 assets/art/ 에 webp 로 낸다.
// 뽑는 쪽은 .art-work/gen-all.mjs, 프롬프트도 거기 들어 있다.
//
// 두 가지만 손보면 된다.
//
//  1. 알파 바닥 치기 — 모델이 물체 둘레에 아주 옅은 알파(1~30)를 흩뿌려 놓는다.
//     그냥 두면 돌 화로 위에 네모난 얼룩으로 뜨고 trim 도 걸리지 않는다.
//  2. 크기 — 화면에는 100~130px 로 나온다. 고해상도까지 봐도 320px 이면 넉넉하다.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// sharp 는 작업 폴더(.art-work)에 깔려 있다. ESM 은 스크립트 위치를 기준으로
// 찾으므로, 여기서는 작업 폴더 기준으로 다시 잡아 준다.
const sharp = createRequire(path.join(process.cwd(), 'noop.js'))('sharp');

const OUT = path.resolve(import.meta.dirname, '../assets/art');

/** 걸이대에 걸리는 것들 — 다듬어서 세로 220 · 가로 320 안에 들어오게. */
const DISHES = ['skewer', 'pig', 'cauldron', 'marshmallow', 'corn', 'fish'];

/**
 * 옅은 알파를 0 으로 눕히고 거의 불투명한 것은 255 로 올린 뒤,
 * 남은 알파에서 직접 경계를 잰다.
 *
 * sharp 의 trim 은 여기서 못 쓴다 — 완전히 투명한 자리의 RGB 가 제각각이라
 * 좌상단 화소를 배경색으로 삼는 방식이 걸리지 않는다. 알파만 보는 게 확실하다.
 */
async function cleanAndBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4 + 3;
      if (data[i] < 24) { data[i] = 0; continue; }
      if (data[i] > 246) data[i] = 255;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error(`${file}: 남는 게 없습니다`);
  return {
    img: sharp(data, { raw: { width: W, height: H, channels: 4 } })
      .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }),
    width: x1 - x0 + 1,
    height: y1 - y0 + 1,
  };
}

fs.mkdirSync(OUT, { recursive: true });

for (const name of [...DISHES, 'flame', 'logs']) {
  const { img, width, height } = await cleanAndBox(`raw-${name}.png`);

  // 불꽃만 세로가 길다. 나머지는 가로로 눕는다.
  const box = name === 'flame' ? { w: 200, h: 320 } : { w: 320, h: 220 };
  const scale = Math.min(box.w / width, box.h / height, 1);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  await img
    .resize(w, h, { kernel: 'lanczos3' })
    .webp({ quality: 86, alphaQuality: 92, effort: 6 })
    .toFile(path.join(OUT, `hearth-${name}.webp`));

  const kb = (fs.statSync(path.join(OUT, `hearth-${name}.webp`)).size / 1024).toFixed(1);
  console.log(`hearth-${name}.webp  ${w}x${h}  ${kb}KB`);
}

// 벽은 투명이 아니라 꽉 찬 재질이다. 화면 전체에 cover 로 깔리고
// CSS 에서 낮은 불투명도로 겹쳐지므로 아주 클 필요가 없다.
await sharp('raw-wall.png')
  .resize(760, 760, { kernel: 'lanczos3' })
  .webp({ quality: 72, effort: 6 })
  .toFile(path.join(OUT, 'wall-stone.webp'));
console.log(`wall-stone.webp  760x760  ${(fs.statSync(path.join(OUT, 'wall-stone.webp')).size / 1024).toFixed(1)}KB`);
