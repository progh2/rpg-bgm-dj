// bard.js — 바드와 몇 마디 나눠 그 자리에서 곡목을 짠다.
//
// 답변 넷이 각각 다른 손잡이를 돌린다.
//   errand    어느 장면 서랍에서 꺼낼지 (가중치)
//   where     어느 장소를 앞세울지 (가중치)
//   presence  집중도 하한 (일을 방해하는 정도)
//   spice     격한 곡을 얼마나 섞을지
//
// 장소와 볼일은 '거르기'가 아니라 '가점'이다. 조건을 좁혀 거르면 마흔 곡도 못 채우는데,
// 그러느니 어울리는 것을 앞에 세우고 나머지를 뒤에 붙이는 편이 낫다.

export const QUESTIONS = [
  {
    id: 'errand',
    ask: '어서 오십시오. 오늘은 무슨 일로 길을 나섰습니까?',
    hint: '홀의 온도를 여기서 정합니다.',
    options: [
      { id: 'rush',  label: '쫓기는 몸이오',   blurb: '기한이 목을 조일 때',    icon: 'rush' },
      { id: 'calm',  label: '그저 쉬러 왔소',  blurb: '오래 앉아 있을 참이라',  icon: 'calm' },
      { id: 'deep',  label: '깊이 파고들 일이', blurb: '방해받지 않고',          icon: 'deep' },
      { id: 'worn',  label: '먼 길에 지쳤소',  blurb: '기운을 좀 차리고',       icon: 'worn' },
    ],
  },
  {
    id: 'where',
    ask: '어느 풍경을 곁에 두고 싶으십니까?',
    hint: '장면을 정해 두면 결이 잘 맞습니다.',
    options: [
      { id: 'town',    label: '마을과 성',      blurb: '장터, 여관, 알현실',      icon: 'town' },
      { id: 'nature',  label: '들과 산',        blurb: '초원, 숲, 설원, 바다',    icon: 'nature' },
      { id: 'ancient', label: '유적과 신비',    blurb: '신전, 마법, 별과 시간',   icon: 'ancient' },
      { id: 'hearth',  label: '난롯가',         blurb: '지붕 아래, 쉼과 회상',    icon: 'hearth' },
    ],
  },
  {
    id: 'presence',
    ask: '노래는 어느 만큼 들리면 되겠습니까?',
    hint: '집중도를 여기서 조절합니다.',
    options: [
      { id: 'bg',   label: '있는 듯 없는 듯', blurb: '일에만 매달릴 참이라', icon: 'soft' },
      { id: 'mid',  label: '적당히',          blurb: '가끔 귀에 걸리게',     icon: 'mid' },
      { id: 'fore', label: '제대로 들려주오', blurb: '노래를 들으러 왔소',   icon: 'loud' },
    ],
  },
  {
    id: 'spice',
    ask: '가끔 칼 부딪는 노래도 섞을까요?',
    hint: '전투 계열을 조금 넣는 것입니다.',
    options: [
      { id: 'none', label: '조용한 걸로만', blurb: '흐름이 끊기지 않게',  icon: 'none' },
      { id: 'some', label: '가끔이면 좋소', blurb: '열 곡에 한 곡쯤',      icon: 'some' },
      { id: 'lots', label: '피가 끓게 해주오', blurb: '기세로 밀어붙이게', icon: 'lots' },
    ],
  },
];

/** 볼일 → 기본 장면군 + 집중도 */
const ERRAND = {
  rush: { scenes: ['D5_heroic', 'C5_resolve', 'D4_hope', 'B6_vehicle', 'B1_overworld'], word: '몰아치는' },
  calm: { scenes: ['B2_town', 'A4_inn', 'D9_mystic', 'B7_terrain'],                     word: '느긋한' },
  deep: { scenes: ['D9_mystic', 'B5_temple', 'A6_save', 'B8_ruinworld', 'D6_ominous'],  word: '깊이 가라앉는' },
  worn: { scenes: ['A4_inn', 'D2_memory', 'D1_sorrow', 'D3_love'],                      word: '기대 쉴 만한' },
};

/** 풍경 → 장면군 */
const WHERE = {
  town:    { scenes: ['B2_town', 'B3_castle', 'D11_festival', 'D8_comic', 'A4_inn'],       word: '장터 어귀' },
  nature:  { scenes: ['B7_terrain', 'B1_overworld', 'B6_vehicle', 'D4_hope'],              word: '성문 밖 들판' },
  ancient: { scenes: ['B5_temple', 'D9_mystic', 'A6_save', 'B8_ruinworld', 'D12_opening'], word: '오래된 유적' },
  hearth:  { scenes: ['A4_inn', 'D2_memory', 'D3_love', 'D13_ending', 'B2_town'],          word: '난롯가' },
};

const PRESENCE = { bg: 5, mid: 4, fore: 3 };

const SPICE = {
  none: { ratio: 0,    scenes: [] },
  some: { ratio: 0.12, scenes: ['C1_battle', 'C2_boss', 'D5_heroic', 'C6_chase'] },
  lots: { ratio: 0.3,  scenes: ['C1_battle', 'C2_boss', 'C3_rival', 'C6_chase', 'C4_finalboss', 'D7_villain'] },
};

function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 한 사람 노래만 내리 나오지 않게 흩뿌린다. */
export function spreadByArtist(tracks) {
  const byArtist = new Map();
  for (const t of tracks) {
    if (!byArtist.has(t.artist)) byArtist.set(t.artist, []);
    byArtist.get(t.artist).push(t);
  }
  const queues = shuffle([...byArtist.values()]);
  for (const q of queues) q.splice(0, q.length, ...shuffle(q));
  const out = [];
  while (queues.some((q) => q.length)) {
    for (const q of queues) if (q.length) out.push(q.shift());
  }
  return out;
}

/**
 * 답변으로 곡목을 짠다.
 * @param {object} answers  {errand, where, presence, spice}
 * @param {object} bySceneMap  BGM_BY_SCENE
 * @param {number} size  목표 곡 수
 */
export function buildFromAnswers(answers, bySceneMap, size = 40) {
  const er = ERRAND[answers.errand] || ERRAND.calm;
  const wh = WHERE[answers.where] || WHERE.town;
  const minFocus = PRESENCE[answers.presence] ?? 4;
  const spice = SPICE[answers.spice] || SPICE.none;

  const weight = new Map();
  for (const s of er.scenes) weight.set(s, (weight.get(s) || 0) + 2);
  for (const s of wh.scenes) weight.set(s, (weight.get(s) || 0) + 2);

  const pool = [];
  for (const [scene, w] of weight) {
    const tracks = (bySceneMap[scene] || []).filter((t) => t.focus >= minFocus);
    for (const t of shuffle(tracks).slice(0, Math.ceil(size * (w / 8) + 4))) {
      pool.push({ ...t, scene });
    }
  }

  // 하한이 빡세서 곡이 모자라면 한 단계 풀어 준다.
  if (pool.length < size && minFocus > 3) {
    for (const [scene] of weight) {
      for (const t of bySceneMap[scene] || []) {
        if (t.focus >= minFocus - 1 && !pool.some((p) => p.videoId === t.videoId)) {
          pool.push({ ...t, scene });
        }
      }
    }
  }

  const seen = new Set();
  const unique = pool.filter((t) => !seen.has(t.videoId) && seen.add(t.videoId));
  let list = spreadByArtist(unique).slice(0, size);

  const spiceCount = Math.round(size * spice.ratio);
  if (spiceCount > 0) {
    const hot = [];
    for (const scene of spice.scenes) {
      for (const t of bySceneMap[scene] || []) {
        if (!seen.has(t.videoId)) { hot.push({ ...t, scene, spicy: true }); seen.add(t.videoId); }
      }
    }
    const picks = shuffle(hot).slice(0, spiceCount);
    list = list.slice(0, Math.max(0, size - picks.length));
    const step = Math.max(1, Math.floor(list.length / (picks.length + 1)));
    picks.forEach((t, i) => list.splice(Math.min(list.length, (i + 1) * step + i), 0, t));
  }

  return { tracks: list, summary: describe(answers, list), scenes: [...weight.keys()], minFocus };
}

function describe(answers, tracks) {
  const er = ERRAND[answers.errand] || ERRAND.calm;
  const wh = WHERE[answers.where] || WHERE.town;
  const spicy = tracks.filter((t) => t.spicy).length;
  const lines = [`${wh.word}에서 ${er.word} 결로 ${tracks.length}곡 골랐습니다.`];
  if (spicy > 0) lines.push(`중간중간 칼 부딪는 곡 ${spicy}곡 끼워 뒀으니 놀라지 마십시오.`);
  if (answers.presence === 'bg') lines.push('있는 듯 없는 듯 깔아 두겠습니다. 일 보십시오.');
  else if (answers.presence === 'fore') lines.push('오늘은 노래에도 귀를 좀 주십시오.');
  return lines.join(' ');
}

/** 묻지 않고 바로 트는 기본값 — "일하며 틀어놓기" */
export const DEFAULT_ANSWERS = { errand: 'calm', where: 'nature', presence: 'bg', spice: 'none' };

export const CHATTER = {
  greet:   ['자리 잡으셨습니까. 무엇을 들려 드릴까요.', '어서 오십시오. 오늘도 일하러 오셨군요.', '오셨군요. 줄은 조율해 두었습니다.'],
  picking: ['음—— 잠시만.', '악보를 뒤적이는 중입니다.', '이게 어울리겠군요.'],
  playing: ['그럼 시작하겠습니다.', '한 곡 뽑겠습니다.', '좋습니다, 이 결입니다.'],
  paused:  ['잠시 쉬어 갈까요.', '줄을 눌러 두었습니다.'],
  done:    ['한 바퀴 다 돌았습니다. 더 할까요?', '곡목이 끝났습니다. 새로 짤까요?'],
};

export const pickChatter = (key) => {
  const arr = CHATTER[key] || CHATTER.greet;
  return arr[Math.floor(Math.random() * arr.length)];
};


/* ── 라온이 직접 고르는 곡목 ─────────────────────────────────────
   문답을 거치지 않고 류트를 퉁겼을 때. 지금이 몇 시인지만 보고 짠다.
   새벽 세 시에 축제 음악을 트는 것만 피해도 절반은 맞힌 셈이다. */

const PHASE_PICK = {
  deep_night: { scenes: ['D9_mystic', 'D2_memory', 'A4_inn', 'B5_temple', 'D1_sorrow'],
                floor: 5, say: '이 시간에는 소리를 낮춘 것이 낫습니다. 조용한 것으로 골랐습니다.' },
  dawn:       { scenes: ['D4_hope', 'D2_memory', 'A6_save', 'B2_town', 'D9_mystic'],
                floor: 4, say: '곧 해가 뜹니다. 밝아 오는 결로 골랐습니다.' },
  morning:    { scenes: ['B2_town', 'B1_overworld', 'D4_hope', 'A4_inn', 'D12_opening'],
                floor: 4, say: '아침이니 걸음이 가벼운 것으로 골랐습니다.' },
  day:        { scenes: ['B1_overworld', 'B7_terrain', 'B2_town', 'B6_vehicle', 'D5_heroic'],
                floor: 4, say: '볕이 좋습니다. 길 떠나는 결로 골랐습니다.' },
  dusk:       { scenes: ['A4_inn', 'B2_town', 'D3_love', 'D2_memory', 'D11_festival'],
                floor: 4, say: '해가 기웁니다. 하루를 접는 결로 골랐습니다.' },
  evening:    { scenes: ['A4_inn', 'D3_love', 'B3_castle', 'D9_mystic', 'D2_memory'],
                floor: 4, say: '저녁입니다. 난롯가에 어울리는 것으로 골랐습니다.' },
  night:      { scenes: ['D9_mystic', 'A4_inn', 'D2_memory', 'B5_temple', 'D1_sorrow'],
                floor: 5, say: '밤이 깊었습니다. 거슬리지 않을 것만 골랐습니다.' },
};

/**
 * 시각에 맞춰 곡목을 짠다.
 * @param {string} phaseId  hearth.js 의 시간대 id
 * @param {object} bySceneMap
 * @param {number} size
 * @returns {{tracks:object[], summary:string}}
 */
export function pickForPhase(phaseId, bySceneMap, size = 30) {
  const plan = PHASE_PICK[phaseId] || PHASE_PICK.evening;
  const seen = new Set();
  const pool = [];
  for (const scene of plan.scenes) {
    for (const t of bySceneMap[scene] || []) {
      if ((t.focus ?? 0) < plan.floor || seen.has(t.videoId)) continue;
      seen.add(t.videoId);
      pool.push({ ...t, scene });
    }
  }
  // 모자라면 문턱을 한 단계 낮춰 채운다
  if (pool.length < size) {
    for (const scene of plan.scenes) {
      for (const t of bySceneMap[scene] || []) {
        if (seen.has(t.videoId)) continue;
        seen.add(t.videoId);
        pool.push({ ...t, scene });
      }
    }
  }
  const tracks = spreadByArtist(pool.sort(() => Math.random() - 0.5)).slice(0, size);
  return { tracks, summary: plan.say };
}
