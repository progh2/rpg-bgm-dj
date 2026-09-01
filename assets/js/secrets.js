// secrets.js — 홀에 숨겨 둔 것들.
//
// 찾으면 반가운 정도로만 둔다. 못 찾아도 재생기 쓰는 데 아무 지장이 없고,
// 찾았다고 해서 대단한 게 나오지도 않는다. 그 선을 넘으면 이스터에그가 아니라 숨긴 기능이다.
//
// 찾은 것은 localStorage 에 남겨 두고, 손님 명부에 도장처럼 찍어 준다.

import { sfx } from './sounds.js';

const KEY = 'rpgbgm.found';

export const SECRETS = {
  bell:      { label: '문간 종',       hint: '들어오면서 종을 울렸다' },
  hearth:    { label: '불씨',          hint: '화로를 쿡 찔러 보았다' },
  toast:     { label: '건배',          hint: '잔을 부딪쳤다' },
  bard:      { label: '수다쟁이',      hint: '바드에게 일곱 번 말을 걸었다' },
  konami:    { label: '전설의 곡목',   hint: '옛 주문을 외웠다' },
  nightowl:  { label: '올빼미',        hint: '깊은 밤에 홀에 앉아 있었다' },
  wanderer:  { label: '떠돌이',        hint: '일곱 곳을 모두 둘러보았다' },
  loremaster:{ label: '기록관',        hint: '서른네 장면을 모두 열어 보았다' },
  gourmet:   { label: '미식가',        hint: '화로에 걸린 것을 종류대로 다 먹어 보았다' },
};

function read() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); }
  catch { return new Set(); }
}
function write(set) {
  try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch { /* noop */ }
}

export function found() { return read(); }
export function hasFound(id) { return read().has(id); }

let onFind = null;
/** 무언가 찾았을 때 부를 함수를 등록한다. (id, secret, 전체개수) */
export function onSecret(fn) { onFind = fn; }

/** 하나 찾았다고 기록한다. 이미 찾은 것이면 아무 일도 없다. */
export function find(id) {
  const s = SECRETS[id];
  if (!s) return false;
  const set = read();
  if (set.has(id)) return false;
  set.add(id);
  write(set);
  sfx.flourish();
  onFind?.(id, s, set.size);
  return true;
}

/* ── 옛 주문 (↑↑↓↓←→←→BA) ─────────────────────────────── */

const SPELL = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
               'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let progress = 0;

/**
 * 키 입력을 지켜본다.
 * @param {()=>void} onSpell 주문이 완성됐을 때
 */
export function watchSpell(onSpell) {
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    // Shift 조합은 재생기 단축키라 주문으로 세지 않는다
    if (e.shiftKey && e.code.startsWith('Arrow')) { progress = 0; return; }
    if (e.code === SPELL[progress]) {
      progress += 1;
      if (progress === SPELL.length) {
        progress = 0;
        find('konami');
        onSpell?.();
      }
    } else {
      // 틀렸어도 첫 글자면 거기서 다시 시작
      progress = e.code === SPELL[0] ? 1 : 0;
    }
  });
}

/** 깊은 밤에 앉아 있으면 */
export function checkNightOwl(phaseId) {
  if (phaseId === 'deep_night') find('nightowl');
}

/** 들른 장소를 세어 둔다 */
const HALL_KEY = 'rpgbgm.visitedHalls';
export function noteHall(id, total) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(HALL_KEY) || '[]'));
    v.add(id);
    localStorage.setItem(HALL_KEY, JSON.stringify([...v]));
    if (v.size >= total) find('wanderer');
  } catch { /* noop */ }
}

/** 열어 본 장면을 세어 둔다 */
const SCENE_KEY = 'rpgbgm.playedScenes';
export function noteScene(id, total) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(SCENE_KEY) || '[]'));
    v.add(id);
    localStorage.setItem(SCENE_KEY, JSON.stringify([...v]));
    if (v.size >= total) find('loremaster');
  } catch { /* noop */ }
}

/** 바드에게 말 건 횟수 */
let talks = 0;
export function noteTalk() {
  talks += 1;
  if (talks >= 7) find('bard');
  return talks;
}

/** 주문으로 열리는 전설의 곡목 — 각 장면에서 집중도가 가장 높은 한 곡씩 */
export function legendaryList(bySceneMap) {
  const out = [];
  for (const [scene, tracks] of Object.entries(bySceneMap)) {
    const best = [...tracks].sort((a, b) => b.focus - a.focus || (b.length || 0) - (a.length || 0))[0];
    if (best) out.push({ ...best, scene });
  }
  return out.sort(() => Math.random() - 0.5);
}
