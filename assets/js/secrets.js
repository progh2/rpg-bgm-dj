// secrets.js — 홀에 숨겨 둔 것들.
//
// 찾으면 반가운 정도로만 둔다. 못 찾아도 재생기 쓰는 데 아무 지장이 없고,
// 찾았다고 해서 대단한 게 나오지도 않는다. 그 선을 넘으면 이스터에그가 아니라 숨긴 기능이다.
//
// 찾은 것은 localStorage 에 남겨 두고, 여관 야사에 한 줄씩 적어 준다.
//
// 항목마다 두 가지를 들고 있다.
//   nudge — 아직 못 찾았을 때 보여 주는 귀띔. 답을 대 주지는 않되 어디를
//           들여다볼지는 알려 준다. 감도 못 잡으면 찾을 마음이 안 생긴다.
//   done  — 찾고 나서 적히는 문장. 지난 일처럼 적는다.

import { sfx } from './sounds.js';

const KEY = 'rpgbgm.found';

export const SECRETS = {
  bell: {
    label: '문간 종',
    nudge: '머리말 오른쪽 끝, 고리 하나가 걸려 있습니다.',
    done: '들어오면서 종을 울렸다',
  },
  toast: {
    label: '건배',
    nudge: '머리말에 적힌 곡 수를 잔이라 여기고 부딪쳐 보십시오.',
    done: '잔을 부딪쳤다',
  },
  hearth: {
    label: '불씨',
    nudge: '빈 화로라고 그냥 두지 마십시오. 쿡 찔러 보면 뭔가 튑니다.',
    done: '화로를 쿡 찔러 보았다',
  },
  gourmet: {
    label: '미식가',
    nudge: '화로에는 여섯 가지가 번갈아 걸립니다. 다 익기를 기다렸다가 종류대로.',
    done: '화로에 걸린 것을 종류대로 다 먹어 보았다',
  },
  bard: {
    label: '수다쟁이',
    nudge: '라온을 자꾸 건드리면 하는 말이 달라집니다. 일곱 번쯤.',
    done: '라온에게 일곱 번 말을 걸었다',
  },
  lute: {
    label: '즉흥곡',
    nudge: '라온의 류트는 눌러 볼 수 있게 생기지 않았습니까.',
    done: '류트를 퉁겨 즉석에서 곡을 청했다',
  },
  trinket: {
    label: '태엽 오르골',
    nudge: '화로 맨틀 위에 놓인 작은 것, 장식만은 아닐 겁니다.',
    done: '맨틀 위 오르골의 태엽을 감았다',
  },
  patron: {
    label: '단골',
    nudge: '한 곡도 건너뛰지 말고 다섯 곡을 내리 들어 보십시오. 라온이 아껴 둔 곡목을 꺼냅니다.',
    done: '건너뛰지 않고 다섯 곡을 내리 들었다',
  },
  nightowl: {
    label: '올빼미',
    nudge: '자정을 넘겨 홀에 앉아 계시면. (머리말의 시간대를 눌러 돌려 볼 수도 있습니다)',
    done: '깊은 밤에 홀에 앉아 있었다',
  },
  wanderer: {
    label: '떠돌이',
    nudge: '머물 곳이 일곱 군데입니다. 오른쪽 아래에서 하나씩 옮겨 보십시오.',
    done: '일곱 곳을 모두 둘러보았다',
  },
  loremaster: {
    label: '기록관',
    nudge: '장면 서랍에 서른네 장면이 있습니다. 한 번씩은 들어 봐야 적힙니다.',
    done: '서른네 장면을 모두 열어 보았다',
  },
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

/* ── 단골 ─────────────────────────────────────────────────────
   예전에는 오락실 커맨드(↑↑↓↓←→←→BA)를 외우게 했다. 그 손버릇을 아는 사람이
   이제 많지 않아서, 이 재생기를 원래 쓰는 방식 그대로 — 건너뛰지 않고 듣기 —
   가 조건이 되게 바꿨다. 다섯 곡을 내리 들으면 열린다. */

const STRAIGHT_KEY = 'rpgbgm.straight';
const STRAIGHT_NEEDED = 5;
let onPatron = null;

/** 단골이 되었을 때 부를 함수를 등록한다. */
export function onBecomePatron(fn) { onPatron = fn; }

function straightCount(v) {
  try {
    if (v === undefined) return Number(localStorage.getItem(STRAIGHT_KEY) || 0);
    localStorage.setItem(STRAIGHT_KEY, String(v));
  } catch { /* noop */ }
  return v ?? 0;
}

/** 한 곡을 끝까지 들었다. */
export function noteFinished() {
  if (hasFound('patron')) return;
  const n = straightCount() + 1;
  straightCount(n);
  if (n >= STRAIGHT_NEEDED) { find('patron'); onPatron?.(); }
}

/** 건너뛰었다 — 연속이 끊긴다. */
export function noteSkipped() {
  if (hasFound('patron')) return;
  straightCount(0);
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
