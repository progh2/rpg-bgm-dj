// 화로에 걸리는 것들 · 불 · 벽을 gpt-image-2 로 뽑는다. 프롬프트가 곧 기록이다.
//
//   export OPENAI_API_KEY=...
//   cd .art-work && node ../tools/gen_hearth_art.mjs [이름…]
//
// 이름을 주면 그것만 다시 뽑는다 (한 장에 5센트쯤). raw-*.png 로 떨어지고,
// tools/make_hearth_art.mjs 가 그걸 다듬어 assets/art/ 에 넣는다.
import fs from 'node:fs';

const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('OPENAI_API_KEY 없음');
const RATE = { text_in: 5.0, image_in: 8.0, out: 30.0 };

// 바드와 같은 결로 맞춘다. 발광·광택·그림자는 명시적으로 뺀다 —
// 돌 화로 위에 얹히는 그림이라 빛이 구워져 있으면 겉돈다.
const STYLE = `Flat vector game-icon illustration for a cozy medieval fantasy tavern.
Thick bold black outlines, matte cel shading, flat colours, no gradients, no gloss,
no glow, no rim light, no lens flare. Warm brown, amber, ochre and cream palette.
Fully transparent background — no backdrop, no scenery, no ground shadow, no smoke,
no plate, no table. One single object, centred, filling the frame.`;

const JOBS = [
  // ── 화로에 걸리는 것들. 가로 막대가 있는 것은 걸이대에 걸린다.
  { name: 'skewer', prompt: `Three chunks of grilled meat threaded on one straight horizontal iron skewer rod, seen from the side. The rod runs perfectly level across the full width and sticks out past the meat at both ends. Both ends of the rod are plain blunt cut metal — no arrowhead, no spear tip, no ring, no loop, no handle, no decoration of any kind. ${STYLE}` },
  { name: 'pig', prompt: `A whole small roast suckling pig on a straight horizontal iron spit rod running through it lengthwise, seen from the side, snout to the left, legs tucked under. The rod runs level and sticks out past the pig at both ends. ${STYLE}` },
  { name: 'cauldron', prompt: `A black cast iron cauldron half full of thick amber stew, hanging from a curved iron S-hook, seen from the side. The cauldron has a semicircular iron handle arching over its top and the S-hook grips the middle of that handle. The hook is at the very top edge of the image with the pot hanging below it. Tall vertical composition, no legs visible under the pot. ${STYLE}` },
  { name: 'marshmallow', prompt: `Two plump toasted marshmallows threaded on one straight horizontal wooden stick, seen from the side. The stick runs perfectly level across the full width and sticks out past the marshmallows at both ends. Horizontal composition, wider than it is tall. Not tilted, not diagonal, not angled. ${STYLE}` },
  { name: 'corn', prompt: `One roasted potato and one ear of corn with a green husk leaf, lying side by side on a small heap of grey ash and dull embers, seen from the side. ${STYLE}` },
  { name: 'fish', prompt: `A whole grilled freshwater fish threaded lengthwise on one straight horizontal wooden stick, seen from the side, head to the left and tail to the right, lying level. The stick runs perfectly level and sticks out past the fish at both ends. Horizontal composition, wider than it is tall. Not tilted, not diagonal, not angled, not standing on its tail. ${STYLE}` },

  // ── 불. 불멍이 이 재생기의 쓰임이라 불꽃을 세 가지 모양으로 뽑아 겹친다.
  //    한 장을 세 번 쓰면 몇 초만 봐도 같은 실루엣이 반복되는 게 보인다.
  { name: 'flame-a', prompt: `A single tall slender tongue of campfire flame seen from the side, narrow and rising straight, tapering to a wavy pointed tip, layered deep orange outside, amber inside and pale yellow at the core. Only the flame itself — no logs, no firewood, no sparks, no smoke. ${STYLE}` },
  { name: 'flame-b', prompt: `A single broad billowing campfire flame seen from the side, wide and rounded at the base with two shorter tongues splitting off near the top, layered deep orange outside, amber inside and pale yellow at the core. Only the flame itself — no logs, no firewood, no sparks, no smoke. ${STYLE}` },
  { name: 'flame-c', prompt: `A single small low campfire flame seen from the side, short and curling over to one side as if leaning in a draught, layered deep orange and amber with a pale yellow core. Only the flame itself — no logs, no firewood, no sparks, no smoke. ${STYLE}` },
  { name: 'embers', prompt: `A low wide bed of glowing embers and broken charcoal seen from the side: dark grey and black lumps with hot orange and yellow glowing cracks in the gaps between them. A flat spread heap, much wider than it is tall, sitting low. No flames, no whole logs, no smoke. ${STYLE}` },
  { name: 'logs', prompt: `Three charred firewood logs stacked in a low criss-cross pile, seen from the side, with dull glowing orange embers in the gaps between them. Only the logs and embers — no flames rising above them. ${STYLE}` },

  // ── 벽. 이건 투명이 아니라 꽉 찬 재질이다.
  { name: 'wall', opaque: true, prompt: `A dark stone masonry tavern wall: rough hewn rectangular blocks of grey brown stone with thick pale mortar lines, crossed by a few aged dark wooden beams. Evenly lit, flat and matte, low contrast, desaturated. A plain repeating wall surface filling the whole frame edge to edge, photographed straight on. No objects, no furniture, no torches, no windows, no people, no vignette, no strong highlights or shadows.` },
];

const want = process.argv.slice(2);
const jobs = want.length ? JOBS.filter((j) => want.includes(j.name)) : JOBS;

let total = 0;
const results = await Promise.all(jobs.map(async (job) => {
  const body = {
    model: 'gpt-image-2',
    prompt: job.prompt,
    size: '1024x1024',
    quality: 'medium',
    n: 1,
    output_format: 'png',
  };
  if (!job.opaque) body.background = 'transparent';

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  if (j.error) return { name: job.name, err: j.error.message };

  const out = `raw-${job.name}.png`;
  fs.writeFileSync(out, Buffer.from(j.data[0].b64_json, 'base64'));
  const u = j.usage || {};
  const usd = ((u.input_tokens_details?.text_tokens ?? 0) * RATE.text_in
             + (u.input_tokens_details?.image_tokens ?? 0) * RATE.image_in
             + (u.output_tokens ?? 0) * RATE.out) / 1e6;
  total += usd;
  return { name: job.name, kb: (fs.statSync(out).size / 1024) | 0, usd };
}));

for (const r of results) {
  console.log(r.err ? `${r.name.padEnd(12)} 실패: ${r.err}`
                    : `${r.name.padEnd(12)} ${String(r.kb).padStart(4)}KB  $${r.usd.toFixed(4)}`);
}
console.log(`\n합계 $${total.toFixed(4)} (${results.filter((r) => !r.err).length}장)`);
