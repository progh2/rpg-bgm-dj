// app.js — 홀을 여닫고 노래를 튼다.

import { BGM_BY_SCENE, SCENES, ALL_TRACKS, CREDITS } from '../../bgm-scenes.js';
import { moodOf, moodKeyOf, MOODS } from './moods.js';
import { HALLS, MOOD_HALL, applyHall, loadHallPref, saveHallPref } from './halls.js';
import { QUESTIONS, buildFromAnswers, DEFAULT_ANSWERS, pickChatter, spreadByArtist } from './bard.js';
import { bardArt, setBardState, BARD_NAME, BARD_SHORT } from './character.js';
import { icon } from './icons.js';
import { startLight, setPhase, currentPhase, PHASES } from './hearth.js';
import { sfx, sfxMuted } from './sounds.js';
import * as secrets from './secrets.js';
import { startRoast, DISHES } from './roast.js';

/* 클릭재킹 방어.
   CSP frame-ancestors 는 <meta> 로 전달하면 브라우저가 무시하고, GitHub Pages 는
   X-Frame-Options 응답 헤더를 설정할 수 없다. 그래서 스크립트로 프레임에서 빠져나온다. */
if (window.top !== window.self) {
  try { window.top.location = window.self.location; }
  catch { document.documentElement.textContent = '이 페이지는 다른 사이트 안에 표시할 수 없습니다.'; }
}

const $ = (id) => document.getElementById(id);
const SCENE_NAME = Object.fromEntries(SCENES.map((s) => [s.id, s.name]));
const SCENE_CAT = Object.fromEntries(SCENES.map((s) => [s.id, s.category]));

const state = {
  queue: [], index: -1,
  playing: false, shuffle: false, repeat: true,
  volume: 45, ready: false, seeking: false,
  hall: loadHallPref(),
  wakeWanted: false,
  failStreak: 0, skipped: 0,
};

/** 이번에 재생 불가로 판명된 곡. 다시 뽑지 않는다. */
const deadIds = new Set();
const MAX_FAIL_STREAK = 8;

let yt = null;
let tick = null;

/* ---------------------------------------------------------------- 장소와 분위기 */

function currentMoodKey() {
  const t = state.queue[state.index];
  return t ? moodKeyOf(t.scene) : 'calm';
}

function refreshHall() {
  const key = currentMoodKey();
  const mood = MOODS[key];
  const hallId = state.hall.locked ? state.hall.id : (MOOD_HALL[key] || state.hall.id);
  applyHall(hallId, mood);
  $('mood-chip').textContent = mood.label;
  for (const b of document.querySelectorAll('.hall-btn')) {
    b.setAttribute('aria-pressed', String(b.dataset.hall === hallId));
  }
  secrets.noteHall(hallId, Object.keys(HALLS).length);
}

function buildHallPicker() {
  const grid = $('hall-grid');
  grid.innerHTML = '';
  for (const [id, hall] of Object.entries(HALLS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hall-btn';
    b.dataset.hall = id;
    b.title = hall.note;
    b.setAttribute('aria-pressed', String(id === state.hall.id));
    b.innerHTML = `<span class="swatch"><i></i><i></i><i></i></span>${hall.label}`;
    const sw = b.querySelectorAll('.swatch i');
    sw[0].style.setProperty('--sw', hall.vars['--wood']);
    sw[1].style.setProperty('--sw', hall.vars['--metal']);
    sw[2].style.setProperty('--sw', hall.vars['--stone-dark']);
    b.addEventListener('click', () => {
      state.hall.id = id;
      state.hall.locked = true;
      $('hall-lock').checked = true;
      saveHallPref(state.hall);
      refreshHall();
      say(`${hall.label}으로 옮겼습니다. ${hall.note}.`);
    });
    grid.appendChild(b);
  }
  const lock = $('hall-lock');
  lock.checked = state.hall.locked;
  lock.addEventListener('change', () => {
    state.hall.locked = lock.checked;
    saveHallPref(state.hall);
    refreshHall();
    say(lock.checked ? '이 자리에 머무르겠습니다.' : '곡 결에 따라 자리를 옮기겠습니다.');
  });
}

/* ---------------------------------------------------------------- 바드 */

let noteTimer = null;

function say(text, mode = 'talk') {
  $('note-text').textContent = text;
  setBardState($('bard-stage'), mode);
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    setBardState($('bard-stage'), state.playing ? 'play' : 'idle');
  }, Math.min(7000, 2000 + text.length * 55));
}

const ask = { step: 0, answers: {} };

function renderQuestion() {
  const box = $('ask');
  $('ask-beads').innerHTML = QUESTIONS.map((_, i) => `<i class="${i < ask.step ? 'done' : ''}"></i>`).join('');

  if (ask.step >= QUESTIONS.length) {
    box.innerHTML = '';
    const again = document.createElement('button');
    again.className = 'ask-opt';
    again.innerHTML = `<span class="em">${icon('again')}</span><span><span class="lbl">다시 물어 주시오</span><span class="sub">처음부터</span></span>`;
    again.addEventListener('click', startAsk);
    box.appendChild(again);
    return;
  }

  const q = QUESTIONS[ask.step];
  say(q.ask, 'talk');
  box.innerHTML = `<p class="ask-hint">${q.hint}</p>`;
  for (const opt of q.options) {
    const b = document.createElement('button');
    b.className = 'ask-opt';
    b.innerHTML = `<span class="em" aria-hidden="true">${icon(opt.icon)}</span>
      <span><span class="lbl">${opt.label}</span><span class="sub">${opt.blurb}</span></span>`;
    b.addEventListener('click', () => {
      sfx.pluck(262 + ask.step * 49);
      ask.answers[q.id] = opt.id;
      ask.step += 1;
      if (ask.step >= QUESTIONS.length) finishAsk();
      else renderQuestion();
    });
    box.appendChild(b);
  }
}

function startAsk() { ask.step = 0; ask.answers = {}; renderQuestion(); }

function finishAsk() {
  setBardState($('bard-stage'), 'dig');
  $('note-text').textContent = pickChatter('picking');
  $('ask').innerHTML = '';
  setTimeout(() => {
    const res = buildFromAnswers(ask.answers, BGM_BY_SCENE, 40);
    loadQueue(res.tracks);
    renderQuestion();
    say(res.summary, 'talk');
    play(0);
  }, 900);
}

/* ---------------------------------------------------------------- 곡목 */

function loadQueue(tracks) {
  state.queue = tracks.filter((t) => !deadIds.has(t.videoId));
  state.failStreak = 0;
  state.index = -1;
  renderList();
  $('list-count').textContent = `${state.queue.length}곡`;
}

function renderList() {
  const list = $('songlist');
  list.innerHTML = '';
  if (!state.queue.length) {
    list.innerHTML = '<p class="empty">곡목이 비었습니다.</p>';
    return;
  }
  state.queue.forEach((t, i) => {
    const row = document.createElement('button');
    row.className = 'song-row' + (i === state.index ? ' current' : '') + (t.spicy ? ' spicy' : '');
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', String(i === state.index));
    row.title = `${t.title} / ${t.artist} — ${SCENE_NAME[t.scene] || ''}`;
    row.innerHTML =
      `<span class="n">${String(i + 1).padStart(2, '0')}</span>` +
      `<span class="t">${esc(t.title)} — ${esc(t.artist)}</span>` +
      `<span class="d">${fmt(t.length)}</span>`;
    row.addEventListener('click', () => play(i));
    list.appendChild(row);
  });
}

function scrollToCurrent() {
  const row = $('songlist').children[state.index];
  row?.scrollIntoView?.({ block: 'nearest' });
}

/* ---------------------------------------------------------------- 화로와 악보대 */

function setBurning(on) {
  $('hearth').classList.toggle('burning', on);
  $('hearth-tag').textContent = on ? '활활' : '잉걸';
}

function turnParchment(t) {
  const p = $('parchment');
  p.classList.add('turning');
  setTimeout(() => {
    $('pc-scene').textContent = SCENE_NAME[t.scene] || t.scene;
    $('pc-song').textContent = t.title;
    $('pc-by').textContent = t.artist;
    $('pc-meta').textContent = `${fmt(t.length)} · 집중도 ${t.focus}/5 · ${t.license}`;
    p.classList.remove('turning');
  }, 300);
}

/* ---------------------------------------------------------------- 곡 내력 */

const NONCOMMERCIAL = /non-commercial/i;

function renderLedger(t) {
  const box = $('ledger');
  if (!t) { box.innerHTML = '<p class="empty">한 곡 부르기 시작하면 내력과 이용 허락이 여기 적힙니다.</p>'; return; }
  const warn = NONCOMMERCIAL.test(t.license)
    ? `<p class="warn-note">이 곡은 <strong>비상업 조건</strong>입니다. 혼자 듣는 건 괜찮으나 수익이 나는 자리에는 쓰지 마십시오.</p>` : '';
  box.innerHTML = `
    <dl>
      <dt>곡</dt><dd>${esc(t.title)}</dd>
      <dt>부른 이</dt><dd>${esc(t.artist)}</dd>
      <dt>장면</dt><dd><span class="scene-chip">${esc(SCENE_NAME[t.scene] || t.scene)}</span>
        <span class="scene-cat">${esc(SCENE_CAT[t.scene] || '')}</span></dd>
      <dt>길이</dt><dd>${fmt(t.length)} · 집중도 ${t.focus}/5</dd>
      <dt>이용 허락</dt><dd>${esc(t.license)}</dd>
      <dt>원곡</dt><dd><a href="https://www.youtube.com/watch?v=${t.videoId}" target="_blank" rel="noopener">YouTube에서 열기 ↗</a></dd>
    </dl>${warn}`;
}

/* ---------------------------------------------------------------- 재생 */

function play(i) {
  if (!state.queue.length) return;
  const idx = ((i % state.queue.length) + state.queue.length) % state.queue.length;
  const t = state.queue[idx];
  state.index = idx;

  turnParchment(t);
  renderLedger(t);
  renderList();
  scrollToCurrent();
  refreshHall();
  markCurrentScene(t.scene);
  secrets.noteScene(t.scene, SCENES.length);
  setScroll(`${t.title} — ${t.artist}`);
  $('tag-scene').textContent = SCENE_NAME[t.scene] || '—';
  $('tag-scene').classList.add('on');

  const sr = $('sr-status');
  if (sr) sr.textContent = `부르는 중: ${t.title}, ${t.artist}. 장면 ${SCENE_NAME[t.scene] || ''}. ${idx + 1}번째 곡, 모두 ${state.queue.length}곡.`;

  if (yt && state.ready) { yt.loadVideoById(t.videoId); yt.setVolume(state.volume); }
}

function next() {
  if (!state.queue.length) return;
  if (state.shuffle) {
    let n = state.index;
    if (state.queue.length > 1) while (n === state.index) n = Math.floor(Math.random() * state.queue.length);
    play(n); return;
  }
  if (state.index + 1 >= state.queue.length) {
    if (state.repeat) play(0);
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
  if (state.playing) yt.pauseVideo(); else yt.playVideo();
}

function stop() {
  if (yt && state.ready) yt.stopVideo();
  state.playing = false;
  setBurning(false);
  setBardState($('bard-stage'), 'idle');
  releaseWake();
  updateControls();
}

function updateControls() {
  $('btn-play').textContent = state.playing ? '❚❚' : '▶';
  $('btn-play').setAttribute('aria-label', state.playing ? '멈추기' : '부르기');
  $('tag-play').classList.toggle('on', state.playing);
  $('tag-shuffle').classList.toggle('on', state.shuffle);
  $('tag-repeat').classList.toggle('on', state.repeat);
  $('btn-shuffle').setAttribute('aria-pressed', String(state.shuffle));
  $('btn-repeat').setAttribute('aria-pressed', String(state.repeat));
}

/* ---------------------------------------------------------------- 표시 */

function setScroll(text) {
  const m = $('scroll');
  m.innerHTML = `<span>${esc(text)}</span>`;
  m.classList.toggle('short', text.length < 32);
}

function fmt(sec) {
  if (!sec && sec !== 0) return '--:--';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* 소리결 — YouTube 는 오디오 데이터를 주지 않으므로 그럴듯한 곡선을 흉내 낸다 */
function buildFlames() {
  const f = $('flames');
  f.innerHTML = '';
  for (let i = 0; i < 26; i++) f.appendChild(document.createElement('i'));
}

let phase = 0;
function stepFlames() {
  const bars = $('flames').children;
  phase += 0.26;
  for (let i = 0; i < bars.length; i++) {
    if (!state.playing) { bars[i].style.height = '7%'; continue; }
    const tilt = 1 - (i / bars.length) * 0.7;
    const wob = Math.sin(phase + i * 0.55) * 0.5 + Math.sin(phase * 1.7 + i * 0.21) * 0.5;
    bars[i].style.height = `${Math.min(100, Math.max(7, (0.46 + wob * 0.42) * 100 * tilt))}%`;
  }
}

function stepTime() {
  if (!yt || !state.ready || state.index < 0) return;
  const cur = yt.getCurrentTime?.() ?? 0;
  const dur = yt.getDuration?.() ?? 0;
  $('sign-time').textContent = fmt(cur);
  if (!state.seeking && dur > 0) $('seek').value = String(Math.round((cur / dur) * 1000));
}

/* ---------------------------------------------------------------- 재생 실패 처리 */

const PERMANENT_ERRORS = new Set([2, 100, 101, 150]);
const ERROR_REASON = {
  2: '곡 주소가 어긋났습니다',
  5: '재생기가 이 곡을 열지 못했습니다',
  100: '곡이 지워졌거나 비공개가 되었습니다',
  101: '올린 이가 바깥 재생을 막아 두었습니다',
  150: '올린 이가 바깥 재생을 막아 두었습니다',
};
let retriedOnce = null;

function handlePlaybackError(code) {
  const bad = state.queue[state.index];
  if (!bad) return;
  if (code === 5 && retriedOnce !== bad.videoId) {
    retriedOnce = bad.videoId;
    setTimeout(() => { if (yt && state.ready) yt.loadVideoById(bad.videoId); }, 600);
    return;
  }
  console.warn(`재생 불가(코드 ${code}), 건너뜀:`, bad.videoId, bad.title);
  if (PERMANENT_ERRORS.has(code)) deadIds.add(bad.videoId);
  dropCurrent(ERROR_REASON[code] || '이 곡은 부를 수가 없군요');
}

function dropCurrent(reason) {
  if (!state.queue[state.index]) return;
  state.queue.splice(state.index, 1);
  state.failStreak += 1;
  state.skipped += 1;
  $('list-count').textContent = `${state.queue.length}곡`;
  renderList();

  if (!state.queue.length) { stop(); say('부를 수 있는 곡이 다 떨어졌습니다. 다시 짜 볼까요?', 'talk'); return; }
  if (state.failStreak >= MAX_FAIL_STREAK) {
    stop();
    say(`${MAX_FAIL_STREAK}곡을 내리 부르지 못했습니다. 연결을 살펴봐 주십시오.`, 'talk');
    state.failStreak = 0;
    return;
  }
  if (state.skipped === 1 || state.skipped % 5 === 0) {
    say(`${reason}. 건너뛰겠습니다. (여태 ${state.skipped}곡)`);
  }
  play(state.index);
}

/* 멈춤 감지 — 오류를 내지 않고 무한히 버퍼링하는 경우 */
let lastTime = -1, stalledTicks = 0;
const STALL_LIMIT = 120;   // 120ms * 120 ≈ 15초

function checkStall() {
  if (!state.playing || !yt || !state.ready || state.index < 0) { stalledTicks = 0; lastTime = -1; return; }
  const t = yt.getCurrentTime?.() ?? 0;
  if (Math.abs(t - lastTime) < 0.05) {
    if (++stalledTicks >= STALL_LIMIT) { stalledTicks = 0; dropCurrent('노래가 멎어 버렸습니다'); }
  } else { stalledTicks = 0; state.failStreak = 0; }
  lastTime = t;
}

/* ---------------------------------------------------------------- 장면 서랍 */

const picked = new Set();

function buildSceneBrowser() {
  const box = $('scene-browser');
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
      b.title = `${sc.name} — ${sc.count}곡 (일하며 듣기 좋은 곡 ${calm})`;
      b.innerHTML = `<span class="nm">${esc(sc.name)}</span><span class="ct">${sc.count}</span>`;
      b.addEventListener('click', () => onSceneClick(sc, b));
      grid.appendChild(b);
    }
    g.appendChild(grid);
    box.appendChild(g);
  }
}

const multiMode = () => $('scene-multi')?.checked;

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
  $('scene-picked').textContent = `${picked.size}개 골랐음`;
  $('btn-scene-play').disabled = picked.size === 0;
}

function clearPicked() {
  picked.clear();
  for (const b of document.querySelectorAll('.scene-btn')) b.setAttribute('aria-pressed', 'false');
  renderPicked();
}

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
  if (!pool.length) { say('그 장면엔 곡이 없군요.'); return; }
  loadQueue(spreadByArtist(pool));
  say(`${label || `${ids.length}개 장면`} — ${state.queue.length}곡 걸었습니다.`);
  play(0);
}

function markCurrentScene(sceneId) {
  for (const b of document.querySelectorAll('.scene-btn')) {
    b.classList.toggle('is-current', b.dataset.scene === sceneId);
  }
}

function initSceneBrowser() {
  const toggle = $('btn-scenes-toggle');
  const box = $('scene-browser');
  const actions = $('scene-actions');
  buildSceneBrowser();

  toggle.addEventListener('click', () => {
    const open = box.hidden;
    box.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '▲' : '▼';
    actions.hidden = !open || !multiMode();
  });
  $('scene-multi').addEventListener('change', (e) => {
    actions.hidden = !e.target.checked || box.hidden;
    if (!e.target.checked) clearPicked();
    else say('여러 장면을 골라 합칠 수 있습니다. 다 고르시면 눌러 주십시오.');
  });
  $('btn-scene-play').addEventListener('click', () => {
    if (!picked.size) return;
    const names = SCENES.filter((s) => picked.has(s.id)).map((s) => s.name);
    playScenes([...picked], names.length > 2 ? `${names[0]} 외 ${names.length - 1}개` : names.join(' · '));
  });
  $('btn-scene-clear').addEventListener('click', clearPicked);
  renderPicked();
}

/* ---------------------------------------------------------------- 등불 (Wake Lock)

   휴대폰에서 화면이 꺼지면 소리가 멎는다. 진짜 백그라운드 재생은 YouTube 가
   Premium 기능으로 막아 두어 임베드로는 불가능하다. 다만 "탁자에 얹어 뒀더니
   화면이 꺼져 멎었다"는 가장 흔한 경우는 화면을 켜 두면 해결된다. */

let wakeLock = null, wakeDenied = false;
const wakeSupported = 'wakeLock' in navigator;

async function acquireWake() {
  if (!wakeSupported || !state.wakeWanted || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeDenied = false;
    wakeLock.addEventListener('release', () => { wakeLock = null; renderWake(); });
  } catch { wakeLock = null; wakeDenied = true; }
  renderWake();
}

async function releaseWake() {
  try { await wakeLock?.release(); } catch { /* 이미 풀림 */ }
  wakeLock = null;
  renderWake();
}

function renderWake() {
  const btn = $('btn-wakelock');
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(state.wakeWanted));
  let label = '꺼짐';
  if (!wakeSupported) label = '없음';
  else if (!state.wakeWanted) label = '꺼짐';
  else if (wakeLock) label = '켜짐';
  else if (wakeDenied) label = '거절';
  else label = '대기';
  $('wake-state').textContent = label;
}

function initWake() {
  const btn = $('btn-wakelock');
  if (!wakeSupported) { btn.disabled = true; btn.title = '이 브라우저는 화면 켜두기를 지원하지 않습니다.'; renderWake(); return; }
  btn.addEventListener('click', async () => {
    state.wakeWanted = !state.wakeWanted;
    if (state.wakeWanted) {
      wakeDenied = false;
      await acquireWake();
      say(wakeDenied
        ? '브라우저가 거절했습니다. 절전 모드가 켜져 있으면 끄고 다시 눌러 주십시오.'
        : '부르는 동안 등불을 켜 두겠습니다. 배터리는 좀 더 씁니다.');
    } else { await releaseWake(); say('등불을 껐습니다.'); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.playing) acquireWake();
  });
  renderWake();
}

function initMobileNote() {
  const note = $('mobile-note');
  const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;
  note.hidden = !isTouch;
}

/* ---------------------------------------------------------------- 숨겨 둔 것들 */

function renderSecrets() {
  const all = Object.entries(secrets.SECRETS);
  const got = secrets.found();
  $('secret-count').textContent = `찾은 것 ${got.size} / ${all.length}`;
  $('secret-list').innerHTML = all.map(([id, s]) => {
    const has = got.has(id);
    return `<div class="secret-row ${has ? 'got' : ''}">
      <span class="mark">${has ? '✦' : '·'}</span>
      <span class="nm">${has ? esc(s.label) : '???'}</span>
      <span class="ht">${has ? esc(s.hint) : '아직 찾지 못했습니다'}</span>
    </div>`;
  }).join('');
}

function initSecrets() {
  secrets.onSecret((id, s, n) => {
    renderSecrets();
    say(`— ${s.label}. 명부에 적어 두었습니다. (${n}/${Object.keys(secrets.SECRETS).length})`, 'talk');
  });

  $('btn-ledger-toggle').addEventListener('click', (e) => {
    const box = $('secret-list');
    const open = box.hidden;
    box.hidden = !open;
    e.currentTarget.setAttribute('aria-expanded', String(open));
    e.currentTarget.textContent = open ? '▲' : '▼';
  });

  // 문간 종
  $('doorbell').addEventListener('click', () => {
    sfx.doorBell();
    secrets.find('bell');
    say(currentPhase().greet, 'talk');
  });

  // 화로 — 걸린 게 있으면 먹고, 없으면 쿡 찌른다
  const hearth = $('hearth');
  const onHearth = () => {
    const { id: dishId, dish, stage } = roast.peek();

    if (!dish.art) {            // 빈 화로 — 장작만 쑤신다
      sfx.crackle();
      hearth.classList.add('poked');
      setTimeout(() => hearth.classList.remove('poked'), 1200);
      secrets.find('hearth');
      say(dish.done);
      return;
    }

    const slot = $('roast');
    const res = roast.bite();
    if (!res.ate) { sfx.crackle(); say(dish.done); return; }

    slot.classList.add('eaten');
    setTimeout(() => slot.classList.remove('eaten'), 500);
    if (dishId === 'cauldron') sfx.bubble();
    sfx.munch();
    secrets.find('hearth');
    noteEaten(res.dish);

    // 익은 정도에 따라 하는 말이 다르다
    const line = { raw: dish.raw, cooking: dish.cooking, done: dish.done, burnt: dish.burnt }[stage.id];
    say(`${line} ${dish.eaten}`);
  };
  hearth.addEventListener('click', onHearth);
  hearth.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); onHearth(); }
  });

  // 바드에게 말 걸기
  const stage = $('bard-stage');
  const talk = () => {
    const n = secrets.noteTalk();
    sfx.pluck(220 + Math.random() * 220);
    const lines = [
      '예, 듣고 있습니다.',
      '무슨 일이십니까?',
      '줄이 좀 늘어졌군요. 잠시만.',
      '이 홀은 밤이 길지요.',
      '먼 길 오셨습니까?',
      '노래 말고도 이야기는 많습니다만.',
      '자꾸 부르시니 한 곡 더 해 드리고 싶어지는군요.',
    ];
    say(lines[Math.min(n, lines.length) - 1] || lines[lines.length - 1], 'talk');
  };
  stage.addEventListener('click', talk);
  stage.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); talk(); }
  });

  // 잔 부딪기 — 머리말의 곡 수를 누르면
  $('stat-count').classList.add('cup');
  $('stat-count').title = '잔을 부딪쳐 본다';
  $('stat-count').addEventListener('click', () => { sfx.clink(); secrets.find('toast'); });

  // 옛 주문
  secrets.watchSpell(() => {
    const list = secrets.legendaryList(BGM_BY_SCENE);
    loadQueue(list);
    say('…그 가락을 아시는군요. 서른네 장면에서 가장 좋은 것만 뽑아 두었습니다.', 'talk');
    play(0);
  });

  renderSecrets();
}


/* ---------------------------------------------------------------- 화로에 걸어 둔 것 */

let roast = null;

/** 먹어 본 요리를 세어 둔다 — 다 먹어 보면 명부에 적힌다 */
const EATEN_KEY = 'rpgbgm.eaten';
function noteEaten(dish) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(EATEN_KEY) || '[]'));
    v.add(dish.label);
    localStorage.setItem(EATEN_KEY, JSON.stringify([...v]));
    const total = Object.values(DISHES).filter((d) => d.eatable).length;
    if (v.size >= total) secrets.find('gourmet');
  } catch { /* noop */ }
}

function initRoast() {
  const slot = $('roast');
  const tag = $('hearth-dish');
  const hearth = $('hearth');
  roast = startRoast({
    slot,
    onChange: (dish, stage) => {
      tag.textContent = stage ? `${dish.label} · ${stage.label}` : dish.label;
      hearth.dataset.bite = dish.art && dish.eatable ? '1' : '0';
      hearth.setAttribute('aria-label', stage
        ? `화로. ${dish.label}이(가) ${stage.label} 상태입니다. 눌러서 먹습니다.`
        : '화로. 눌러서 장작을 쑤셔 봅니다.');
    },
    onSizzle: () => { if (!document.hidden) sfx.sizzle(); },
  });
}

/* ---------------------------------------------------------------- 시각 */

function renderPhase(p) {
  $('phase-chip').textContent = p.label;
  secrets.checkNightOwl(p.id);
}

function initPhase() {
  const p = startLight(renderPhase);
  renderPhase(p);
  // 눌러서 시간대를 돌려 본다 (실제 시각으로 되돌아오는 자리 포함)
  $('phase-chip').addEventListener('click', () => {
    const ids = [null, ...PHASES.map((x) => x.id)];
    const cur = document.documentElement.dataset.phase;
    const manualNow = $('phase-chip').dataset.manual === '1';
    const i = manualNow ? ids.indexOf(cur) : 0;
    const nextId = ids[(i + 1) % ids.length];
    const np = setPhase(nextId);
    $('phase-chip').dataset.manual = nextId ? '1' : '0';
    renderPhase(np);
    say(nextId ? `${np.label}의 홀입니다.` : '실제 시각으로 되돌렸습니다.');
  });
}

/* ---------------------------------------------------------------- YouTube */

function initYt() {
  yt = new YT.Player('yt-player', {
    height: '1', width: '1',
    host: 'https://www.youtube-nocookie.com',
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, origin: location.origin },
    events: {
      onReady: () => {
        state.ready = true;
        yt.setVolume(state.volume);
        say(currentPhase().greet, 'talk');
        startAsk();
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          state.playing = true;
          setBurning(true);
          setBardState($('bard-stage'), 'play');
          acquireWake();
        } else if (e.data === YT.PlayerState.PAUSED) {
          state.playing = false;
          setBurning(false);
          setBardState($('bard-stage'), 'idle');
          releaseWake();
        } else if (e.data === YT.PlayerState.ENDED) {
          state.playing = false;
          next();
        }
        updateControls();
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
    state.shuffle = !state.shuffle; updateControls();
    say(state.shuffle ? '순서는 지키지 않겠습니다.' : '적힌 순서대로 가겠습니다.');
  });
  $('btn-repeat').addEventListener('click', () => {
    state.repeat = !state.repeat; updateControls();
    say(state.repeat ? '끝나면 처음부터 다시 돌리겠습니다.' : '한 바퀴만 돌고 접겠습니다.');
  });

  $('btn-reshuffle').addEventListener('click', () => {
    const cur = state.queue[state.index];
    state.queue = state.queue.map((t) => [Math.random(), t]).sort((a, b) => a[0] - b[0]).map(([, t]) => t);
    state.index = cur ? state.queue.findIndex((t) => t.videoId === cur.videoId) : -1;
    renderList(); scrollToCurrent();
    say('순서를 섞었습니다.');
  });

  $('btn-shuffle-all').addEventListener('click', () => {
    const pool = ALL_TRACKS.filter((t) => t.focus >= 4);
    const picked_ = pool.map((t) => [Math.random(), t]).sort((a, b) => a[0] - b[0]).slice(0, 40).map(([, t]) => t);
    loadQueue(picked_);
    say('묻지 않고 아무거나 마흔 곡 뽑았습니다.');
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

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'ArrowRight' && e.shiftKey) { e.preventDefault(); next(); }
    else if (e.code === 'ArrowLeft' && e.shiftKey) { e.preventDefault(); prev(); }
  });
}

function boot() {
  $('bard-stage').innerHTML = bardArt();
  $('bard-name').textContent = BARD_NAME;
  $('stat-count').textContent = ALL_TRACKS.length.toLocaleString('ko-KR');
  $('credit-list').textContent = CREDITS.join(' · ');
  buildFlames();
  buildHallPicker();
  initPhase();
  refreshHall();
  wire();
  updateControls();
  initWake();
  initMobileNote();
  initSceneBrowser();
  initRoast();
  initSecrets();

  const seed = buildFromAnswers(DEFAULT_ANSWERS, BGM_BY_SCENE, 40);
  loadQueue(seed.tracks);
  setScroll('음유시인에게 한 마디 건네면 골라 드립니다 —');

  tick = setInterval(() => { stepFlames(); stepTime(); checkStall(); }, 120);

  if (window.YT && window.YT.Player) initYt();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
