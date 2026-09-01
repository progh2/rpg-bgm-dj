// moods.js — 34개 장면을 10가지 무드로 묶고, 무드마다 팔레트를 준다.
// 재생 중인 곡에 따라 페이지 배색을 바꾸는 데 쓰인다 (issue #5).

export const MOODS = {
  calm:     { label: '평온',    accent: '#5fd6c0', deep: '#15564e', glow: '#9ff5e4', record: '#2f7d70' },
  pastoral: { label: '한가로움', accent: '#9ed46b', deep: '#315021', glow: '#d6f5a8', record: '#4f7a30' },
  wonder:   { label: '신비',    accent: '#b48cf0', deep: '#342663', glow: '#ddc8ff', record: '#6a45a8' },
  tender:   { label: '애틋함',  accent: '#f095b8', deep: '#54233c', glow: '#ffd0e2', record: '#a34a68' },
  sorrow:   { label: '애도',    accent: '#7fa6d9', deep: '#1e3050', glow: '#c3daf7', record: '#3d5f8f' },
  noble:    { label: '당당',    accent: '#e8bc5a', deep: '#4d3a11', glow: '#ffe6a8', record: '#9c7420' },
  dread:    { label: '불길',    accent: '#8f7bb5', deep: '#2b2140', glow: '#c4b3e0', record: '#4a3a63' },
  ember:    { label: '격렬',    accent: '#e8663f', deep: '#54200f', glow: '#ffb495', record: '#a13a1c' },
  frost:    { label: '서늘함',  accent: '#67c6e8', deep: '#124253', glow: '#b3e9fb', record: '#2c718c' },
  merry:    { label: '흥겨움',  accent: '#f5aa05', deep: '#542c0c', glow: '#ffd4a3', record: '#a86020' },
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
