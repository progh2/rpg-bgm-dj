// icons.js — 문답 선택지에 붙는 그림. 글꼴에 기대지 않도록 전부 인라인 SVG 로 그린다.
// 16x16 격자, currentColor 를 따르므로 장소·분위기 색과 함께 변한다.

const wrap = (inner) =>
  `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"
        fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const ICONS = {
  // 볼일
  rush:    wrap('<path d="M8.5 1.5 3.5 8.5H7l-.5 6L12.5 7H9z" fill="currentColor" stroke="none"/>'),      // 번개 — 쫓기는 몸
  calm:    wrap('<path d="M2 11c2-2 4-2 6 0s4 2 6 0"/><path d="M2 7c2-2 4-2 6 0s4 2 6 0"/>'),             // 잔물결
  deep:    wrap('<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r=".9" fill="currentColor"/>'),
  worn:    wrap('<path d="M13.5 9.6A5.5 5.5 0 0 1 6.4 2.5a5.5 5.5 0 1 0 7.1 7.1z" fill="currentColor" stroke="none"/>'), // 초승달

  // 풍경
  town:    wrap('<path d="M2 7.5 8 2.5l6 5"/><path d="M3.5 7v6.5h9V7"/><path d="M6.5 13.5v-4h3v4"/>'),      // 집
  nature:  wrap('<path d="M1.5 13 6 5l2.6 4.4"/><path d="M7 13l3.5-6 4 6z"/>'),                            // 산
  ancient: wrap('<path d="M3 13.5V6l5-3.5L13 6v7.5"/><path d="M6 13.5V9h4v4.5"/><path d="M1.5 13.5h13"/>'), // 신전
  hearth:  wrap('<path d="M8 14c2.8 0 5-1.8 5-4.2C13 6.5 8 2 8 2S3 6.5 3 9.8C3 12.2 5.2 14 8 14z" fill="currentColor" stroke="none"/>'), // 불꽃

  // 노래 크기
  soft:    wrap('<circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/>'),
  mid:     wrap('<circle cx="8" cy="8" r="3.2" fill="currentColor" stroke="none"/>'),
  loud:    wrap('<circle cx="8" cy="8" r="5.2" fill="currentColor" stroke="none"/>'),

  // 칼 부딪는 노래
  none:    wrap('<path d="M3 8h10"/>'),
  some:    wrap('<path d="M8 3 9 6.8l3.6 1.2L9 9.2 8 13 7 9.2 3.4 8 7 6.8z" fill="currentColor" stroke="none"/>'),
  lots:    wrap('<path d="M2.5 2.5 9 9M13.5 2.5 7 9"/><path d="M5.5 13.5 9 10M10.5 13.5 7 10"/><path d="M1.5 4.5h2v-2M14.5 4.5h-2v-2"/>'), // 교차한 검

  // 그 밖
  again:   wrap('<path d="M13.5 8a5.5 5.5 0 1 1-1.7-4"/><path d="M13.8 1.5v3h-3"/>'),
};

export const icon = (key) => ICONS[key] || ICONS.calm;
