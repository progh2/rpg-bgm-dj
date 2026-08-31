// icons.js — 질답 선택지 아이콘. 폰트에 의존하지 않도록 전부 인라인 SVG로 그린다.
// 16x16 격자, stroke/fill 은 currentColor 를 따라 스킨 색과 함께 변한다.

const wrap = (inner) =>
  `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"
        fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const ICONS = {
  // 상황
  rush:    wrap('<path d="M9 1.5 3.5 9H7l-.5 5.5L12.5 7H9z" fill="currentColor" stroke="none"/>'),          // 번개 — 몰아치는
  calmSit: wrap('<path d="M2 11c2-2 4-2 6 0s4 2 6 0"/><path d="M2 7c2-2 4-2 6 0s4 2 6 0"/>'),               // 잔물결 — 차분히
  deep:    wrap('<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r=".9" fill="currentColor"/>'), // 과녁 — 몰입
  worn:    wrap('<path d="M13.5 9.6A5.5 5.5 0 0 1 6.4 2.5a5.5 5.5 0 1 0 7.1 7.1z" fill="currentColor" stroke="none"/>'),         // 초승달 — 지침

  // 장소
  town:    wrap('<path d="M2 7.5 8 2.5l6 5"/><path d="M3.5 7v6.5h9V7"/><path d="M6.5 13.5v-4h3v4"/>'),        // 집
  nature:  wrap('<path d="M1.5 13 6 5l2.6 4.4"/><path d="M7 13l3.5-6 4 6z"/>'),                              // 산
  ancient: wrap('<path d="M8 1.5 9.6 6l4.4 1.6L9.6 9.2 8 13.5 6.4 9.2 2 7.6 6.4 6z" fill="currentColor" stroke="none"/>'), // 반짝임
  indoor:  wrap('<path d="M8 14c2.8 0 5-1.8 5-4.2C13 6.5 8 2 8 2S3 6.5 3 9.8C3 12.2 5.2 14 8 14z" fill="currentColor" stroke="none"/>'), // 불꽃(난롯가)

  // 소리 존재감
  soft:    wrap('<circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/>'),
  mid:     wrap('<circle cx="8" cy="8" r="3.2" fill="currentColor" stroke="none"/>'),
  loud:    wrap('<circle cx="8" cy="8" r="5.2" fill="currentColor" stroke="none"/>'),

  // 격한 곡
  none:    wrap('<path d="M3 8h10"/>'),
  some:    wrap('<path d="M8 3.5 9 7l3.5 1-3.5 1L8 12.5 7 9 3.5 8 7 7z" fill="currentColor" stroke="none"/>'),
  lots:    wrap('<path d="M9 1.5 3.5 9H7l-.5 5.5L12.5 7H9z" fill="currentColor" stroke="none"/><path d="M14 2.5v3M14.5 8v1.5" stroke-width="1.2"/>'),

  // 기타
  again:   wrap('<path d="M13.5 8a5.5 5.5 0 1 1-1.7-4"/><path d="M13.8 1.5v3h-3"/>'),
};

export const icon = (key) => ICONS[key] || ICONS.calmSit;
