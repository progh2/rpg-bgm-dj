// hearth.js — 시각에 따라 홀의 밝기와 화롯불을 정한다.
//
// 낮에는 창으로 볕이 들어 불을 크게 지필 일이 없고, 해가 지면 화로에 장작을 더 넣는다.
// 바뀌는 것은 두 가지다.
//
//   --night   0(한낮) ~ 1(한밤).  홀 가장자리의 어둠과 불빛의 세기를 정한다.
//   data-lit  화로에 불이 붙어 있는가. 끄면 잉걸만 남는다.
//
// **글자와 가구는 어둡게 하지 않는다.** 이 재생기는 새벽에 켜 두고 일하는 쓰임이라,
// 분위기를 낸다고 읽기 어렵게 만들면 앞뒤가 바뀐다. 어두워지는 것은 벽과 홀 가장자리뿐이고,
// 나무 팻말과 곡목의 대비는 언제나 그대로 둔다.

export const PHASES = [
  { id: 'deep_night', label: '깊은 밤',   from: 0,  night: 1.00, lit: true,  greet: '이 시간까지 깨어 계셨습니까. 불은 꺼뜨리지 않았습니다.' },
  { id: 'dawn',       label: '동트기 전', from: 5,  night: 0.62, lit: true,  greet: '곧 해가 뜹니다. 한 곡 더 하고 눈 좀 붙이시지요.' },
  { id: 'morning',    label: '아침',      from: 8,  night: 0.18, lit: false, greet: '좋은 아침입니다. 오늘 몫의 일이 기다리고 있겠군요.' },
  { id: 'day',        label: '한낮',      from: 11, night: 0.00, lit: false, greet: '볕이 좋습니다. 창가 자리가 비어 있습니다.' },
  { id: 'dusk',       label: '해질녘',    from: 16, night: 0.24, lit: false, greet: '해가 기웁니다. 슬슬 화로에 불을 지필까요.' },
  { id: 'evening',    label: '저녁',      from: 19, night: 0.72, lit: true,  greet: '저녁입니다. 자리 잡으시면 한 곡 뽑아 드리지요.' },
  { id: 'night',      label: '밤',        from: 22, night: 0.92, lit: true,  greet: '늦은 시각이군요. 조용한 걸로 골라 드리겠습니다.' },
];

export function phaseFor(date = new Date()) {
  const h = date.getHours();
  let cur = PHASES[0];
  for (const p of PHASES) if (h >= p.from) cur = p;
  return cur;
}

let manual = null;          // 사용자가 직접 고른 시간대 (null = 실제 시각 따름)
let timer = null;

/** 홀에 조명을 적용한다. */
export function applyLight(phase) {
  const root = document.documentElement;
  root.style.setProperty('--night', String(phase.night));
  root.dataset.lit = String(phase.lit);
  root.dataset.phase = phase.id;
}

export function currentPhase() {
  return manual || phaseFor();
}

/** 사용자가 시간대를 직접 고른다. null 이면 실제 시각으로 되돌린다. */
export function setPhase(id) {
  manual = id ? PHASES.find((p) => p.id === id) || null : null;
  applyLight(currentPhase());
  return currentPhase();
}

/**
 * 조명을 켜고, 시각이 바뀌면 따라가게 한다.
 * @param {(p:object)=>void} onChange 시간대가 바뀔 때 부른다
 */
export function startLight(onChange) {
  applyLight(currentPhase());
  let last = currentPhase().id;
  clearInterval(timer);
  timer = setInterval(() => {
    if (manual) return;                 // 직접 고른 동안에는 건드리지 않는다
    const p = phaseFor();
    if (p.id !== last) { last = p.id; applyLight(p); onChange?.(p); }
  }, 60_000);
  return currentPhase();
}
