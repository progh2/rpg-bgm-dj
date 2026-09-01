// app.js — 재생기 본체 (issues #1 #4 #5 #6 #7)

import { BGM_BY_SCENE, SCENES, ALL_TRACKS, CREDITS } from '../../bgm-scenes.js';
import { moodOf, moodKeyOf, MOODS } from './moods.js';
import { SKINS, MOOD_SKIN, applyTheme, loadSkinPref, saveSkinPref } from './skins.js';
import { QUESTIONS, buildFromAnswers, DEFAULT_ANSWERS, pickChatter } from './dj.js';
import { djSvg, setDjState, DJ_NAME } from './character.js';
import { icon } from './icons.js';

/* 클릭재킹 방어.
   CSP frame-ancestors 는 <meta> 로 전달하면 브라우저가 무시하고, GitHub Pages 는
   X-Frame-Options 응답 헤더를 설정할 수 없다. 그래서 스크립트로 프레임에서 빠져나온다. */
if (window.top !== window.self) {
  try { window.top.location = window.self.location; }
  catch { document.documentElement.innerHTML = '<p style="font:14px sans-serif;padding:2rem">이 페이지는 다른 사이트 안에 표시할 수 없습니다.</p>'; }
}

const $ = (id) => document.getElementById(id);
const SCENE_NAME = Object.fromEntries(SCENES.map((s) => [s.id, s.name]));
const SCENE_CAT = Object.fromEntries(SCENES.map((s) => [s.id, s.category]));

const state = {
  queue: [],
  index: -1,
  playing: false,
  shuffle: false,
  repeat: true,
  volume: 45,
  activeDeck: 'a',
  skin: loadSkinPref(),
  answers: null,
  ready: false,
  seeking: false,
  wakeWanted: false,   // 사용자가 '화면 켜둠'을 켰는가
  failStreak: 0,       // 연속 재생 실패 횟수 (무한 루프 방지)
  skipped: 0,          // 이번 세션에 건너뛴 곡 수
};

/** 이번 세션에 재생 불가로 판명된 videoId. 다시 뽑히지 않게 한다. */
const deadIds = new Set();

/** 연속 실패가 이 횟수를 넘으면 멈추고 사람에게 알린다. */
const MAX_FAIL_STREAK = 8;

let yt = null;
let tick = null;

/* ---------------------------------------------------------------- 테마 */

function currentMoodKey() {
  const t = state.queue[state.index];
  return t ? moodKeyOf(t.scene) : 'calm';
}

function refreshTheme() {
  const key = currentMoodKey();
  const mood = MOODS[key];
  const skinId = state.skin.locked ? state.skin.id : (MOOD_SKIN[key] || state.skin.id);
  applyTheme(skinId, mood);
  $('mood-chip').textContent = mood.label;
  // 잠금 해제 상태에서는 어떤 스킨이 적용됐는지 버튼에도 반영
  for (const btn of document.querySelectorAll('.skin-btn')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.skin === skinId));
  }
}

function buildSkinPicker() {
  const grid = $('skin-grid');
  grid.innerHTML = '';
  for (const [id, skin] of Object.entries(SKINS)) {
    const b = document.createElement('button');
    b.className = 'skin-btn';
    b.dataset.skin = id;
    b.title = skin.note;
    b.setAttribute('aria-pressed', String(id === state.skin.id));
    // 인라인 style 대신 CSS 변수를 세팅해 CSP style-src 'self' 를 유지한다
    b.innerHTML = `<span class="swatch"><i></i><i></i><i></i></span>${skin.label}`;
    const sw = b.querySelectorAll('.swatch i');
    sw[0].style.setProperty('--sw', skin.vars['--chrome-face']);
    sw[1].style.setProperty('--sw', skin.vars['--lcd-ink']);
    sw[2].style.setProperty('--sw', skin.vars['--chrome-dark']);
    b.addEventListener('click', () => {
      state.skin.id = id;
      state.skin.locked = true;
      $('skin-lock').checked = true;
      saveSkinPref(state.skin);
      refreshTheme();
      say(`${skin.label} 스킨으로 갈아입었어. ${skin.note}.`);
    });
    grid.appendChild(b);
  }
  const lock = $('skin-lock');
  lock.checked = state.skin.locked;
  lock.addEventListener('change', () => {
    state.skin.locked = lock.checked;
    saveSkinPref(state.skin);
    refreshTheme();
    say(lock.checked ? '스킨 고정했어. 곡이 바뀌어도 그대로 갈게.' : '이제 곡 분위기 따라 알아서 갈아입을게.');
  });
}

/* ---------------------------------------------------------------- DJ */

let bubbleTimer = null;

function say(text, state_ = 'talk') {
  $('bubble-text').textContent = text;
  setDjState($('dj-stage'), state_);
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    setDjState($('dj-stage'), state.playing ? 'groove' : 'idle');
  }, Math.min(6000, 1800 + text.length * 55));
}

/** 질답 진행 */
const qa = { step: 0, answers: {} };

function renderQuestion() {
  const box = $('qa');
  const prog = $('qa-progress');
  prog.innerHTML = QUESTIONS.map((_, i) => `<i class="${i < qa.step ? 'done' : ''}"></i>`).join('');

  if (qa.step >= QUESTIONS.length) {
    box.innerHTML = '';
    const again = document.createElement('button');
    again.className = 'qa-opt';
    again.innerHTML = `<span class="em">${icon('again')}</span><span><span class="lbl">다시 골라줘</span><span class="sub">질문부터 새로</span></span>`;
    again.addEventListener('click', startQa);
    box.appendChild(again);
    return;
  }

  const q = QUESTIONS[qa.step];
  say(q.ask, 'talk');
  box.innerHTML = `<p class="qa-hint">${q.hint}</p>`;
  for (const opt of q.options) {
    const b = document.createElement('button');
    b.className = 'qa-opt';
    b.innerHTML = `<span class="em" aria-hidden="true">${icon(opt.icon)}</span>
      <span><span class="lbl">${opt.label}</span><span class="sub">${opt.blurb}</span></span>`;
    b.addEventListener('click', () => {
      qa.answers[q.id] = opt.id;
      qa.step += 1;
      if (qa.step >= QUESTIONS.length) finishQa();
      else renderQuestion();
    });
    box.appendChild(b);
  }
}

function startQa() {
  qa.step = 0;
  qa.answers = {};
  renderQuestion();
}

function finishQa() {
  setDjState($('dj-stage'), 'dig');
  $('bubble-text').textContent = pickChatter('picking');
  $('qa').innerHTML = '';
  setTimeout(() => {
    const res = buildFromAnswers(qa.answers, BGM_BY_SCENE, 40);
    state.answers = qa.answers;
    loadQueue(res.tracks, res.summary);
    renderQuestion();      // 진행바 완료 + '다시 골라줘'
    say(res.summary, 'talk');
    play(0);
  }, 900);
}

/* ---------------------------------------------------------------- 재생목록 */

function loadQueue(tracks, desc = '') {
  // 이번 세션에 재생 불가로 판명된 곡은 다시 넣지 않는다
  state.queue = tracks.filter((t) => !deadIds.has(t.videoId));
  state.failStreak = 0;
  state.index = -1;
  $('pl-desc').textContent = desc ? '' : '';
  renderPlaylist();
  $('pl-count').textContent = `${tracks.length}곡`;
}

function renderPlaylist() {
  const list = $('pl-list');
  list.innerHTML = '';
  if (!state.queue.length) {
    list.innerHTML = '<p class="empty">재생목록이 비어 있습니다.</p>';
    return;
  }
  state.queue.forEach((t, i) => {
    const row = document.createElement('button');
    row.className = 'pl-row' + (i === state.index ? ' current' : '') + (t.spicy ? ' spicy' : '');
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', String(i === state.index));
    row.title = `${t.title} / ${t.artist} — ${SCENE_NAME[t.scene] || ''}`;
    row.innerHTML =
      `<span class="n">${String(i + 1).padStart(2, '0')}</span>` +
      `<span class="t">${escapeHtml(t.title)} — ${escapeHtml(t.artist)}</span>` +
      `<span class="d">${fmt(t.length)}</span>`;
    row.addEventListener('click', () => play(i));
    list.appendChild(row);
  });
}

function scrollToCurrent() {
  const row = $('pl-list').children[state.index];
  if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
}

/* ---------------------------------------------------------------- 턴테이블 */

function swapDeck(track) {
  const next = state.activeDeck === 'a' ? 'b' : 'a';
  const incoming = $(`deck-${next}`);
  const outgoing = $(`deck-${state.activeDeck}`);

  outgoing.classList.remove('spinning', 'active');
  outgoing.classList.add('retiring');

  incoming.classList.remove('retiring');
  incoming.classList.add('active', 'spinning');
  incoming.querySelector('.label span').textContent = SCENE_NAME[track.scene] || track.scene;

  state.activeDeck = next;
}

function setSpinning(on) {
  const deck = $(`deck-${state.activeDeck}`);
  deck.classList.toggle('spinning', on);
}

/* ---------------------------------------------------------------- 곡 정보 */

const NONCOMMERCIAL = /non-commercial/i;

function renderInfo(t) {
  const info = $('info');
  if (!t) { info.innerHTML = '<p class="empty">재생을 시작하면 곡 정보와 라이선스가 표시됩니다.</p>'; return; }
  const scene = SCENE_NAME[t.scene] || t.scene;
  const cat = SCENE_CAT[t.scene] || '';
  const warn = NONCOMMERCIAL.test(t.license)
    ? `<p class="license-warn">이 곡은 <strong>비상업 조건</strong>입니다. 개인 감상은 괜찮지만 수익화된 방송·영상에는 쓰지 마세요.</p>` : '';
  info.innerHTML = `
    <dl>
      <dt>곡</dt><dd>${escapeHtml(t.title)}</dd>
      <dt>아티스트</dt><dd>${escapeHtml(t.artist)}</dd>
      <dt>장면</dt><dd><span class="scene-chip">${escapeHtml(scene)}</span> <span class="scene-cat">${escapeHtml(cat)}</span></dd>
      <dt>길이</dt><dd>${fmt(t.length)} · 집중도 ${t.focus}/5</dd>
      <dt>라이선스</dt><dd>${escapeHtml(t.license)}</dd>
      <dt>원곡</dt><dd><a href="https://www.youtube.com/watch?v=${t.videoId}" target="_blank" rel="noopener">YouTube에서 열기 ↗</a></dd>
    </dl>${warn}`;
}

/* ---------------------------------------------------------------- 재생 제어 */

function play(i) {
  if (!state.queue.length) return;
  const idx = ((i % state.queue.length) + state.queue.length) % state.queue.length;
  const t = state.queue[idx];
  state.index = idx;

  swapDeck(t);
  renderInfo(t);
  renderPlaylist();
  scrollToCurrent();
  refreshTheme();
  setMarquee(`${t.title} — ${t.artist}`);
  $('badge-scene').textContent = SCENE_NAME[t.scene] || '—';
  $('badge-scene').classList.add('on');

  // 화면 낭독기에 곡 변경을 알린다 (시각적으로는 숨겨진 라이브 리전)
  markCurrentScene(t.scene);

  const sr = $('sr-status');
  if (sr) sr.textContent = `재생 중: ${t.title}, ${t.artist}. 장면 ${SCENE_NAME[t.scene] || ''}. ${idx + 1}번째 곡, 전체 ${state.queue.length}곡.`;

  if (yt && state.ready) {
    yt.loadVideoById(t.videoId);
    yt.setVolume(state.volume);
  }
}

function next(auto = false) {
  if (!state.queue.length) return;
  if (state.shuffle) {
    let n = state.index;
    if (state.queue.length > 1) while (n === state.index) n = Math.floor(Math.random() * state.queue.length);
    play(n);
    return;
  }
  if (state.index + 1 >= state.queue.length) {
    if (state.repeat) { play(0); }
    else { stop(); say(pickChatter('done'), 'talk'); }
    return;
  }
  play(state.index + 1);
}

function prev() {
  if (yt && state.ready && yt.getCurrentTime() > 3) { yt.seekTo(0); return; }
  play(state.index - 1);
}

function togglePlay() {
  if (!state.ready) return;
  if (state.index < 0) { play(0); return; }
  if (state.playing) yt.pauseVideo();
  else yt.playVideo();
}

function stop() {
  if (yt && state.ready) yt.stopVideo();
  state.playing = false;
  setSpinning(false);
  setDjState($('dj-stage'), 'idle');
  releaseWake();
  updateTransport();
}

function updateTransport() {
  $('btn-play').textContent = state.playing ? '❚❚' : '▶';
  $('btn-play').setAttribute('aria-label', state.playing ? '일시정지' : '재생');
  $('badge-play').classList.toggle('on', state.playing);
  $('badge-shuffle').classList.toggle('on', state.shuffle);
  $('badge-repeat').classList.toggle('on', state.repeat);
  $('btn-shuffle').setAttribute('aria-pressed', String(state.shuffle));
  $('btn-repeat').setAttribute('aria-pressed', String(state.repeat));
}

/* ---------------------------------------------------------------- 표시 */

function setMarquee(text) {
  const m = $('marquee');
  m.innerHTML = `<span>${escapeHtml(text)}</span>`;
  m.classList.toggle('short', text.length < 34);
}

function fmt(sec) {
  if (!sec && sec !== 0) return '--:--';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* 스펙트럼 — YouTube는 오디오 데이터를 안 주므로 의사 시각화 */
function buildViz() {
  const viz = $('viz');
  viz.innerHTML = '';
  for (let i = 0; i < 28; i++) viz.appendChild(document.createElement('i'));
}

let vizPhase = 0;
function stepViz() {
  const bars = $('viz').children;
  vizPhase += 0.28;
  for (let i = 0; i < bars.length; i++) {
    if (!state.playing) { bars[i].style.height = '6%'; continue; }
    // 낮은 대역이 크고 높은 대역이 작은, 그럴듯한 곡선
    const tilt = 1 - i / bars.length * 0.72;
    const wob = Math.sin(vizPhase + i * 0.55) * 0.5 + Math.sin(vizPhase * 1.7 + i * 0.21) * 0.5;
    const h = Math.max(6, (0.45 + wob * 0.42) * 100 * tilt);
    bars[i].style.height = `${Math.min(100, h)}%`;
  }
}

function stepTime() {
  if (!yt || !state.ready || state.index < 0) return;
  const cur = yt.getCurrentTime?.() ?? 0;
  const dur = yt.getDuration?.() ?? 0;
  $('lcd-time').textContent = fmt(cur);
  if (!state.seeking && dur > 0) $('seek').value = String(Math.round(cur / dur * 1000));
}




/* ---------------------------------------------------------------- 재생 실패 처리 (issue #14)

   YouTube 오류 코드
     2   요청이 잘못됨 (영상 ID 이상)      → 영구
     5   HTML5 플레이어 오류                → 일시적일 수 있어 한 번 재시도
     100 영상 없음 (삭제/비공개)            → 영구
     101 / 150 소유자가 임베드 차단          → 영구

   오류를 내지 않고 무한 버퍼링하는 경우도 있어, 재생 위치가 멈춰 있으면
   따로 감지해 넘긴다.                                                        */

const PERMANENT_ERRORS = new Set([2, 100, 101, 150]);
const ERROR_REASON = {
  2: '영상 주소가 잘못됐어',
  5: '재생기가 이 영상을 못 열었어',
  100: '영상이 삭제됐거나 비공개가 됐어',
  101: '올린 사람이 외부 재생을 막아놨어',
  150: '올린 사람이 외부 재생을 막아놨어',
};

let retriedOnce = null;   // 일시적 오류로 한 번 재시도한 videoId

function handlePlaybackError(code) {
  const bad = state.queue[state.index];
  if (!bad) return;

  // HTML5 오류는 일시적인 경우가 있어 같은 곡을 한 번만 다시 시도한다.
  if (code === 5 && retriedOnce !== bad.videoId) {
    retriedOnce = bad.videoId;
    console.warn('재생 오류, 한 번 재시도:', bad.videoId, bad.title);
    setTimeout(() => { if (yt && state.ready) yt.loadVideoById(bad.videoId); }, 600);
    return;
  }

  console.warn(`재생 불가(코드 ${code}), 건너뜀:`, bad.videoId, bad.title);
  if (PERMANENT_ERRORS.has(code)) deadIds.add(bad.videoId);
  dropCurrent(ERROR_REASON[code] || '이 곡은 재생이 안 되네');
}

/** 현재 곡을 목록에서 빼고 다음 곡으로 넘어간다. */
function dropCurrent(reason) {
  const bad = state.queue[state.index];
  if (!bad) return;

  state.queue.splice(state.index, 1);
  state.failStreak += 1;
  state.skipped += 1;
  $('pl-count').textContent = `${state.queue.length}곡`;
  renderPlaylist();

  if (!state.queue.length) {
    stop();
    say('재생할 수 있는 곡이 다 떨어졌어. 다시 골라볼까?', 'talk');
    return;
  }

  // 연속으로 계속 실패하면 네트워크 문제일 가능성이 크다. 무한 시도를 멈춘다.
  if (state.failStreak >= MAX_FAIL_STREAK) {
    stop();
    say(`${MAX_FAIL_STREAK}곡 연속으로 재생에 실패했어. 인터넷 연결을 확인해줘.`, 'talk');
    state.failStreak = 0;
    return;
  }

  // 한두 곡 건너뛰는 건 조용히, 잦아지면 알려준다.
  if (state.skipped === 1 || state.skipped % 5 === 0) {
    say(`${reason}. 건너뛸게. (지금까지 ${state.skipped}곡)`);
  }

  play(state.index);   // splice 로 다음 곡이 이 자리에 왔다
}

/* ── 멈춤 감지 ────────────────────────────────────────────────
   재생 중이라고 표시돼 있는데 재생 위치가 움직이지 않으면 넘긴다.
   버퍼링일 수도 있으므로 넉넉히 기다린다. */

let lastTime = -1;
let stalledTicks = 0;
const STALL_LIMIT = 12;   // stepTime 이 120ms 마다 도니 약 15초

function checkStall() {
  if (!state.playing || !yt || !state.ready || state.index < 0) {
    stalledTicks = 0; lastTime = -1; return;
  }
  const t = yt.getCurrentTime?.() ?? 0;
  if (Math.abs(t - lastTime) < 0.05) {
    stalledTicks += 1;
    if (stalledTicks >= STALL_LIMIT * 10) {
      stalledTicks = 0;
      const bad = state.queue[state.index];
      console.warn('재생이 멈춰 있어 건너뜀:', bad?.videoId, bad?.title);
      dropCurrent('재생이 멈춰버렸어');
    }
  } else {
    stalledTicks = 0;
    state.failStreak = 0;   // 정상 재생되면 연속 실패 기록을 지운다
  }
  lastTime = t;
}

/* ---------------------------------------------------------------- 장면 브라우저

   질답은 27개 장면까지만 닿고, 전곡 셔플은 focus>=4 만 뽑는다.
   그래서 전투·징글 계열 7개 장면 253곡이 UI로 도달 불가였다. 여기서 직접 고른다. */

const picked = new Set();

function buildSceneBrowser() {
  const box = $('scene-browser');
  if (!box) return;
  const groups = new Map();
  for (const sc of SCENES) {
    if (!groups.has(sc.category)) groups.set(sc.category, []);
    groups.get(sc.category).push(sc);
  }
  box.innerHTML = '';
  for (const [cat, list] of groups) {
    const g = document.createElement('div');
    g.className = 'scene-group';
    const h = document.createElement('h3');
    h.textContent = cat;
    g.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'scene-grid';
    for (const sc of list) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'scene-btn';
      b.dataset.scene = sc.id;
      b.setAttribute('aria-pressed', 'false');
      const calm = (BGM_BY_SCENE[sc.id] || []).filter((t) => t.focus >= 4).length;
      b.title = `${sc.name} — ${sc.count}곡 (작업용 ${calm}곡)`;
      b.innerHTML = `<span class="nm">${escapeHtml(sc.name)}</span><span class="ct">${sc.count}</span>`;
      b.addEventListener('click', () => onSceneClick(sc, b));
      grid.appendChild(b);
    }
    g.appendChild(grid);
    box.appendChild(g);
  }
}

function multiMode() { return $('scene-multi')?.checked; }

function onSceneClick(sc, btn) {
  if (multiMode()) {
    if (picked.has(sc.id)) picked.delete(sc.id); else picked.add(sc.id);
    btn.setAttribute('aria-pressed', String(picked.has(sc.id)));
    renderPicked();
    return;
  }
  playScenes([sc.id], sc.name);
}

function renderPicked() {
  const n = picked.size;
  $('scene-picked').textContent = `${n}개 선택`;
  $('btn-scene-play').disabled = n === 0;
}

function clearPicked() {
  picked.clear();
  for (const b of document.querySelectorAll('.scene-btn')) b.setAttribute('aria-pressed', 'false');
  renderPicked();
}

/** 장면 id 목록으로 재생목록을 만들어 바로 재생 */
function playScenes(ids, label) {
  const seen = new Set();
  const pool = [];
  for (const id of ids) {
    for (const t of BGM_BY_SCENE[id] || []) {
      if (seen.has(t.videoId)) continue;
      seen.add(t.videoId);
      pool.push({ ...t, scene: id });
    }
  }
  if (!pool.length) { say('그 장면엔 곡이 없네.'); return; }
  // 아티스트가 연달아 나오지 않게 섞는다
  const byArtist = new Map();
  for (const t of pool) {
    if (!byArtist.has(t.artist)) byArtist.set(t.artist, []);
    byArtist.get(t.artist).push(t);
  }
  const queues = [...byArtist.values()].sort(() => Math.random() - 0.5);
  for (const q of queues) q.sort(() => Math.random() - 0.5);
  const list = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) list.push(q.shift());

  loadQueue(list);
  const name = label || `${ids.length}개 장면`;
  say(`${name} — ${list.length}곡 걸었어.`);
  play(0);
}

function initSceneBrowser() {
  const toggle = $('btn-scenes-toggle');
  const box = $('scene-browser');
  const actions = $('scene-actions');
  if (!toggle || !box) return;

  buildSceneBrowser();

  toggle.addEventListener('click', () => {
    const open = box.hidden;
    box.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '▲' : '▼';
    if (!open) { actions.hidden = true; }
    else if (multiMode()) actions.hidden = false;
  });

  $('scene-multi').addEventListener('change', (e) => {
    actions.hidden = !e.target.checked || box.hidden;
    if (!e.target.checked) clearPicked();
    else say('여러 장면을 골라서 합칠 수 있어. 다 고르면 재생을 눌러줘.');
  });

  $('btn-scene-play').addEventListener('click', () => {
    if (!picked.size) return;
    const names = SCENES.filter((s) => picked.has(s.id)).map((s) => s.name);
    playScenes([...picked], names.length > 2 ? `${names[0]} 외 ${names.length - 1}개` : names.join(' · '));
  });
  $('btn-scene-clear').addEventListener('click', clearPicked);

  renderPicked();
}

/** 현재 재생 중인 장면을 브라우저에 표시 */
function markCurrentScene(sceneId) {
  for (const b of document.querySelectorAll('.scene-btn')) {
    b.classList.toggle('is-current', b.dataset.scene === sceneId);
  }
}

/* ---------------------------------------------------------------- 화면 켜둠 (Wake Lock)

   휴대폰에서 화면이 꺼지면 소리가 멈춘다. 진짜 백그라운드 재생은 YouTube가
   Premium 기능으로 막아 두어 임베드로는 불가능하다. 다만 "책상에 폰을 두었더니
   화면이 꺼져서 멈췄다"는 가장 흔한 경우는 화면을 켜둔 채로 두면 해결된다.

   Wake Lock 은 탭이 숨겨지면 브라우저가 자동으로 해제하므로,
   다시 보이게 됐을 때 재요청해야 한다.                                        */

let wakeLock = null;
let wakeDenied = false;   // 브라우저가 거부했는가 (배터리 절약 모드 등)
const wakeSupported = 'wakeLock' in navigator;

async function acquireWake() {
  if (!wakeSupported || !state.wakeWanted || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeDenied = false;
    wakeLock.addEventListener('release', () => { wakeLock = null; renderWake(); });
  } catch {
    // 배터리 절약 모드, 화면 없는 환경 등에서 거부된다.
    wakeLock = null;
    wakeDenied = true;
  }
  renderWake();
}

async function releaseWake() {
  try { await wakeLock?.release(); } catch { /* 이미 해제됨 */ }
  wakeLock = null;
  renderWake();
}

function renderWake() {
  const btn = $('btn-wakelock');
  if (!btn) return;
  const on = state.wakeWanted;
  btn.setAttribute('aria-pressed', String(on));
  let label = 'OFF';
  if (!wakeSupported) label = 'N/A';
  else if (!on) label = 'OFF';
  else if (wakeLock) label = 'ON';
  else if (wakeDenied) label = '거부됨';
  else label = '대기';        // 켜뒀지만 아직 재생 전
  $('wake-state').textContent = label;
  btn.title = wakeDenied
    ? '브라우저가 화면 켜두기를 거부했습니다. 배터리 절약 모드가 켜져 있으면 꺼 보세요.'
    : '재생 중 화면이 꺼지지 않게 합니다. 휴대폰에서 화면이 꺼지면 소리가 멈추기 때문입니다.';
}

function initWake() {
  const btn = $('btn-wakelock');
  if (!wakeSupported) {
    btn.dataset.unsupported = 'true';
    btn.disabled = true;
    btn.title = '이 브라우저는 화면 켜두기를 지원하지 않습니다.';
    renderWake();
    return;
  }
  btn.addEventListener('click', async () => {
    state.wakeWanted = !state.wakeWanted;
    if (state.wakeWanted) {
      wakeDenied = false;
      await acquireWake();
      say(wakeDenied
        ? '브라우저가 거부했어. 배터리 절약 모드가 켜져 있으면 꺼보고 다시 눌러줘.'
        : '재생하는 동안 화면을 켜둘게. 배터리는 좀 더 쓸 거야.');
    } else {
      await releaseWake();
      say('화면 켜두기 껐어.');
    }
  });

  // 탭이 다시 보이면 재요청 (브라우저가 숨김 상태에서 자동 해제한다)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.playing) acquireWake();
  });

  renderWake();
}

/** 좁은 화면에서만 백그라운드 재생 안내를 띄운다. */
function initMobileNote() {
  const note = $('mobile-note');
  if (!note) return;
  const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;
  note.hidden = !isTouch;
}

/* ---------------------------------------------------------------- YouTube */

function initYt() {
  yt = new YT.Player('yt-player', {
    height: '1', width: '1',
    // youtube-nocookie: 재생 전까지 추적 쿠키를 심지 않는 도메인
    host: 'https://www.youtube-nocookie.com',
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, origin: location.origin },
    events: {
      onReady: () => {
        state.ready = true;
        yt.setVolume(state.volume);
        say(pickChatter('greet'), 'talk');
        startQa();
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          state.playing = true;
          setSpinning(true);
          setDjState($('dj-stage'), 'groove');
          acquireWake();
        } else if (e.data === YT.PlayerState.PAUSED) {
          state.playing = false;
          setSpinning(false);
          setDjState($('dj-stage'), 'idle');
          releaseWake();
        } else if (e.data === YT.PlayerState.ENDED) {
          state.playing = false;
          next(true);
        }
        updateTransport();
      },
      onError: (e) => handlePlaybackError(e.data),
    },
  });
}
window.onYouTubeIframeAPIReady = initYt;

/* ---------------------------------------------------------------- 시작 */

function wire() {
  $('btn-play').addEventListener('click', togglePlay);
  $('btn-stop').addEventListener('click', stop);
  $('btn-next').addEventListener('click', () => next());
  $('btn-prev').addEventListener('click', prev);

  $('btn-shuffle').addEventListener('click', () => {
    state.shuffle = !state.shuffle; updateTransport();
    say(state.shuffle ? '순서 안 지키고 아무거나 틀게.' : '순서대로 갈게.');
  });
  $('btn-repeat').addEventListener('click', () => {
    state.repeat = !state.repeat; updateTransport();
    say(state.repeat ? '끝나면 처음부터 다시 돌릴게.' : '한 바퀴만 돌고 멈출게.');
  });

  $('btn-reshuffle').addEventListener('click', () => {
    const cur = state.queue[state.index];
    state.queue = state.queue
      .map((t) => [Math.random(), t]).sort((a, b) => a[0] - b[0]).map(([, t]) => t);
    state.index = cur ? state.queue.findIndex((t) => t.videoId === cur.videoId) : -1;
    renderPlaylist(); scrollToCurrent();
    say('순서 섞었어.');
  });

  $('btn-shuffle-all').addEventListener('click', () => {
    const pool = ALL_TRACKS.filter((t) => t.focus >= 4);
    const picked = pool.map((t) => [Math.random(), t]).sort((a, b) => a[0] - b[0]).slice(0, 40).map(([, t]) => t);
    loadQueue(picked);
    say('전체에서 아무거나 40곡 뽑았어. 취향 안 물어보고 그냥.');
    play(0);
  });

  const vol = $('vol');
  vol.addEventListener('input', () => {
    state.volume = Number(vol.value);
    $('vol-num').textContent = vol.value;
    if (yt && state.ready) yt.setVolume(state.volume);
  });

  const seek = $('seek');
  seek.addEventListener('pointerdown', () => { state.seeking = true; });
  const commitSeek = () => {
    if (!yt || !state.ready) return;
    const dur = yt.getDuration?.() ?? 0;
    if (dur > 0) yt.seekTo(dur * (Number(seek.value) / 1000), true);
    state.seeking = false;
  };
  seek.addEventListener('pointerup', commitSeek);
  seek.addEventListener('change', commitSeek);

  // 키보드 단축키
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'ArrowRight' && e.shiftKey) { e.preventDefault(); next(); }
    else if (e.code === 'ArrowLeft' && e.shiftKey) { e.preventDefault(); prev(); }
  });
}

function boot() {
  $('dj-stage').innerHTML = djSvg();
  $('dj-name').textContent = DJ_NAME.toUpperCase();
  $('stat-count').textContent = ALL_TRACKS.length.toLocaleString('ko-KR');
  $('credit-list').textContent = CREDITS.join(' · ');
  buildViz();
  buildSkinPicker();
  initWake();
  initMobileNote();
  initSceneBrowser();
  refreshTheme();
  wire();
  updateTransport();

  // 기본 재생목록: 질답 전에도 바로 틀 수 있게 준비만 해둔다.
  const seed = buildFromAnswers(DEFAULT_ANSWERS, BGM_BY_SCENE, 40);
  loadQueue(seed.tracks);
  setMarquee('DJ에게 취향을 말해주면 다시 골라줄게 —');

  tick = setInterval(() => { stepViz(); stepTime(); checkStall(); }, 120);

  // YouTube API가 이미 로드된 경우
  if (window.YT && window.YT.Player) initYt();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
