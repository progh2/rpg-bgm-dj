// halls.js — 머무는 곳 7군데.
//
// 앞선 재생기의 '스킨'에 해당한다. 다만 바뀌는 것은 창틀이 아니라 **장소**다.
// 기둥에 쓴 나무, 벽을 쌓은 돌, 쇠장식과 나무 팻말의 색이 함께 움직인다.
// 장소가 가구의 성격을 정하고, 분위기(moods.js)가 그 위에 얹히는 불빛 색을 정한다.

export const HALLS = {
  oak_inn: {
    label: '참나무 여관',
    note: '기름 먹인 참나무와 놋쇠. 사람 냄새 나는 1층 홀',
    vars: {
      '--wood':       '#5a3a24',
      '--wood-light': '#9a6b45',
      '--wood-dark':  '#2c1a0f',
      '--stone':      '#6b5a48',
      '--stone-dark': '#3a3028',
      '--metal':      '#caa35e',
      '--metal-dark': '#6e5324',
      '--sign-bg':    '#402a17',
      '--sign-ink':   '#f3d9a4',
      '--sign-dim':   '#b0894f',
      '--beam':       'linear-gradient(180deg, #7a5030, #3e2513)',
      '--text':       '#f6e9d8',
      '--text-dim':   '#cbb094',
      '--page-bg':    '#33200f',
      '--flame':      '#ffb445',
      '--flame-low':  '#c25a12',
    },
  },
  stone_keep: {
    label: '돌 성채',
    note: '차게 식은 화강암과 무쇠. 길드 본관',
    vars: {
      '--wood':       '#4a4038',
      '--wood-light': '#7d7064',
      '--wood-dark':  '#25201b',
      '--stone':      '#6e6a62',
      '--stone-dark': '#3b3833',
      '--metal':      '#a9b0b8',
      '--metal-dark': '#5b6169',
      '--sign-bg':    '#33302b',
      '--sign-ink':   '#e6ecf2',
      '--sign-dim':   '#9aa2ab',
      '--beam':       'linear-gradient(180deg, #6b6157, #34302a)',
      '--text':       '#f0f1f3',
      '--text-dim':   '#bcc0c5',
      '--page-bg':    '#2e2b27',
      '--flame':      '#ffc06a',
      '--flame-low':  '#b8621c',
    },
  },
  cellar: {
    label: '지하 술집',
    note: '눅눅한 벽돌과 술통. 촛불 하나로 버티는 방',
    vars: {
      '--wood':       '#452a20',
      '--wood-light': '#7d4e37',
      '--wood-dark':  '#22130d',
      '--stone':      '#4e3b31',
      '--stone-dark': '#2b201a',
      '--metal':      '#b08b4a',
      '--metal-dark': '#5c451f',
      '--sign-bg':    '#3a2416',
      '--sign-ink':   '#f0c98c',
      '--sign-dim':   '#a87f47',
      '--beam':       'linear-gradient(180deg, #633d29, #2e1a11)',
      '--text':       '#f2ddc4',
      '--text-dim':   '#c2a180',
      '--page-bg':    '#281710',
      '--flame':      '#ff9e3c',
      '--flame-low':  '#b04a10',
    },
  },
  greenwood: {
    label: '숲속 야영지',
    note: '이끼 낀 통나무와 젖은 흙. 하늘이 천장',
    vars: {
      '--wood':       '#42402a',
      '--wood-light': '#7c7a4e',
      '--wood-dark':  '#1f1e13',
      '--stone':      '#565c46',
      '--stone-dark': '#2f3327',
      '--metal':      '#b6a86a',
      '--metal-dark': '#5f5730',
      '--sign-bg':    '#333520',
      '--sign-ink':   '#e8f0c4',
      '--sign-dim':   '#a3ac78',
      '--beam':       'linear-gradient(180deg, #5d5c39, #2b2a1a)',
      '--text':       '#eef3de',
      '--text-dim':   '#b9c29c',
      '--page-bg':    '#262a1b',
      '--flame':      '#ffc45c',
      '--flame-low':  '#bf6a18',
    },
  },
  arcanum: {
    label: '마법사의 탑',
    note: '별빛 먹인 흑단과 은. 책이 벽을 이룬 방',
    vars: {
      '--wood':       '#3a2f4e',
      '--wood-light': '#6d5b8c',
      '--wood-dark':  '#1c1628',
      '--stone':      '#4b4266',
      '--stone-dark': '#2a2439',
      '--metal':      '#b6a6dc',
      '--metal-dark': '#5c5080',
      '--sign-bg':    '#2e2540',
      '--sign-ink':   '#e6dbff',
      '--sign-dim':   '#a495cc',
      '--beam':       'linear-gradient(180deg, #52426e, #241d33)',
      '--text':       '#f0e9ff',
      '--text-dim':   '#c0b3dd',
      '--page-bg':    '#241d33',
      '--flame':      '#c9a6ff',
      '--flame-low':  '#7a44c8',
    },
  },
  frost_hold: {
    label: '얼음 요새',
    note: '서릿발 선 청석과 강철. 숨이 하얗게 나오는 홀',
    vars: {
      '--wood':       '#2f4453',
      '--wood-light': '#5e829a',
      '--wood-dark':  '#16232c',
      '--stone':      '#456070',
      '--stone-dark': '#25353f',
      '--metal':      '#a8cadb',
      '--metal-dark': '#4f7186',
      '--sign-bg':    '#243943',
      '--sign-ink':   '#e2f4ff',
      '--sign-dim':   '#96b8c9',
      '--beam':       'linear-gradient(180deg, '
                      + '#3f5c6e, #1c2b34)',
      '--text':       '#eaf6ff',
      '--text-dim':   '#aec6d4',
      '--page-bg':    '#1e2e37',
      '--flame':      '#9fd8ff',
      '--flame-low':  '#3a7fc4',
    },
  },
  ruin: {
    label: '무너진 신전',
    note: '금 간 사암과 삭은 나무. 바람이 지나는 자리',
    vars: {
      '--wood':       '#5c4a34',
      '--wood-light': '#977c56',
      '--wood-dark':  '#2e2418',
      '--stone':      '#7a6a52',
      '--stone-dark': '#453c2e',
      '--metal':      '#c2ae7e',
      '--metal-dark': '#6b5c3a',
      '--sign-bg':    '#453620',
      '--sign-ink':   '#f4e3bd',
      '--sign-dim':   '#b39a68',
      '--beam':       'linear-gradient(180deg, #7a6444, #372c1c)',
      '--text':       '#f5ecda',
      '--text-dim':   '#c8b795',
      '--page-bg':    '#382d1e',
      '--flame':      '#ffcf7a',
      '--flame-low':  '#c07a24',
    },
  },
};

/** 분위기가 장소를 자동으로 고를 때 쓰는 매핑 */
export const MOOD_HALL = {
  calm: 'oak_inn',     pastoral: 'greenwood', wonder: 'arcanum',  tender: 'oak_inn',
  sorrow: 'ruin',      noble: 'stone_keep',   dread: 'cellar',    ember: 'cellar',
  frost: 'frost_hold', merry: 'oak_inn',
};

const STORE = 'rpgbgm.hall';

export function loadHallPref() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return { id: 'oak_inn', locked: false };
    const p = JSON.parse(raw);
    return { id: HALLS[p.id] ? p.id : 'oak_inn', locked: !!p.locked };
  } catch { return { id: 'oak_inn', locked: false }; }
}

export function saveHallPref(pref) {
  try { localStorage.setItem(STORE, JSON.stringify(pref)); } catch { /* 사생활 보호 모드 */ }
}

/** 장소 + 분위기를 :root 커스텀 프로퍼티로 적용 */
export function applyHall(hallId, mood) {
  const hall = HALLS[hallId] || HALLS.oak_inn;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(hall.vars)) root.style.setProperty(k, v);
  if (mood) {
    root.style.setProperty('--accent', mood.accent);
    root.style.setProperty('--accent-deep', mood.deep);
    root.style.setProperty('--accent-glow', mood.glow);
    root.style.setProperty('--ember', mood.record);
  }
  root.dataset.hall = hallId;
}
