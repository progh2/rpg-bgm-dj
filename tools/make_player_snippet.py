# -*- coding: utf-8 -*-
"""Emit a drop-in JS module matching the mini-homepage player shape {id,title,artist,videoId}."""
import json, datetime
doc = json.load(open("data/bgm_playlist.json"))
subs = [(c["name"], s) for c in doc["categories"] for s in c["subcategories"]]
today = datetime.date.today().isoformat()

def track(t):
    return {"id": t["id"], "title": t["title"], "artist": t["artist"], "videoId": t["videoId"],
            "focus": t["focus"], "license": t["license"]}

lines = [
 "// bgm-scenes.js — auto-generated %s" % today,
 "// 고전 콘솔 RPG 장면 분류(34종) 기반 무료 라이선스 BGM 목록.",
 "// 트랙 형태는 mini-homepage 재생기와 동일: { id, title, artist, videoId }",
 "// focus: 1(집중 방해) ~ 5(작업용 최적)",
 "",
 "export const SCENES = [",
]
for cat, s in subs:
    lines.append("  { id: %s, category: %s, name: %s, count: %d }," % (
        json.dumps(s["id"]), json.dumps(cat, ensure_ascii=False), json.dumps(s["name"], ensure_ascii=False), s["count"]))
lines += ["];", "", "export const BGM_BY_SCENE = {"]
for cat, s in subs:
    lines.append("  // %s / %s" % (cat, s["name"]))
    lines.append("  %s: [" % json.dumps(s["id"]))
    for t in sorted(s["tracks"], key=lambda t: (-t["focus"], t["title"])):
        lines.append("    " + json.dumps(track(t), ensure_ascii=False) + ",")
    lines.append("  ],")
lines += [
 "};", "",
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
