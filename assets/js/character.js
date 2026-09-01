// character.js — 무대에 선 바드.
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │ 나중에 그림으로 갈아 끼울 자리.                                          │
// │                                                                          │
// │ 지금은 SVG 로 그려 두었다. 외부 그림(제미나이 등)으로 바꾸려면            │
// │ bardArt() 가 돌려주는 내용만 <img> 나 <picture> 로 바꾸면 된다.           │
// │ 나머지 코드는 아래 규칙만 지키면 그대로 돌아간다.                        │
// │                                                                          │
// │   · 바깥 요소에 data-state 가 붙는다: idle | talk | dig | play           │
// │   · 색은 CSS 변수(--accent 계열)를 따르게 해 두면 장소·분위기와 함께 변한다│
// │   · 그림으로 바꾸면 상태별 파일을 두고 CSS 로 바꿔 끼우는 편이 간단하다   │
// └──────────────────────────────────────────────────────────────────────────┘

export const BARD_NAME = '음유시인 라온';
export const BARD_SHORT = '라온';

const INK = '#241a12';

export function bardArt() {
  return `
<svg class="bard-art" viewBox="0 0 240 260" role="img" aria-label="무대에 선 ${BARD_NAME}">
  <defs>
    <radialGradient id="bdGlow" cx="50%" cy="42%" r="60%">
      <stop offset="0%"   stop-color="var(--accent-glow)" stop-opacity=".45"/>
      <stop offset="62%"  stop-color="var(--accent)"      stop-opacity=".13"/>
      <stop offset="100%" stop-color="var(--accent)"      stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bdHair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--accent-glow)"/>
      <stop offset="58%"  stop-color="var(--accent)"/>
      <stop offset="100%" stop-color="var(--ember)"/>
    </linearGradient>
    <linearGradient id="bdCloak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--wood-light)"/>
      <stop offset="100%" stop-color="var(--wood-dark)"/>
    </linearGradient>
    <linearGradient id="bdLute" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="var(--wood-light)"/>
      <stop offset="100%" stop-color="var(--wood)"/>
    </linearGradient>
  </defs>

  <ellipse class="bd-glow" cx="120" cy="108" rx="102" ry="98" fill="url(#bdGlow)"/>

  <!-- 깃털 꽂은 모자 -->
  <g class="bd-hat">
    <path d="M60 74c8-24 30-38 60-38s52 14 60 38c-12-6-30-10-60-10s-48 4-60 10z"
          fill="url(#bdCloak)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <ellipse cx="120" cy="76" rx="66" ry="12" fill="url(#bdCloak)" stroke="${INK}" stroke-width="3.4"/>
    <path class="bd-feather" d="M172 52c14-12 28-14 34-8 5 5-2 16-14 24-9 6-18 8-22 6z"
          fill="var(--accent)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  </g>

  <!-- 머리카락 -->
  <path d="M70 84c0 30 4 44 10 54h80c6-10 10-24 10-54-12 8-30 12-50 12s-38-4-50-12z"
        fill="url(#bdHair)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>

  <!-- 목 -->
  <g class="bd-neck">
    <path d="M107 128v24c0 8 26 8 26 0v-24z" fill="#e8c4a4" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M107 128v12c5 5 21 5 26 0v-12z" fill="${INK}" opacity=".24"/>
  </g>

  <!-- 몸 / 여행자 외투 -->
  <g class="bd-body">
    <path d="M120 152c-32 0-54 15-60 36-3 10-4 20-4 28h128c0-8-1-18-4-28-6-21-28-36-60-36z"
          fill="url(#bdCloak)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <!-- 어깨 망토 -->
    <path d="M92 156c-10 5-16 14-18 24 10-6 20-9 30-10zM148 156c10 5 16 14 18 24-10-6-20-9-30-10z"
          fill="var(--accent)" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity=".9"/>
    <!-- 여밈 -->
    <circle cx="120" cy="168" r="6" fill="var(--metal)" stroke="${INK}" stroke-width="2.6"/>
    <path d="M120 176v34" stroke="${INK}" stroke-width="2.6" opacity=".45"/>
  </g>

  <!-- 얼굴 -->
  <g class="bd-head">
    <ellipse cx="120" cy="104" rx="46" ry="43" fill="#f7dcc4" stroke="${INK}" stroke-width="3.4"/>
    <!-- 앞머리 -->
    <path d="M76 96c0-28 20-46 44-46s44 18 44 46c-6-12-14-19-22-20-5 7-11 10-16 10-5 0-10-4-13-11-8 8-24 14-37 21z"
          fill="url(#bdHair)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <ellipse class="bd-blush" cx="93"  cy="116" rx="10" ry="6" fill="#e08a86" opacity=".5"/>
    <ellipse class="bd-blush" cx="147" cy="116" rx="10" ry="6" fill="#e08a86" opacity=".5"/>
    <g class="bd-eyes">
      <ellipse cx="101" cy="106" rx="9"  ry="11" fill="${INK}"/>
      <ellipse cx="139" cy="106" rx="9"  ry="11" fill="${INK}"/>
      <ellipse cx="101" cy="108" rx="6.4" ry="8" fill="var(--accent)"/>
      <ellipse cx="139" cy="108" rx="6.4" ry="8" fill="var(--accent)"/>
      <circle cx="104" cy="102" r="3.4" fill="#fff"/>
      <circle cx="142" cy="102" r="3.4" fill="#fff"/>
    </g>
    <g class="bd-eyes-closed">
      <path d="M92 106q9 -9 18 0"  stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M130 106q9 -9 18 0" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M92 88q9 -5 18 -1"  stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M130 87q9 -4 18 1"  stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".7"/>
    <path class="bd-mouth" d="M113 126q7 7 14 0" stroke="#9c5a52" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  </g>

  <!-- 류트 -->
  <g class="bd-lute">
    <!-- 울림통 -->
    <ellipse cx="150" cy="206" rx="40" ry="32" fill="url(#bdLute)" stroke="${INK}" stroke-width="3.4"/>
    <ellipse cx="150" cy="206" rx="11" ry="9" fill="var(--wood-dark)" stroke="${INK}" stroke-width="2.6"/>
    <!-- 목대 -->
    <path d="M116 190 66 152l10-13 50 38z" fill="url(#bdLute)" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M66 152l-12-9 8-11 13 8z" fill="var(--wood-dark)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <!-- 줄 -->
    <g class="bd-strings">
      <path d="M70 154l104 62" stroke="var(--metal)" stroke-width="1.4" opacity=".85"/>
      <path d="M74 149l104 62" stroke="var(--metal)" stroke-width="1.4" opacity=".85"/>
      <path d="M78 144l104 62" stroke="var(--metal)" stroke-width="1.4" opacity=".85"/>
    </g>
    <!-- 줄 뜯는 손 -->
    <g class="bd-hand">
      <circle cx="150" cy="222" r="10" fill="#f7dcc4" stroke="${INK}" stroke-width="3"/>
    </g>
  </g>

  <!-- 노랫가락 (연주 중에만) -->
  <g class="bd-notes" aria-hidden="true">
    <g class="bd-note bd-note-1"><path d="M0 0v-15l9-2v15" stroke="var(--accent-glow)" stroke-width="2.6" fill="none"/><ellipse cx="-3" cy="0" rx="4.4" ry="3.3" fill="var(--accent-glow)"/></g>
    <g class="bd-note bd-note-2"><path d="M0 0v-13l8-2v13" stroke="var(--accent)"      stroke-width="2.6" fill="none"/><ellipse cx="-2.7" cy="0" rx="4" ry="3" fill="var(--accent)"/></g>
    <g class="bd-note bd-note-3"><path d="M0 0v-17l10-2v17" stroke="var(--accent-glow)" stroke-width="2.6" fill="none"/><ellipse cx="-3.2" cy="0" rx="4.6" ry="3.5" fill="var(--accent-glow)"/></g>
  </g>
</svg>`;
}

/** 바드의 상태를 바꾼다. state: idle | talk | dig | play */
export function setBardState(root, state) {
  if (!root) return;
  root.dataset.state = state;
}
