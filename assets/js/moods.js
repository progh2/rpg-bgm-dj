// moods.js — 34개 장면을 10가지 무드로 묶고, 무드마다 팔레트를 준다.
// 재생 중인 곡에 따라 페이지 배색을 바꾸는 데 쓰인다 (issue #5).

export const MOODS = {
  calm:     { label: '평온',    accent: '#7fd0bd', deep: '#124b45', glow: '#bff0e6', record: '#2f7d70' },
  pastoral: { label: '한가로움', accent: '#a8cf74', deep: '#2c4a1f', glow: '#dcf2b4', record: '#4f7a30' },
  wonder:   { label: '신비',    accent: '#bb96e8', deep: '#31255c', glow: '#e2d0ff', record: '#6a45a8' },
  tender:   { label: '애틋함',  accent: '#eda0b4', deep: '#4e2137', glow: '#ffd6e2', record: '#a34a68' },
  sorrow:   { label: '애도',    accent: '#8fb0d8', deep: '#1d2f4c', glow: '#cde0f7', record: '#3d5f8f' },
  noble:    { label: '당당',    accent: '#e2bb63', deep: '#4a3711', glow: '#ffe7ad', record: '#9c7420' },
  dread:    { label: '불길',    accent: '#9887b8', deep: '#282040', glow: '#cdbfe4', record: '#4a3a63' },
  ember:    { label: '격렬',    accent: '#e8763f', deep: '#521f0e', glow: '#ffbf9b', record: '#b55a1e' },
  frost:    { label: '서늘함',  accent: '#79c6e0', deep: '#123f50', glow: '#bde9f8', record: '#2c718c' },
  merry:    { label: '흥겨움',  accent: '#f0b13c', deep: '#4f2c0b', glow: '#ffdcaa', record: '#a86020' },
};

/** 장면 → 무드 */
export const SCENE_MOOD = {
  A1_prelude: 'wonder',   A2_victory: 'merry',    A3_levelup: 'merry',    A4_inn: 'calm',
  A5_gameover: 'sorrow',  A6_save: 'wonder',
  B1_overworld: 'pastoral', B2_town: 'pastoral',  B3_castle: 'noble',     B4_dungeon: 'dread',
  B5_temple: 'wonder',    B6_vehicle: 'frost',    B7_terrain: 'pastoral', B8_ruinworld: 'sorrow',
  B9_final: 'dread',
  C1_battle: 'ember',     C2_boss: 'ember',       C3_rival: 'ember',      C4_finalboss: 'ember',
  C5_resolve: 'noble',    C6_chase: 'ember',
  D1_sorrow: 'sorrow',    D2_memory: 'tender',    D3_love: 'tender',      D4_hope: 'merry',
  D5_heroic: 'noble',     D6_ominous: 'dread',    D7_villain: 'dread',    D8_comic: 'merry',
  D9_mystic: 'wonder',    D10_charthm: 'noble',   D11_festival: 'merry',  D12_opening: 'wonder',
  D13_ending: 'tender',
};

export const moodKeyOf = (sceneId) => SCENE_MOOD[sceneId] || 'calm';
export const moodOf = (sceneId) => MOODS[moodKeyOf(sceneId)];
