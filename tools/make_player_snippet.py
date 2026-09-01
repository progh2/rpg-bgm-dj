# -*- coding: utf-8 -*-
"""Emit a drop-in JS module matching the mini-homepage player shape {id,title,artist,videoId}."""
import json, datetime
doc = json.load(open("data/bgm_playlist.json"))
subs = [(c["name"], s) for c in doc["categories"] for s in c["subcategories"]]
today = datetime.date.today().isoformat()

# 아티스트·라이선스 문자열이 1,300회 넘게 반복된다. 표로 빼고 색인만 남긴다.
ARTISTS, LICENSES = [], []
_ai, _li = {}, {}
def _idx(v, arr, cache):
    if v not in cache:
        cache[v] = len(arr); arr.append(v)
    return cache[v]

def track(t):
    return [t["id"], t["title"], _idx(t["artist"], ARTISTS, _ai), t["videoId"],
            t["focus"], t["length"], _idx(t["license"], LICENSES, _li)]

lines = [
 "// bgm-scenes.js — auto-generated %s" % today,
 "// 고전 콘솔 RPG 장면 분류(34종) 기반 무료 라이선스 BGM 목록.",
 "// focus: 1(집중 방해) ~ 5(작업용 최적)",
 "//",
 "// 전송량을 줄이려고 아티스트·라이선스는 표로 빼고 트랙은 색인만 갖는다.",
 "// import 시점에 원래 객체 형태로 되돌리므로 쓰는 쪽 코드는 바뀌지 않는다:",
 "//   { id, title, artist, videoId, focus, length, license }",
 "",
 "export const SCENES = [",
]
for cat, s in subs:
    lines.append("  { id: %s, category: %s, name: %s, count: %d }," % (
        json.dumps(s["id"]), json.dumps(cat, ensure_ascii=False), json.dumps(s["name"], ensure_ascii=False), s["count"]))
lines += ["];", ""]

# 트랙을 먼저 만들어 ARTISTS / LICENSES 표를 채운다.
packed = {}
for cat, s in subs:
    packed[s["id"]] = [track(t) for t in sorted(s["tracks"], key=lambda t: (-t["focus"], t["title"]))]

lines.append("const A = " + json.dumps(ARTISTS, ensure_ascii=False) + ";")
lines.append("const L = " + json.dumps(LICENSES, ensure_ascii=False) + ";")
lines.append("")
lines.append("/** [id, title, artistIdx, videoId, focus, length, licenseIdx] */")
lines.append("const RAW = {")
for cat, s in subs:
    lines.append("  // %s / %s" % (cat, s["name"]))
    lines.append("  %s: [" % json.dumps(s["id"]))
    for row in packed[s["id"]]:
        lines.append("    " + json.dumps(row, ensure_ascii=False) + ",")
    lines.append("  ],")
lines.append("};")
lines.append("")
lines.append("const hydrate = (r) => ({ id: r[0], title: r[1], artist: A[r[2]], videoId: r[3], focus: r[4], length: r[5], license: L[r[6]] });")
lines.append("")
lines.append("export const BGM_BY_SCENE = Object.fromEntries(")
lines.append("  Object.entries(RAW).map(([k, v]) => [k, v.map(hydrate)])")
lines.append(");")
lines += [
 "",
 "/** 모든 트랙 (평탄화) */",
 "export const ALL_TRACKS = Object.entries(BGM_BY_SCENE).flatMap(([scene, ts]) => ts.map(t => ({ ...t, scene })));",
 "",
 "/** 작업용 기본 재생목록: 집중도 4 이상만, 장면을 섞어 셔플 */",
 "export const FOCUS_PLAYLIST = ALL_TRACKS.filter(t => t.focus >= 4);",
 "",
 "/** 장면 id 배열로 재생목록 만들기. 예: buildPlaylist(['B2_town','A4_inn'], 4) */",
 "export function buildPlaylist(sceneIds, minFocus = 1) {",
 "  return sceneIds.flatMap(id => (BGM_BY_SCENE[id] || []).filter(t => t.focus >= minFocus));",
 "}",
 "",
 "/** 재생기 크레딧 문구 (현재 트랙 기준) */",
 "export function creditFor(track) {",
 "  return track ? `${track.artist} — ${track.license}` : '';",
 "}",
 "",
 "/** 전체 크레딧 (한 번에 표기할 때) */",
 "export const CREDITS = [...new Set(ALL_TRACKS.map(t => `${t.artist} (${t.license})`))].sort();",
]
open("bgm-scenes.js", "w", encoding="utf-8").write("\n".join(lines) + "\n")
n = sum(s["count"] for _, s in subs)
print("bgm-scenes.js written:", n, "tracks,", len(subs), "scenes")
