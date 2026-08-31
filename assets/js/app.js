// app.js — 재생기 본체 (issues #1 #4 #5 #6 #7)

import { BGM_BY_SCENE, SCENES, ALL_TRACKS, CREDITS } from '../../bgm-scenes.js';
import { moodOf, moodKeyOf, MOODS } from './moods.js';
import { SKINS, MOOD_SKIN, applyTheme, loadSkinPref, saveSkinPref } from './skins.js';
import { QUESTIONS, buildFromAnswers, DEFAULT_ANSWERS, pickChatter } from './dj.js';
import { djSvg, setDjState, DJ_NAME } from './character.js';
import { icon } from './icons.js';

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
};

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
    b.innerHTML = `<span class="swatch">
        <i style="background:${skin.vars['--chrome-face']}"></i>
        <i style="background:${skin.vars['--lcd-ink']}"></i>
        <i style="background:${skin.vars['--chrome-dark']}"></i>
      </span>${skin.label}`;
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
  state.queue = tracks;
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
      <dt>장면</dt><dd><span class="scene-chip">${escapeHtml(scene)}</span> <span style="color:var(--text-dim)">${escapeHtml(cat)}</span></dd>
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

/* ---------------------------------------------------------------- YouTube */

function initYt() {
  yt = new YT.Player('yt-player', {
    height: '1', width: '1',
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
        } else if (e.data === YT.PlayerState.PAUSED) {
          state.playing = false;
          setSpinning(false);
          setDjState($('dj-stage'), 'idle');
        } else if (e.data === YT.PlayerState.ENDED) {
          state.playing = false;
          next(true);
        }
        updateTransport();
      },
      onError: () => {
        // 삭제/임베드 차단 영상은 조용히 건너뛴다.
        const bad = state.queue[state.index];
        if (bad) console.warn('재생 불가, 건너뜀:', bad.videoId, bad.title);
        state.queue.splice(state.index, 1);
        $('pl-count').textContent = `${state.queue.length}곡`;
        if (state.queue.length) play(state.index);
        else say('재생할 수 있는 곡이 없어졌어. 다시 골라볼까?', 'talk');
      },
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
  refreshTheme();
  wire();
  updateTransport();

  // 기본 재생목록: 질답 전에도 바로 틀 수 있게 준비만 해둔다.
  const seed = buildFromAnswers(DEFAULT_ANSWERS, BGM_BY_SCENE, 40);
  loadQueue(seed.tracks);
  setMarquee('DJ에게 취향을 말해주면 다시 골라줄게 —');

  tick = setInterval(() => { stepViz(); stepTime(); }, 120);

  // YouTube API가 이미 로드된 경우
  if (window.YT && window.YT.Player) initYt();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
