// skins.js — 교체 가능한 스킨 (issue #2)
// 스킨은 재생기 '크롬'(창틀·버튼·LCD)의 성격을 정하고,
// 무드는 강조색을 정한다. 둘은 CSS 커스텀 프로퍼티로 합쳐진다.

export const SKINS = {
  classic: {
    label: 'Classic',
    note: '윈앰프 2.x 회색 크롬 + 녹색 LCD',
    vars: {
      '--chrome':        '#565667',
      '--chrome-light':  '#9292a8',
      '--chrome-dark':   '#2a2a34',
      '--chrome-face':   '#66667a',
      '--lcd-bg':        '#16261d',
      '--lcd-ink':       '#4dff9b',
      '--lcd-dim':       '#2da05e',
      '--title-bar':     'linear-gradient(180deg,#7d7d94,#4a4a5a)',
      '--text':          '#f0f0f6',
      '--text-dim':      '#d1d1d8',
      '--page-bg':       '#3a3a49',
      '--font-lcd':      '"Galmuri11", "Courier New", monospace',
    },
  },
  crystal: {
    label: 'Crystal',
    note: '얼음빛 유리 크롬',
    vars: {
      '--chrome':        '#37627f',
      '--chrome-light':  '#84bcdc',
      '--chrome-dark':   '#1b3648',
      '--chrome-face':   '#437596',
      '--lcd-bg':        '#0c2a39',
      '--lcd-ink':       '#8df0ff',
      '--lcd-dim':       '#3e9ab8',
      '--title-bar':     'linear-gradient(180deg,#6ba9cc,#2e5b78)',
      '--text':          '#eaf7ff',
      '--text-dim':      '#cbdce9',
      '--page-bg':       '#22475d',
      '--font-lcd':      '"Galmuri11", "Courier New", monospace',
    },
  },
  ember: {
    label: 'Ember',
    note: '식어가는 잿불',
    vars: {
      '--chrome':        '#6b4038',
      '--chrome-light':  '#b87965',
      '--chrome-dark':   '#39201a',
      '--chrome-face':   '#7f4f43',
      '--lcd-bg':        '#2e1410',
      '--lcd-ink':       '#ffb987',
      '--lcd-dim':       '#c37144',
      '--title-bar':     'linear-gradient(180deg,#a4674f,#5a3228)',
      '--text':          '#fceadf',
      '--text-dim':      '#d7b8a7',
      '--page-bg':       '#452317',
      '--font-lcd':      '"Galmuri11", "Courier New", monospace',
    },
  },
  verdant: {
    label: 'Verdant',
    note: '이끼 낀 숲의 놋쇠',
    vars: {
      '--chrome':        '#455f45',
      '--chrome-light':  '#8fb87f',
      '--chrome-dark':   '#22331f',
      '--chrome-face':   '#537152',
      '--lcd-bg':        '#132612',
      '--lcd-ink':       '#cdff8b',
      '--lcd-dim':       '#6ba33f',
      '--title-bar':     'linear-gradient(180deg,#78a06c,#3a533a)',
      '--text':          '#eefae6',
      '--text-dim':      '#c7d8be',
      '--page-bg':       '#2a4327',
      '--font-lcd':      '"Galmuri11", "Courier New", monospace',
    },
  },
  arcane: {
    label: 'Arcane',
    note: '고대 마법진의 보랏빛',
    vars: {
      '--chrome':        '#52406f',
      '--chrome-light':  '#a48ccd',
      '--chrome-dark':   '#2a1e42',
      '--chrome-face':   '#614c84',
      '--lcd-bg':        '#22143a',
      '--lcd-ink':       '#e0b9ff',
      '--lcd-dim':       '#9e74c9',
      '--title-bar':     'linear-gradient(180deg,#83679f,#413060)',
      '--text':          '#f4ebff',
      '--text-dim':      '#c5b3dc',
      '--page-bg':       '#372754',
      '--font-lcd':      '"Galmuri11", "Courier New", monospace',
    },
  },
  sepia: {
    label: 'Sepia',
    note: '누렇게 바랜 설명서',
    vars: {
      '--chrome':        '#77613f',
      '--chrome-light':  '#c4ac81',
      '--chrome-dark':   '#3f3220',
      '--chrome-face':   '#8a7250',
      '--lcd-bg':        '#2e2214',
      '--lcd-ink':       '#ffe0aa',
      '--lcd-dim':       '#b08c4e',
      '--title-bar':     'linear-gradient(180deg,#a68a63,#5c4a31)',
      '--text':          '#fbf0dc',
      '--text-dim':      '#eee3d7',
      '--page-bg':       '#45351d',
      '--font-lcd':      '"Galmuri11", "Courier New", monospace',
    },
  },
  mono: {
    label: 'Mono',
    note: '흑백 브라운관',
    vars: {
      '--chrome':        '#4a4a4a',
      '--chrome-light':  '#8f8f8f',
      '--chrome-dark':   '#242424',
      '--chrome-face':   '#5a5a5a',
      '--lcd-bg':        '#1c1c1c',
      '--lcd-ink':       '#f5f5f5',
      '--lcd-dim':       '#9a9a9a',
      '--title-bar':     'linear-gradient(180deg,#767676,#3d3d3d)',
      '--text':          '#f2f2f2',
      '--text-dim':      '#bbbbbb',
      '--page-bg':       '#3a3a3a',
      '--font-lcd':      '"Galmuri11", "Courier New", monospace',
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
