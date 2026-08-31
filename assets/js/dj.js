// dj.js — 치비 DJ와의 질답으로 즉석 플레이리스트를 만든다 (issue #4)
//
// 답변은 세 가지를 조절한다:
//   scenes  — 어느 장면 유형에서 고를지
//   focus   — 집중도 하한 (작업 방해 정도)
//   spice   — 격한 곡을 섞을 비율

/** 질문지. 순서대로 물어본다. */
export const QUESTIONS = [
  {
    id: 'situation',
    ask: '어서 와. 오늘은 어떤 하루야?',
    hint: '상황에 맞춰 온도를 맞춰줄게.',
    options: [
      { id: 'rush',  label: '마감이 급해',      blurb: '몰아쳐야 할 때',       icon: 'rush' },
      { id: 'calm',  label: '평온하게 가고 싶어', blurb: '차분히 오래',         icon: 'calmSit' },
      { id: 'deep',  label: '깊게 몰입할 거야',   blurb: '방해 없이 파고들기',    icon: 'deep' },
      { id: 'worn',  label: '좀 지쳤어',        blurb: '회복하면서 천천히',     icon: 'worn' },
    ],
  },
  {
    id: 'place',
    ask: '어디에 있는 기분이면 좋겠어?',
    hint: '장면을 정해두면 결이 잘 맞아.',
    options: [
      { id: 'town',    label: '마을과 내정',    blurb: '사람 사는 온기, 시장, 여관', icon: 'town' },
      { id: 'nature',  label: '자연과 야외',    blurb: '들판, 숲, 설원, 바다',     icon: 'nature' },
      { id: 'ancient', label: '고대 유적과 신비', blurb: '신전, 마법, 별과 시간',    icon: 'ancient' },
      { id: 'indoor',  label: '아늑한 실내',    blurb: '난롯가, 서재, 휴식',      icon: 'indoor' },
    ],
  },
  {
    id: 'presence',
    ask: '소리는 어느 정도 존재감이면 좋아?',
    hint: '집중도를 여기서 조절해.',
    options: [
      { id: 'bg',   label: '배경으로 조용히', blurb: '있는 줄도 모르게', icon: 'soft' },
      { id: 'mid',  label: '적당히',        blurb: '가끔 귀에 걸리게',  icon: 'mid' },
      { id: 'fore', label: '존재감 있게',    blurb: '음악을 듣고 싶어',  icon: 'loud' },
    ],
  },
  {
    id: 'spice',
    ask: '가끔 확 끓어오르는 곡도 섞을까?',
    hint: '전투곡 계열을 조금 넣는 거야.',
    options: [
      { id: 'none', label: '아니, 잔잔하게', blurb: '흐름을 깨지 않게',  icon: 'none' },
      { id: 'some', label: '가끔이면 좋아',  blurb: '10곡에 한 곡쯤',    icon: 'some' },
      { id: 'lots', label: '팍팍 넣어줘',   blurb: '기세로 밀어붙이기',  icon: 'lots' },
    ],
  },
];

/** 상황 → 기본 장면군 + 집중도 */
const SITUATION = {
  rush: { scenes: ['D5_heroic', 'C5_resolve', 'D4_hope', 'B6_vehicle', 'B1_overworld'], focus: 3, tempoWord: '몰아치는' },
  calm: { scenes: ['B2_town', 'A4_inn', 'D9_mystic', 'B7_terrain'],                     focus: 4, tempoWord: '느긋한' },
  deep: { scenes: ['D9_mystic', 'B5_temple', 'A6_save', 'B8_ruinworld', 'D6_ominous'],  focus: 4, tempoWord: '깊이 가라앉는' },
  worn: { scenes: ['A4_inn', 'D2_memory', 'D1_sorrow', 'D3_love'],                      focus: 4, tempoWord: '기대 쉴 수 있는' },
};

/** 장소 → 장면군 */
const PLACE = {
  town:    { scenes: ['B2_town', 'B3_castle', 'D11_festival', 'D8_comic', 'A4_inn'],     word: '마을 어귀' },
  nature:  { scenes: ['B7_terrain', 'B1_overworld', 'B6_vehicle', 'D4_hope'],            word: '바깥 들판' },
  ancient: { scenes: ['B5_temple', 'D9_mystic', 'A6_save', 'B8_ruinworld', 'D12_opening'], word: '오래된 유적' },
  indoor:  { scenes: ['A4_inn', 'D2_memory', 'D3_love', 'D13_ending', 'B2_town'],        word: '난롯가' },
};

/** 존재감 → 집중도 하한 */
const PRESENCE = { bg: 5, mid: 4, fore: 3 };

/** 격한 곡 비율 */
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

/** 한 아티스트가 연달아 나오지 않게 흩뿌린다. */
function spreadByArtist(tracks) {
  const byArtist = new Map();
  for (const t of tracks) {
    if (!byArtist.has(t.artist)) byArtist.set(t.artist, []);
    byArtist.get(t.artist).push(t);
  }
  const queues = shuffle([...byArtist.values()]);
  const out = [];
  while (queues.some((q) => q.length)) {
    for (const q of queues) if (q.length) out.push(q.shift());
  }
  return out;
}

/**
 * 답변으로 재생목록을 만든다.
 * @param {object} answers  {situation, place, presence, spice}
 * @param {object} bySceneMap  BGM_BY_SCENE
 * @param {number} size  목표 곡 수
 */
export function buildFromAnswers(answers, bySceneMap, size = 40) {
  const sit = SITUATION[answers.situation] || SITUATION.calm;
  const plc = PLACE[answers.place] || PLACE.town;
  const minFocus = PRESENCE[answers.presence] ?? 4;
  const spice = SPICE[answers.spice] || SPICE.none;

  // 상황과 장소가 함께 지목한 장면에 가중치를 준다.
  const weight = new Map();
  for (const s of sit.scenes) weight.set(s, (weight.get(s) || 0) + 2);
  for (const s of plc.scenes) weight.set(s, (weight.get(s) || 0) + 2);

  const pool = [];
  for (const [scene, w] of weight) {
    const tracks = (bySceneMap[scene] || []).filter((t) => t.focus >= minFocus);
    // 가중치가 높은 장면에서 더 많이 뽑는다.
    for (const t of shuffle(tracks).slice(0, Math.ceil(size * (w / 8) + 4))) {
      pool.push({ ...t, scene });
    }
  }

  // 집중도 하한이 너무 빡세서 곡이 모자라면 한 단계 풀어준다.
  if (pool.length < size && minFocus > 3) {
    for (const [scene] of weight) {
      for (const t of bySceneMap[scene] || []) {
        if (t.focus >= minFocus - 1 && !pool.some((p) => p.videoId === t.videoId)) {
          pool.push({ ...t, scene });
        }
      }
    }
  }

  // 중복 제거 후 아티스트를 흩뿌린다.
  const seen = new Set();
  const unique = pool.filter((t) => !seen.has(t.videoId) && seen.add(t.videoId));
  let list = spreadByArtist(unique).slice(0, size);

  // 격한 곡을 섞는다.
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
    // 균등 간격으로 끼워넣어 몰리지 않게 한다.
    const step = Math.max(1, Math.floor(list.length / (picks.length + 1)));
    picks.forEach((t, i) => list.splice(Math.min(list.length, (i + 1) * step + i), 0, t));
  }

  return {
    tracks: list,
    summary: describe(answers, list),
    scenes: [...weight.keys()],
    minFocus,
  };
}

/** DJ가 결과를 소개하는 멘트 */
function describe(answers, tracks) {
  const sit = SITUATION[answers.situation] || SITUATION.calm;
  const plc = PLACE[answers.place] || PLACE.town;
  const spicy = tracks.filter((t) => t.spicy).length;
  const lines = [
    `${plc.word}에서 ${sit.tempoWord} 결로 ${tracks.length}곡 골랐어.`,
  ];
  if (spicy > 0) lines.push(`중간중간 확 끓는 곡 ${spicy}곡 섞어뒀으니까 놀라지 말고.`);
  if (answers.presence === 'bg') lines.push('있는 줄 모르게 깔아둘게. 일에 집중해.');
  else if (answers.presence === 'fore') lines.push('오늘은 음악도 좀 들어줘.');
  return lines.join(' ');
}

/** 질답 없이 바로 트는 기본값 — "일하며 틀어놓기" */
export const DEFAULT_ANSWERS = { situation: 'calm', place: 'nature', presence: 'bg', spice: 'none' };

/** DJ의 상황별 한마디 */
export const CHATTER = {
  greet: ['판 깔아뒀어. 뭐 틀어줄까?', '어서 와. 오늘도 일하러 온 거지?', '왔구나. 바늘 올려둘게.'],
  picking: ['음—— 잠깐만.', '레코드 뒤지는 중...', '이거 괜찮을 것 같은데.'],
  playing: ['자, 시작할게.', '바늘 내린다.', '좋아, 이 결이야.'],
  paused: ['잠깐 쉬어갈까.', '바늘 들어놨어.'],
  done: ['한 바퀴 다 돌았네. 더 틀까?', '리스트 끝났어. 새로 짤까?'],
};

export const pickChatter = (key) => {
  const arr = CHATTER[key] || CHATTER.greet;
  return arr[Math.floor(Math.random() * arr.length)];
};
