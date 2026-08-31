// character.js — 치비 DJ 캐릭터 (issue #3)
// 순수 SVG. 색은 CSS 커스텀 프로퍼티를 참조하므로 스킨/무드에 따라 함께 변한다.
// 상태: idle | talk | dig | groove

export const DJ_NAME = '노이즈';

const INK = '#221a2e';

export function djSvg() {
  return `
<svg class="dj-art" viewBox="0 0 240 250" role="img" aria-label="치비 DJ 캐릭터 ${DJ_NAME}">
  <defs>
    <radialGradient id="djGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%"   stop-color="var(--accent-glow)" stop-opacity=".5"/>
      <stop offset="65%"  stop-color="var(--accent)"      stop-opacity=".14"/>
      <stop offset="100%" stop-color="var(--accent)"      stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="djHair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--accent-glow)"/>
      <stop offset="58%"  stop-color="var(--accent)"/>
      <stop offset="100%" stop-color="var(--record)"/>
    </linearGradient>
    <linearGradient id="djHood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--chrome-light)"/>
      <stop offset="100%" stop-color="var(--chrome)"/>
    </linearGradient>
    <linearGradient id="djDeck" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--chrome-face)"/>
      <stop offset="100%" stop-color="var(--chrome-dark)"/>
    </linearGradient>
  </defs>

  <ellipse class="dj-glow" cx="120" cy="104" rx="104" ry="100" fill="url(#djGlow)"/>

  <!-- ================= 트윈테일 (얼굴 뒤, 좌우로 확실히 벌어지게) ================= -->
  <g class="dj-tail dj-tail-l">
    <path d="M62 74c-20 4-34 24-38 50-4 26 2 50 12 66 4 7 14 6 15-2 2-16-2-32-2-48 0-18 6-34 17-46 6-7 4-21-4-20z"
          fill="url(#djHair)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <circle cx="64" cy="76" r="12" fill="var(--chrome-face)" stroke="${INK}" stroke-width="3.2"/>
    <circle cx="64" cy="76" r="4.5" fill="var(--accent-glow)"/>
  </g>
  <g class="dj-tail dj-tail-r">
    <path d="M178 74c20 4 34 24 38 50 4 26-2 50-12 66-4 7-14 6-15-2-2-16 2-32 2-48 0-18-6-34-17-46-6-7-4-21 4-20z"
          fill="url(#djHair)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <circle cx="176" cy="76" r="12" fill="var(--chrome-face)" stroke="${INK}" stroke-width="3.2"/>
    <circle cx="176" cy="76" r="4.5" fill="var(--accent-glow)"/>
  </g>

  <!-- ================= 몸통 ================= -->
  <g class="dj-body">
    <!-- 후디 -->
    <path d="M120 168c-32 0-54 13-60 33-3 10-4 20-4 30h128c0-10-1-20-4-30-6-20-28-33-60-33z"
          fill="url(#djHood)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <!-- 목 그늘 + 후디 깃 -->
    <path d="M120 168c-11 0-19 3-19 3l19 20 19-20s-8-3-19-3z" fill="${INK}" opacity=".42"/>
    <!-- 후디 끈 -->
    <path d="M108 180c-2 12-2 20 0 27" stroke="var(--accent-glow)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M132 180c2 12 2 20 0 27" stroke="var(--accent-glow)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <!-- 소매 / 손 (턴테이블 위에) -->
    <g class="dj-hand dj-hand-l">
      <path d="M62 202c-8 4-11 12-9 19l20-6-3-14z" fill="url(#djHood)" stroke="${INK}" stroke-width="3"/>
      <circle cx="58" cy="222" r="9" fill="#f7dccd" stroke="${INK}" stroke-width="3"/>
    </g>
    <g class="dj-hand dj-hand-r">
      <path d="M178 202c8 4 11 12 9 19l-20-6 3-14z" fill="url(#djHood)" stroke="${INK}" stroke-width="3"/>
      <circle cx="182" cy="222" r="9" fill="#f7dccd" stroke="${INK}" stroke-width="3"/>
    </g>
  </g>

  <!-- ================= 머리 ================= -->
  <g class="dj-head">
    <!-- 뒷머리 실루엣 -->
    <path d="M120 20c-42 0-66 28-66 66 0 20 5 34 11 44h110c6-10 11-24 11-44 0-38-24-66-66-66z"
          fill="url(#djHair)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <!-- 얼굴 -->
    <ellipse cx="120" cy="98" rx="50" ry="47" fill="#fae3d4" stroke="${INK}" stroke-width="3.4"/>
    <!-- 앞머리: 갈래진 뱅 -->
    <path d="M70 90c0-34 22-58 50-58s50 24 50 58c-4-14-12-24-20-27-5 8-11 12-16 12-4 0-8-3-11-9-5 9-13 15-21 15-12 0-24 4-32 9z"
          fill="url(#djHair)" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <!-- 옆머리 -->
    <path d="M70 88c-5 12-6 28-4 42 4-10 8-18 12-24z" fill="url(#djHair)" stroke="${INK}" stroke-width="3"/>
    <path d="M170 88c5 12 6 28 4 42-4-10-8-18-12-24z" fill="url(#djHair)" stroke="${INK}" stroke-width="3"/>

    <!-- 볼 -->
    <ellipse class="dj-blush" cx="90"  cy="112" rx="11" ry="6.5" fill="#f19aa6" opacity=".6"/>
    <ellipse class="dj-blush" cx="150" cy="112" rx="11" ry="6.5" fill="#f19aa6" opacity=".6"/>

    <!-- 눈 (치비: 크고 반짝) -->
    <g class="dj-eyes">
      <ellipse cx="99"  cy="102" rx="11" ry="13.5" fill="${INK}"/>
      <ellipse cx="141" cy="102" rx="11" ry="13.5" fill="${INK}"/>
      <ellipse cx="99"  cy="105" rx="8"  ry="9.5"  fill="var(--accent)"/>
      <ellipse cx="141" cy="105" rx="8"  ry="9.5"  fill="var(--accent)"/>
      <circle cx="102.5" cy="97"  r="4.2" fill="#fff"/>
      <circle cx="144.5" cy="97"  r="4.2" fill="#fff"/>
      <circle cx="95"    cy="108" r="2.2" fill="#fff" opacity=".85"/>
      <circle cx="137"   cy="108" r="2.2" fill="#fff" opacity=".85"/>
    </g>
    <!-- 감은 눈 (dig 상태) -->
    <g class="dj-eyes-closed">
      <path d="M88 103q11 -11 22 0"  stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M130 103q11 -11 22 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <!-- 눈썹 -->
    <path d="M89 84q10 -6 20 -1"  stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>
    <path d="M131 83q10 -5 20 1" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>
    <!-- 입 -->
    <path class="dj-mouth" d="M113 124q7 7 14 0" stroke="#9c5a63" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </g>

  <!-- ================= 헤드폰 ================= -->
  <g class="dj-phones">
    <path d="M66 92a54 52 0 0 1 108 0" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M66 90a54 52 0 0 1 108 0" stroke="var(--chrome-light)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g class="dj-cup dj-cup-l">
      <rect x="50" y="82" width="28" height="42" rx="13" fill="var(--chrome-face)" stroke="${INK}" stroke-width="3.4"/>
      <rect class="pad" x="57" y="90" width="14" height="26" rx="7" fill="var(--accent)"/>
    </g>
    <g class="dj-cup dj-cup-r">
      <rect x="162" y="82" width="28" height="42" rx="13" fill="var(--chrome-face)" stroke="${INK}" stroke-width="3.4"/>
      <rect class="pad" x="169" y="90" width="14" height="26" rx="7" fill="var(--accent)"/>
    </g>
  </g>

  <!-- ================= DJ 부스 (앞) ================= -->
  <g class="dj-desk">
    <rect x="30" y="222" width="180" height="28" rx="4" fill="url(#djDeck)" stroke="${INK}" stroke-width="3.4"/>
    <!-- 미니 턴테이블 -->
    <circle class="dj-mini-disc" cx="66" cy="236" r="10" fill="${INK}" stroke="var(--chrome-light)" stroke-width="2"/>
    <circle cx="66" cy="236" r="3.4" fill="var(--accent)"/>
    <circle class="dj-mini-disc" cx="174" cy="236" r="10" fill="${INK}" stroke="var(--chrome-light)" stroke-width="2"/>
    <circle cx="174" cy="236" r="3.4" fill="var(--accent)"/>
    <!-- 페이더 -->
    <rect x="104" y="231" width="32" height="5" rx="2.5" fill="${INK}"/>
    <rect class="dj-fader" x="116" y="228" width="8" height="11" rx="2" fill="var(--accent-glow)" stroke="${INK}" stroke-width="2"/>
    <!-- 레벨 미터 -->
    <g class="dj-meter">
      <rect x="96" y="242" width="4" height="4" fill="var(--accent)"/>
      <rect x="102" y="242" width="4" height="4" fill="var(--accent)"/>
      <rect x="108" y="242" width="4" height="4" fill="var(--accent)"/>
      <rect x="114" y="242" width="4" height="4" fill="var(--accent)"/>
      <rect x="120" y="242" width="4" height="4" fill="var(--accent)"/>
      <rect x="126" y="242" width="4" height="4" fill="var(--accent)"/>
      <rect x="132" y="242" width="4" height="4" fill="var(--accent)"/>
    </g>
  </g>

  <!-- ================= 음표 (groove) ================= -->
  <g class="dj-notes" aria-hidden="true">
    <g class="dj-note dj-note-1"><path d="M0 0v-15l9-2v15" stroke="var(--accent-glow)" stroke-width="2.6" fill="none"/><ellipse cx="-3" cy="0" rx="4.4" ry="3.3" fill="var(--accent-glow)"/></g>
    <g class="dj-note dj-note-2"><path d="M0 0v-13l8-2v13" stroke="var(--accent)"      stroke-width="2.6" fill="none"/><ellipse cx="-2.7" cy="0" rx="4" ry="3" fill="var(--accent)"/></g>
    <g class="dj-note dj-note-3"><path d="M0 0v-17l10-2v17" stroke="var(--accent-glow)" stroke-width="2.6" fill="none"/><ellipse cx="-3.2" cy="0" rx="4.6" ry="3.5" fill="var(--accent-glow)"/></g>
  </g>
</svg>`;
}

/** 캐릭터 상태를 바꾼다. state: idle | talk | dig | groove */
export function setDjState(root, state) {
  if (!root) return;
  root.dataset.state = state;
}
