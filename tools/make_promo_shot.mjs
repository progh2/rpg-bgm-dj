// 홍보용 스크린샷 — 실제 재생기를 연출해 16:10 으로 찍는다.
//
//   (작업 폴더에) npm install playwright-core sharp
//   (저장소 뿌리에서) python3 -m http.server 8777
//   cd .art-work && node ../tools/make_promo_shot.mjs
//
// 16:10 은 dorms.school 스크린샷 칸의 비율이다. 다른 데 쓸 거면 viewport 를 고친다.
// 연출은 전부 실제 화면 조작이라, 없는 기능을 그려 넣은 그림이 아니다.
// 결과: promo-warm.png (2560x1600). assets/art/promo.jpg 는 이걸 1600x1000 으로 줄인 것.

import { chromium } from 'playwright-core';
const base = `${process.env.HOME}/.cache/ms-playwright/chromium-1234/chrome-linux64`;
const b = await chromium.launch({ executablePath: `${base}/chrome`, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:8777/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);

// 따뜻한 결이 나오게 고른다: 그저 쉬러 왔소 → 난롯가 → (아무거나) → 격한 곡 없이
const picks = [1, 3, 0, 0];
for (const idx of picks) {
  await p.waitForSelector('.ask-opt', { timeout: 10000 });
  const btns = await p.$$('.ask-opt');
  await (btns[Math.min(idx, btns.length - 1)]).click();
  await p.waitForTimeout(500);
}
await p.waitForTimeout(3500);

console.log(await p.evaluate(() => ({
  무드: document.getElementById('mood-chip').textContent,
  곡: document.getElementById('pc-song').textContent.slice(0, 40),
})));

await p.evaluate(async () => {
  const { setPhase } = await import('/assets/js/hearth.js');
  const { applyHall } = await import('/assets/js/halls.js');
  const { MOODS } = await import('/assets/js/moods.js');
  setPhase('evening');
  applyHall('oak_inn', MOODS.calm);                  // 따뜻한 참나무 여관으로 고정
  document.getElementById('hall-lock').checked = true;
  document.getElementById('mood-chip').textContent = '평온';
  document.getElementById('hearth').classList.add('burning');
  document.getElementById('hearth-tag').textContent = '활활';
  const slot = document.getElementById('roast');
  slot.innerHTML = '<img class="dish" src="assets/art/hearth-pig.webp" alt="">';
  slot.dataset.stage = 'done'; slot.dataset.dish = 'pig'; slot.dataset.seat = 'spit';
  document.getElementById('hearth-dish').textContent = '돼지 통구이 · 다 익음';
  document.getElementById('bard-stage').dataset.state = 'play';
  document.getElementById('mantel-lantern').setAttribute('aria-pressed', 'true');
  document.getElementById('note-text').textContent = '저녁입니다. 난롯가에 어울리는 것으로 골라 드리지요.';
  // 눌린 표시도 참나무 여관으로 옮긴다 (applyHall 은 색만 바꾼다)
  for (const btn of document.querySelectorAll('.hall-btn')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.hall === 'oak_inn'));
  }
  // 흐르는 곡목을 세워 둔다. 마퀴는 안쪽 span 에 padding-left:100% 를 줘서
  // 시작 순간 글자가 오른쪽 밖에 있다 — 그래서 animation 만 끄면 빈칸이 된다.
  // 재생기가 짧은 제목에 쓰는 .short 가 패딩까지 같이 없애 주므로 그걸 쓴다.
  document.querySelector('.scroll').classList.add('short');
  // 한 화면에 머리글·화로·무대가 다 들어오게 살짝 줌아웃 (CSSOM 이라 CSP 에 안 걸린다)
  document.body.style.zoom = '0.84';
});
await p.waitForTimeout(1500);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(700);
await p.screenshot({ path: 'promo-warm.png' });
console.log('찍음 promo-warm.png');
await b.close();
