// sounds.js — 여관에서 나는 소리들.
//
// 음원 파일을 두지 않고 그 자리에서 합성한다. 라이선스를 따질 것도, 내려받을 것도,
// CSP 에 구멍을 낼 것도 없다. 종·잔·장작 정도는 신시사이저로 흉내 내기 좋은 축에 든다.
//
// 종소리의 요령은 **배음을 정수배로 두지 않는 것**이다. 1:2:3:4 로 쌓으면 오르간이 된다.
// 실제 금속은 부분음이 어긋나 있고 높은 부분음일수록 빨리 사그라진다. 그 둘만 지켜도
// 귀는 '종'으로 듣는다.

let ctx = null;

function audio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    // 브라우저가 사용자 조작 전 오디오를 막아 둔 경우 깨운다
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}

/** 감쇠하는 사인 부분음 하나 */
function partial(c, freq, gain, decay, delay = 0, type = 'sine') {
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
  osc.connect(amp).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + decay + 0.05);
}

/** 잡음 한 줌 — 장작 튀는 소리, 잔 부딪는 소리의 재료 */
function noise(c, { gain = 0.12, decay = 0.12, delay = 0, hp = 900 } = {}) {
  const t0 = c.currentTime + delay;
  const len = Math.max(1, Math.floor(c.sampleRate * decay));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'highpass';
  filt.frequency.value = hp;
  const amp = c.createGain();
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
  src.connect(filt).connect(amp).connect(c.destination);
  src.start(t0);
}

/** 문간 종 — 손님이 들어올 때 딸랑 */
export function doorBell() {
  const c = audio(); if (!c) return;
  // 부분음을 어긋나게 쌓는다 (1 : 2.7 : 5.4 : 8.1)
  partial(c, 880,  0.16, 1.6);
  partial(c, 2376, 0.09, 1.0, 0.005);
  partial(c, 4752, 0.05, 0.6, 0.01);
  partial(c, 7128, 0.03, 0.35, 0.015);
  noise(c, { gain: 0.05, decay: 0.05, hp: 3000 });
}

/** 카운터 종 — 두 번 짧게 */
export function counterBell() {
  const c = audio(); if (!c) return;
  for (const d of [0, 0.16]) {
    partial(c, 1244, 0.14, 1.1, d);
    partial(c, 3359, 0.07, 0.7, d + 0.004);
    partial(c, 6842, 0.04, 0.4, d + 0.008);
  }
}

/** 장작 튀는 소리 — 화로를 쿡 찔렀을 때 */
export function crackle() {
  const c = audio(); if (!c) return;
  const n = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    noise(c, {
      gain: 0.05 + Math.random() * 0.07,
      decay: 0.04 + Math.random() * 0.06,
      delay: Math.random() * 0.28,
      hp: 1200 + Math.random() * 2600,
    });
  }
  // 낮은 웅웅거림 한 겹
  partial(c, 90 + Math.random() * 40, 0.05, 0.5, 0, 'triangle');
}

/** 잔 부딪는 소리 — 건배 */
export function clink() {
  const c = audio(); if (!c) return;
  partial(c, 1568, 0.11, 0.9);
  partial(c, 4076, 0.06, 0.55, 0.003);
  partial(c, 7840, 0.03, 0.3,  0.006);
  noise(c, { gain: 0.06, decay: 0.04, hp: 4000 });
}

/** 류트 한 음 — 바드가 줄을 퉁길 때 */
export function pluck(freq = 294) {
  const c = audio(); if (!c) return;
  partial(c, freq,       0.10, 1.4, 0, 'triangle');
  partial(c, freq * 2,   0.05, 0.9, 0.002, 'triangle');
  partial(c, freq * 3.0, 0.03, 0.5, 0.004);
  noise(c, { gain: 0.03, decay: 0.03, hp: 2000 });
}

/** 류트 아르페지오 — 숨은 것을 찾았을 때 */
export function flourish() {
  const c = audio(); if (!c) return;
  // 라단조 아르페지오 (D F A D)
  [293.66, 349.23, 440.0, 587.33].forEach((f, i) => {
    partial(c, f,     0.09, 1.5, i * 0.09, 'triangle');
    partial(c, f * 2, 0.04, 0.9, i * 0.09 + 0.002, 'triangle');
  });
}


/** 씹는 소리 — 화로에 걸린 것을 먹었을 때 */
export function munch() {
  const c = audio(); if (!c) return;
  // 짧은 잡음 두어 번 + 낮은 울림. 씹는 소리는 이 정도면 귀가 알아듣는다.
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) {
    noise(c, { gain: 0.10, decay: 0.07 + Math.random() * 0.04, delay: i * 0.13, hp: 600 + Math.random() * 700 });
    partial(c, 120 + Math.random() * 50, 0.06, 0.10, i * 0.13, 'triangle');
  }
  // 만족스러운 한숨
  partial(c, 210, 0.04, 0.4, n * 0.13, 'sine');
}

/** 지글거리는 소리 — 음식이 익을 때 한 번씩 */
export function sizzle() {
  const c = audio(); if (!c) return;
  noise(c, { gain: 0.035, decay: 0.5, hp: 3500 });
}

/** 냄비 끓는 소리 */
export function bubble() {
  const c = audio(); if (!c) return;
  for (let i = 0; i < 3; i++) {
    partial(c, 160 + Math.random() * 120, 0.05, 0.14, i * 0.11 + Math.random() * 0.05, 'sine');
  }
}

/** 소리를 켜고 끌 수 있게 한다 (기본 켬) */
const MUTE_KEY = 'rpgbgm.muteSfx';
export function sfxMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}
export function setSfxMuted(v) {
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* noop */ }
}

/** 음소거 상태를 존중하는 래퍼 */
export const sfx = new Proxy(
  { doorBell, counterBell, crackle, clink, pluck, flourish, munch, sizzle, bubble },
  { get: (t, k) => (...a) => { if (!sfxMuted() && t[k]) t[k](...a); } },
);
