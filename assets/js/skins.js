// skins.js — 교체 가능한 스킨 (issue #2)
// 스킨은 재생기 '크롬'(창틀·버튼·LCD)의 성격을 정하고,
// 무드는 강조색을 정한다. 둘은 CSS 커스텀 프로퍼티로 합쳐진다.

export const SKINS = {
  classic: {
    label: 'Classic',
    note: '윈앰프 2.x 회색 크롬 + 녹색 LCD',
    vars: {
      '--chrome':        '#3b3b47',
      '--chrome-light':  '#6e6e80',
      '--chrome-dark':   '#1a1a20',
      '--chrome-face':   '#4a4a58',
      '--lcd-bg':        '#0b1410',
      '--lcd-ink':       '#25f07a',
      '--lcd-dim':       '#0f6d3a',
      '--title-bar':     'linear-gradient(180deg,#5c5c6e,#31313c)',
      '--text':          '#d8d8e2',
      '--text-dim':      '#8b8b9c',
      '--page-bg':       '#14141a',
      '--font-lcd':      '"DungGeunMo", "Courier New", monospace',
    },
  },
  crystal: {
    label: 'Crystal',
    note: '얼음빛 유리 크롬',
    vars: {
      '--chrome':        '#27455c',
      '--chrome-light':  '#5e93b8',
      '--chrome-dark':   '#0f2231',
      '--chrome-face':   '#2f5573',
      '--lcd-bg':        '#04161f',
      '--lcd-ink':       '#6fe6ff',
      '--lcd-dim':       '#1d6e88',
      '--title-bar':     'linear-gradient(180deg,#4d84a8,#20415a)',
      '--text':          '#dcefff',
      '--text-dim':      '#7fa6bd',
      '--page-bg':       '#0a1620',
      '--font-lcd':      '"DungGeunMo", "Courier New", monospace',
    },
  },
  ember: {
    label: 'Ember',
    note: '식어가는 잿불',
    vars: {
      '--chrome':        '#4a2b24',
      '--chrome-light':  '#8a5344',
      '--chrome-dark':   '#221010',
      '--chrome-face':   '#5c352c',
      '--lcd-bg':        '#1c0806',
      '--lcd-ink':       '#ff9d5c',
      '--lcd-dim':       '#8f4620',
      '--title-bar':     'linear-gradient(180deg,#7d4835,#3d2018)',
      '--text':          '#f4dcd0',
      '--text-dim':      '#b08b7a',
      '--page-bg':       '#1a0e0a',
      '--font-lcd':      '"DungGeunMo", "Courier New", monospace',
    },
  },
  verdant: {
    label: 'Verdant',
    note: '이끼 낀 숲의 놋쇠',
    vars: {
      '--chrome':        '#2f4230',
      '--chrome-light':  '#6b8f5e',
      '--chrome-dark':   '#152016',
      '--chrome-face':   '#3b533b',
      '--lcd-bg':        '#0a1608',
      '--lcd-ink':       '#b6f06a',
      '--lcd-dim':       '#4d7a2a',
      '--title-bar':     'linear-gradient(180deg,#5b7f52,#2a3d29)',
      '--text':          '#e0f0d8',
      '--text-dim':      '#8fa886',
      '--page-bg':       '#101a10',
      '--font-lcd':      '"DungGeunMo", "Courier New", monospace',
    },
  },
  arcane: {
    label: 'Arcane',
    note: '고대 마법진의 보랏빛',
    vars: {
      '--chrome':        '#3a2b52',
      '--chrome-light':  '#7a63a8',
      '--chrome-dark':   '#1a1229',
      '--chrome-face':   '#473564',
      '--lcd-bg':        '#120a1f',
      '--lcd-ink':       '#d09dff',
      '--lcd-dim':       '#6a3f9c',
      '--title-bar':     'linear-gradient(180deg,#634991,#2f2247)',
      '--text':          '#ebdcff',
      '--text-dim':      '#9d8bbd',
      '--page-bg':       '#150e24',
      '--font-lcd':      '"DungGeunMo", "Courier New", monospace',
    },
  },
  sepia: {
    label: 'Sepia',
    note: '누렇게 바랜 설명서',
    vars: {
      '--chrome':        '#5b4a35',
      '--chrome-light':  '#a08a67',
      '--chrome-dark':   '#2e2418',
      '--chrome-face':   '#6b5941',
      '--lcd-bg':        '#231a10',
      '--lcd-ink':       '#f2cf94',
      '--lcd-dim':       '#8c6c3c',
      '--title-bar':     'linear-gradient(180deg,#8a7352,#4a3c29)',
      '--text':          '#f0e2c8',
      '--text-dim':      '#b3a184',
      '--page-bg':       '#1e180f',
      '--font-lcd':      '"DungGeunMo", "Courier New", monospace',
    },
  },
  mono: {
    label: 'Mono',
    note: '흑백 브라운관',
    vars: {
      '--chrome':        '#2b2b2b',
      '--chrome-light':  '#666',
      '--chrome-dark':   '#111',
      '--chrome-face':   '#383838',
      '--lcd-bg':        '#0a0a0a',
      '--lcd-ink':       '#e6e6e6',
      '--lcd-dim':       '#6d6d6d',
      '--title-bar':     'linear-gradient(180deg,#525252,#252525)',
      '--text':          '#dcdcdc',
      '--text-dim':      '#8c8c8c',
      '--page-bg':       '#0e0e0e',
      '--font-lcd':      '"DungGeunMo", "Courier New", monospace',
    },
  },
};

/** 무드가 스킨을 자동 선택할 때 쓰는 매핑 */
export const MOOD_SKIN = {
  calm: 'crystal',  pastoral: 'verdant', wonder: 'arcane', tender: 'sepia',
  sorrow: 'crystal', noble: 'sepia',     dread: 'arcane',  ember: 'ember',
  frost: 'crystal',  merry: 'classic',
};

const STORE = 'rpgbgm.skin';

export function loadSkinPref() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return { id: 'classic', locked: false };
    const p = JSON.parse(raw);
    return { id: SKINS[p.id] ? p.id : 'classic', locked: !!p.locked };
  } catch { return { id: 'classic', locked: false }; }
}

export function saveSkinPref(pref) {
  try { localStorage.setItem(STORE, JSON.stringify(pref)); } catch { /* private mode */ }
}

/** 스킨 + 무드를 :root 커스텀 프로퍼티로 적용 */
export function applyTheme(skinId, mood) {
  const skin = SKINS[skinId] || SKINS.classic;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(skin.vars)) root.style.setProperty(k, v);
  if (mood) {
    root.style.setProperty('--accent', mood.accent);
    root.style.setProperty('--accent-deep', mood.deep);
    root.style.setProperty('--accent-glow', mood.glow);
    root.style.setProperty('--record', mood.record);
  }
  root.dataset.skin = skinId;
}
