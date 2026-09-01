// roast.js — 화로에 걸어 두는 것들.
//
// 아무것도 없다가, 누군가 뭔가를 걸어 두고, 익고, 안 먹으면 타고, 다시 빈다.
// 재생과는 아무 상관이 없다. 곁눈으로 보다가 "어, 익었네" 하고 눌러 먹으라고 둔 것이다.
//
// 익은 정도는 그림을 여러 장 두지 않고 **CSS 필터 하나로** 낸다.
//   설익음  → 색이 옅고 창백
//   익는 중 → 제 색
//   다 익음 → 노릇하게 (살짝 발광)
//   타 버림 → 검게 그을림
// 그림 한 장으로 네 단계를 내니 SVG 를 네 벌 그릴 일이 없다.

const INK = '#241a12';

/** 화로에 걸릴 수 있는 것들. weight 가 클수록 자주 나온다. */
export const DISHES = {
  none: {
    label: '빈 화로', weight: 3, eatable: false,
    done: '장작만 타고 있습니다.',
    art: '',
  },

  skewer: {
    label: '고기 꼬치', weight: 5, eatable: true,
    raw: '아직 붉습니다. 좀 더 두시지요.',
    cooking: '기름이 떨어지기 시작했습니다.',
    done: '잘 익었습니다. 드십시오.',
    burnt: '아이고, 태워 먹었군요.',
    eaten: '잘 드셨습니까. 또 걸어 두겠습니다.',
    art: `
      <g class="dish-art">
        <path d="M8 30h84" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
        <ellipse cx="30" cy="30" rx="12" ry="9.5" fill="#b5502c" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="50" cy="30" rx="12" ry="9.5" fill="#c25c33" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="70" cy="30" rx="12" ry="9.5" fill="#b5502c" stroke="${INK}" stroke-width="3"/>
        <path d="M24 27q6 -3 12 0M44 27q6 -3 12 0M64 27q6 -3 12 0" stroke="#e08a52" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>`,
  },

  pig: {
    label: '돼지 통구이', weight: 2, eatable: true,
    raw: '이제 막 얹었습니다. 한참 걸립니다.',
    cooking: '껍질이 부풀어 오릅니다.',
    done: '통째로 다 익었습니다. 홀이 다 냄새납니다.',
    burnt: '겉이 새까맣게 탔습니다…',
    eaten: '한 마리를 다 드시다니.',
    art: `
      <g class="dish-art">
        <path d="M4 30h92" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
        <ellipse cx="50" cy="29" rx="30" ry="15" fill="#c9764a" stroke="${INK}" stroke-width="3.2"/>
        <ellipse cx="24" cy="27" rx="9" ry="7.5" fill="#c9764a" stroke="${INK}" stroke-width="3"/>
        <circle cx="19" cy="27" r="2.4" fill="${INK}"/>
        <path d="M22 21l-3-5 6 1z" fill="#c9764a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M74 24q8 -6 6 -12" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <path d="M38 40l-3 6M52 41l-2 6M64 39l3 6" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M36 24q10 -4 22 0" stroke="#e39a6a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      </g>`,
  },

  cauldron: {
    label: '마법의 냄비', weight: 4, eatable: true,
    raw: '아직 미지근합니다.',
    cooking: '가장자리가 보글거립니다.',
    done: '푹 끓었습니다. 한 국자 뜨시지요.',
    burnt: '바닥이 눌어붙었습니다.',
    eaten: '속이 든든하시겠습니다.',
    art: `
      <g class="dish-art">
        <path d="M20 14h60" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <path d="M32 14v6M68 14v6" stroke="${INK}" stroke-width="2.6"/>
        <path d="M22 20h56l-5 22a10 10 0 0 1-10 8H37a10 10 0 0 1-10-8z"
              fill="#4a4655" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
        <ellipse cx="50" cy="21" rx="28" ry="6" fill="#6f6a80" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="50" cy="21" rx="22" ry="4" fill="var(--accent)" opacity=".85"/>
        <circle class="bub bub1" cx="42" cy="20" r="3" fill="var(--accent-glow)"/>
        <circle class="bub bub2" cx="54" cy="21" r="2.2" fill="var(--accent-glow)"/>
        <circle class="bub bub3" cx="60" cy="19" r="2.6" fill="var(--accent-glow)"/>
      </g>`,
  },

  marshmallow: {
    label: '마시멜로', weight: 4, eatable: true,
    raw: '아직 하얗습니다.',
    cooking: '겉이 노릇해집니다.',
    done: '겉은 바삭, 속은 흐물. 지금입니다.',
    burnt: '불이 붙었다가 꺼졌습니다.',
    eaten: '손이 끈적하시겠습니다.',
    art: `
      <g class="dish-art">
        <path d="M8 44 46 26" stroke="#8a6a44" stroke-width="3.4" stroke-linecap="round"/>
        <rect x="42" y="17" width="18" height="20" rx="5" fill="#f0e0c8" stroke="${INK}" stroke-width="3"/>
        <rect x="59" y="21" width="16" height="18" rx="5" fill="#f0e0c8" stroke="${INK}" stroke-width="3"/>
        <path d="M46 22q6 -2 10 0" stroke="#d8bd97" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </g>`,
  },

  corn: {
    label: '감자와 옥수수', weight: 5, eatable: true,
    raw: '재에 막 묻었습니다.',
    cooking: '껍질이 갈라집니다.',
    done: '알맞게 구워졌습니다.',
    burnt: '숯이 되었습니다.',
    eaten: '소박한 게 제일이지요.',
    art: `
      <g class="dish-art">
        <ellipse cx="30" cy="34" rx="15" ry="11" fill="#a9793f" stroke="${INK}" stroke-width="3"/>
        <path d="M22 31q8 -4 16 0" stroke="#7d5628" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M62 20q9 0 9 15t-9 15-9-15 9-15z" fill="#e2b747" stroke="${INK}" stroke-width="3"/>
        <path d="M58 24v22M66 24v22M62 22v26" stroke="#a8842c" stroke-width="1.8"/>
        <path d="M70 22q10 -6 16 -2-4 8-14 10z" fill="#8aa653" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
      </g>`,
  },

  fish: {
    label: '민물고기', weight: 3, eatable: true,
    raw: '방금 잡아 왔습니다.',
    cooking: '비늘이 오그라듭니다.',
    done: '고소하게 익었습니다.',
    burnt: '꼬리가 사라졌습니다.',
    eaten: '가시 조심하십시오.',
    art: `
      <g class="dish-art">
        <path d="M6 44 56 24" stroke="#8a6a44" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M38 30q12 -12 26 -6 6 3 6 8t-6 8q-14 6-26-10z" fill="#8fa8b8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M36 31l-9-7v16z" fill="#8fa8b8" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
        <circle cx="62" cy="28" r="2.4" fill="${INK}"/>
        <path d="M46 26q6 4 12 2" stroke="#6d8494" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </g>`,
  },
};

/** 익는 단계와 머무는 시간(ms) */
export const STAGES = [
  { id: 'raw',     label: '설익음',  ms: 22_000 },
  { id: 'cooking', label: '익는 중', ms: 26_000 },
  { id: 'done',    label: '다 익음', ms: 55_000 },
  { id: 'burnt',   label: '탐',      ms: 20_000 },
];

const EMPTY_MS = 14_000;   // 빈 화로로 두는 시간

function pickDish(exclude) {
  const pool = [];
  for (const [id, d] of Object.entries(DISHES)) {
    if (id === exclude) continue;
    for (let i = 0; i < d.weight; i++) pool.push(id);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 화로 위 요리를 굴린다.
 * @param {object} o
 * @param {HTMLElement} o.slot   그림이 들어갈 자리
 * @param {(dish,stage)=>void} o.onChange  걸리거나 익거나 탈 때
 * @param {()=>void} o.onSizzle  지글거릴 때 (소리용)
 */
export function startRoast({ slot, onChange, onSizzle }) {
  let dishId = 'none';
  let stageIdx = 0;
  let timer = null;

  function render() {
    const dish = DISHES[dishId];
    const stage = STAGES[stageIdx];
    slot.innerHTML = dish.art
      ? `<svg viewBox="0 0 100 56" class="dish" aria-hidden="true">${dish.art}</svg>` : '';
    slot.dataset.stage = dish.art ? stage.id : 'none';
    slot.dataset.dish = dishId;
    onChange?.(dish, dish.art ? stage : null);
  }

  function schedule(ms, fn) { clearTimeout(timer); timer = setTimeout(fn, ms); }

  function toEmpty(delay = EMPTY_MS) {
    dishId = 'none';
    stageIdx = 0;
    render();
    schedule(delay, serve);
  }

  function serve() {
    dishId = pickDish('none');
    if (dishId === 'none') { toEmpty(); return; }
    stageIdx = 0;
    render();
    advance();
  }

  function advance() {
    schedule(STAGES[stageIdx].ms, () => {
      if (stageIdx >= STAGES.length - 1) { toEmpty(); return; }
      stageIdx += 1;
      if (STAGES[stageIdx].id === 'cooking' || STAGES[stageIdx].id === 'done') onSizzle?.();
      render();
      advance();
    });
  }

  /** 눌렀을 때. 먹었으면 true. */
  function bite() {
    const dish = DISHES[dishId];
    const stage = STAGES[stageIdx];
    if (!dish.art || !dish.eatable) return { ate: false, id: dishId, dish, stage: null };
    // 설익어도 익어도 탄 것도 먹을 수는 있다. 다만 말이 달라진다.
    const ate = true;
    const id = dishId;
    toEmpty(9_000);
    return { ate, id, dish, stage };
  }

  /** 지금 상태 */
  const peek = () => ({ id: dishId, dish: DISHES[dishId], stage: DISHES[dishId].art ? STAGES[stageIdx] : null });

  function stop() { clearTimeout(timer); }

  // 처음에는 빈 화로에서 시작해 곧 뭔가 걸린다
  toEmpty(6_000);

  return { bite, peek, stop };
}
