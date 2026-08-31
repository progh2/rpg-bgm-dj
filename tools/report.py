# -*- coding: utf-8 -*-
import json, datetime
from collections import Counter
doc=json.load(open("data/bgm_playlist.json"))
L=[]
L.append("# 작업용 BGM 재생기를 위한 무료 라이선스 음원 목록 (장면 유형별)\n")
L.append(f"> 생성일 {doc['generated']} · 재생기 형식 `{{id,title,artist,videoId}}` (YouTube IFrame) · 집중도 `focus` 1~5 (5 = 작업용 최적)\n")
L.append("> 데이터 파일: `data/bgm_playlist.json` (전체), `data/bgm_playlist.csv`, `bgm-scenes.js` (미니홈피 재생기에 바로 import 가능)\n")
tot=sum(s["count"] for c in doc["categories"] for s in c["subcategories"])
arts=Counter(t["artist"] for c in doc["categories"] for s in c["subcategories"] for t in s["tracks"])
lics=Counter(t["license"] for c in doc["categories"] for s in c["subcategories"] for t in s["tracks"])
L.append(f"\n**총 {tot}곡 / {len(arts)} 아티스트 / 34 소분류.** 모든 영상은 YouTube oEmbed로 존재·임베드 가능 여부를 검증함.\n")
L.append("\n## 라이선스 요약\n\n| 라이선스 | 곡 수 | 비고 |\n|---|---|---|")
note={"CC BY 4.0":"출처 표기만 하면 상업 이용 포함 자유","CC BY 3.0":"출처 표기","CC BY 3.0/4.0":"출처 표기","CC0":"표기 불필요(퍼블릭 도메인 헌정)","CC0 / CC BY":"출처 표기 권장",
      "CC BY (YouTube license flag, uploader-declared)":"업로더가 YouTube에 CC BY로 표시한 영상 — 원저작자 확인 권장(보완용)"}
for k,v in lics.most_common():
    L.append(f"| {k} | {v} | {note.get(k, '해당 사이트 이용약관에 따라 무료 (대개 출처 표기)')} |")
L.append("\n> **재생기 크레딧 문구 예시**: `Music: PeriTune (CC BY 4.0), Kevin MacLeod (incompetech.com, CC BY 4.0), Steven O'Brien (CC BY 4.0), 魔王魂, DOVA-SYNDROME ...` — 재생 중인 곡의 `artist`/`license`를 그대로 표시하면 충분.\n")
L.append("\n## 아티스트별 곡 수\n")
L.append(", ".join(f"{a} {n}" for a,n in arts.most_common()))
L.append("\n\n## 소분류별 목록\n")
L.append("각 소분류마다 집중도 순 상위 곡을 표시. 전체 목록은 JSON/CSV 참조.\n")
for c in doc["categories"]:
    L.append(f"\n## {c['name']}\n")
    for s in c["subcategories"]:
        f4=sum(1 for t in s["tracks"] if t["focus"]>=4)
        L.append(f"\n### {s['id']} · {s['name']} — {s['count']}곡 (작업용 focus≥4: {f4})\n")
        L.append("| focus | 제목 | 아티스트 | 길이 | 라이선스 | 링크 |\n|---|---|---|---|---|---|")
        for t in sorted(s["tracks"], key=lambda t:(-t["focus"], -(t["length"] or 0)))[:15]:
            m,sec=divmod(t["length"] or 0,60)
            L.append(f"| {t['focus']} | {t['title'][:60].replace('|','/')} | {t['artist'][:22]} | {m}:{sec:02d} | {t['license'].split(' (')[0][:14]} | [▶](https://www.youtube.com/watch?v={t['videoId']}) |")
        if s["count"]>15: L.append(f"\n_(+{s['count']-15}곡 더 — JSON 참조)_")
L.append("\n\n## 수집 방법 및 주의\n")
L.append("""- **출처**: 무료 라이선스 작곡가의 **공식 YouTube 채널** 업로드 목록(48채널)을 전수 수집한 뒤 제목 키워드(영/일/한)로 34개 장면 소분류에 배정. incompetech(Kevin MacLeod)은 공식 메타데이터(feel/genre), PeriTune은 공식 사이트 태그, PANICPUMPKIN은 공식 사이트의 장면 분류(RPG戦闘ザコ/ボス/ダンジョン/村…)를 그대로 사용.
- **보완**: 곡 수가 25곡 미만인 소분류는 YouTube의 'Creative Commons' 검색 필터 결과로 채움 (`origin: cc_search`). 이 항목은 업로더 자기신고 라이선스이므로 상업 이용 시 원저작자 확인 권장.
- **검증**: 전 곡 oEmbed 응답 200 확인(삭제/비공개/임베드 금지 영상 제외). 단, 시간이 지나면 삭제될 수 있으니 재생기에서 `onError` 시 다음 곡으로 넘기는 처리를 권장.
- **분류 한계**: 제목 기반 자동 분류라 오분류가 섞여 있음(특히 `D5 당당`, `D6 불길`, `B7 지형`은 넓게 잡힘). `alts` 필드에 차순위 분류를 넣어 두었음.
- **작업용 추천**: `focus ≥ 4`만 모은 `FOCUS_PLAYLIST`(JS) 사용. 전투/보스/추격/징글 계열은 focus 1~2로 낮게 잡혀 있으므로 기본 재생목록에서 빠짐.
""")
open("classic_rpg_bgm_free_playlist.md","w",encoding="utf-8").write("\n".join(L))
print("report written", tot)
