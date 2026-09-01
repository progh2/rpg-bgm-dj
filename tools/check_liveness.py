# -*- coding: utf-8 -*-
"""곡 생존 검사 (issue #15).

YouTube 영상은 삭제·비공개·임베드 차단으로 바뀐다. 두 가지를 확인한다.
  1) oEmbed 200  — 영상이 존재하고 공개 상태인가
  2) playableInEmbed — 외부 사이트에서 재생을 허용하는가
     oEmbed 는 임베드 차단 영상에도 200 을 주므로 이 확인이 따로 필요하다.

  python3 tools/check_liveness.py            검사만
  python3 tools/check_liveness.py --prune    죽은 곡을 데이터에서 제거
"""
import sys, os, re, json, csv, time, argparse, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import yt

PLAYLIST = "data/bgm_playlist.json"
CSVOUT   = "data/bgm_playlist.csv"


def load_tracks():
    doc = json.load(open(PLAYLIST, encoding="utf-8"))
    rows = []
    for c in doc["categories"]:
        for s in c["subcategories"]:
            for t in s["tracks"]:
                rows.append((c["name"], s, t))
    return doc, rows


def check_one(vid):
    """(살아있음, 사유)"""
    try:
        if not yt.oembed(vid):
            return False, "삭제되었거나 비공개"
    except Exception as e:
        return None, f"확인 실패: {type(e).__name__}"   # None = 판정 보류
    try:
        html = yt.S.get(f"https://www.youtube.com/watch?v={vid}", timeout=25).text
        m = re.search(r'"playableInEmbed":(true|false)', html)
        if m and m.group(1) == "false":
            return False, "외부 재생(임베드) 차단"
    except Exception:
        pass   # 임베드 확인 실패는 살아있는 것으로 본다 (과잉 삭제 방지)
    return True, ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prune", action="store_true", help="죽은 곡을 데이터에서 제거")
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--limit", type=int, default=0, help="검사할 곡 수 제한(시험용)")
    args = ap.parse_args()

    doc, rows = load_tracks()
    ids = [t["videoId"] for _, _, t in rows]
    if args.limit:
        ids = ids[: args.limit]
    print(f"검사 대상 {len(ids)}곡", flush=True)

    result = {}
    with cf.ThreadPoolExecutor(args.workers) as ex:
        for i, (vid, r) in enumerate(zip(ids, ex.map(check_one, ids))):
            result[vid] = r
            if (i + 1) % 100 == 0:
                print(f"  {i+1}/{len(ids)} …", flush=True)

    dead = [(cat, s, t, result[t["videoId"]][1])
            for cat, s, t in rows
            if t["videoId"] in result and result[t["videoId"]][0] is False]
    unknown = [v for v, (ok, _) in result.items() if ok is None]

    print(f"\n살아있음 {len(ids) - len(dead) - len(unknown)} · 재생 불가 {len(dead)} · 판정 보류 {len(unknown)}")

    os.makedirs("data", exist_ok=True)
    summary = {
        "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "checked": len(ids),
        "dead": [
            {"videoId": t["videoId"], "title": t["title"], "artist": t["artist"],
             "scene": s["id"], "sceneName": s["name"], "reason": why}
            for _, s, t, why in dead
        ],
        "unknown": unknown,
    }
    json.dump(summary, open("data/liveness.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    if dead:
        print("\n재생 불가 목록")
        for _, s, t, why in dead:
            print(f"  [{s['id']}] {t['artist']} — {t['title']}  ({why})")

    if args.prune and dead:
        deadset = {t["videoId"] for _, _, t, _ in dead}
        for c in doc["categories"]:
            for s in c["subcategories"]:
                s["tracks"] = [t for t in s["tracks"] if t["videoId"] not in deadset]
                s["count"] = len(s["tracks"])
        json.dump(doc, open(PLAYLIST, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

        with open(CSVOUT, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["category", "sub_id", "sub_name", "title", "artist", "videoId",
                        "url", "license", "source", "length_sec", "focus", "origin"])
            for c in doc["categories"]:
                for s in c["subcategories"]:
                    for t in s["tracks"]:
                        w.writerow([c["name"], s["id"], s["name"], t["title"], t["artist"],
                                    t["videoId"], t["url"], t["license"], t["source"],
                                    t["length"], t["focus"], t["origin"]])
        print(f"\n{len(dead)}곡 제거(고유 영상 {len(deadset)}개). bgm-scenes.js 재생성이 필요합니다.")

    # 죽은 곡이 있으면 종료 코드 1 (워크플로가 감지)
    sys.exit(1 if dead else 0)


if __name__ == "__main__":
    main()
