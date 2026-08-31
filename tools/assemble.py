# -*- coding: utf-8 -*-
import sys, os, json, re, csv, datetime
sys.path.insert(0, os.path.dirname(__file__))
from classify import SUB, ORDER, classify, focus_score, clean
from build import load_channels, load_incompetech, build, NOISE, COVER, MIX, LONG_ALBUM
import verify as V
from collections import defaultdict, OrderedDict

CAP = int(os.environ.get("CAP", "40"))
MIN_FROM_CHANNELS = 25

# ---- PeriTune tag fallback
PT_TAG = OrderedDict([("fight","C1_battle"),("fierce","C2_boss"),("hard_rock","C1_battle"),("horror","D6_ominous"),("scary","D6_ominous"),("suspicious","D6_ominous"),
 ("sad","D1_sorrow"),("doleful","D1_sorrow"),("dreary","D1_sorrow"),("hope","D4_hope"),("healing","A4_inn"),("gentle","A4_inn"),("quiet","A4_inn"),("kind","A4_inn"),
 ("everyday","B2_town"),("comical","D8_comic"),("fun","D8_comic"),("cute","D8_comic"),("fairy-tale","D9_mystic"),("wonder","D9_mystic"),("magnificent","B3_castle"),("stately","B3_castle"),("gorgeous","D11_festival"),
 ("cold","B7_terrain"),("natural","B7_terrain"),("celtic","B1_overworld"),("folk","B1_overworld"),("folk-music","B1_overworld"),("powerful","D5_heroic"),("gothic","D6_ominous"),
 ("fantasy","D9_mystic"),("ファンタジー","D9_mystic"),("ambient","A4_inn"),("chillin","A4_inn"),("beautiful","D9_mystic"),("japanese_style","B7_terrain"),("エスニック","B7_terrain")])
def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower())
def peritune_fallback(rows):
    if not os.path.exists("data/peritune_tags.json"): return 0
    tags = json.load(open("data/peritune_tags.json"))
    slug2tags = {norm(k): v for k, v in tags.items()}
    n=0
    for r in rows:
        if r["artist"] != "PeriTune" or r.get("sub"): continue
        names = re.findall(r'[“"「『]([^”"」』]+)[”"」』]', r["title"])
        for nm in names:
            t = slug2tags.get(norm(nm))
            if not t: continue
            for tag, sub in PT_TAG.items():
                if tag in t:
                    r["sub"]=sub; r["alts"]=[]; r["focus"]=focus_score(r["title"], sub, r.get("length")); r["via"]="peritune-tag:"+tag; n+=1; break
            if r.get("sub"): break
    return n

def main():
    raw = load_incompetech() + load_channels()
    classified = build(raw)
    # unclassified PeriTune rows -> tag fallback
    done = {r["videoId"] for r in classified}
    extra = []
    for r in raw:
        if r["videoId"] in done or r["artist"] != "PeriTune": continue
        if NOISE.search(r["title"]) or COVER.search(r["title"]) or MIX.search(r["title"]): continue
        L = r.get("length")
        if L is not None and (L < 25 or L > 1800): continue
        if L is not None and L > 900 and LONG_ALBUM.search(r["title"]): continue
        extra.append(dict(r))
    n = peritune_fallback(extra)
    classified += [r for r in extra if r.get("sub")]
    print("peritune tag fallback added", n)

    # NOTE: YouTube "Creative Commons" filtered search was evaluated as a gap-filler and REJECTED.
    # Spot-checks found uploader-mislabelled copyrighted material (e.g. Final Fantasy covers,
    # Dissidia rips) on aggregator channels. Only vetted official artist channels are used.
    gaprows = []

    by = defaultdict(list)
    for r in classified: by[r["sub"]].append(r)
    gby = defaultdict(list)
    for r in gaprows: gby[r["sub"]].append(r)

    def pick(rows, cap):
        # round-robin across artists, preferring higher focus, longer tracks
        rows = sorted(rows, key=lambda r: (-r["focus"], -(r.get("length") or 0)))
        buckets = defaultdict(list)
        for r in rows: buckets[r["artist"]].append(r)
        out = []
        while len(out) < cap and any(buckets.values()):
            for a in list(buckets):
                if buckets[a]:
                    out.append(buckets[a].pop(0))
                    if len(out) >= cap: break
                else: del buckets[a]
        return out

    selection = {}
    for sub in ORDER:
        cand = pick(by[sub], CAP * 2)  # over-select, then verify and trim
        if len({r["videoId"] for r in cand}) < CAP:
            # backfill from tracks whose SECONDARY classification is this scene
            alt = [r for r in classified if sub in r.get("alts", []) and r["sub"] != sub]
            have = {r["videoId"] for r in cand}
            cand += [dict(r, sub=sub, focus=focus_score(r["title"], sub, r.get("length")), via="alt")
                     for r in pick(alt, CAP * 2) if r["videoId"] not in have]
        selection[sub] = cand
    all_ids = [r["videoId"] for s in selection.values() for r in s]
    print("verifying", len(set(all_ids)), "videos via oEmbed ...")
    res = V.verify(all_ids, workers=6)

    final = {sub: [] for sub in ORDER}
    used = set()
    # Two passes so a track claims the scene it was primarily classified into,
    # before alt-backfills compete for the remaining slots. Also dedupes videoIds globally.
    for phase in ("primary", "backfill"):
        for sub in ORDER:
            cur = final[sub]
            for r in selection[sub]:
                if len(cur) >= CAP: break
                vid = r["videoId"]
                if vid in used or not res[vid]["ok"]: continue
                if phase == "primary" and r.get("via") == "alt": continue
                cur.append(dict(r, yt_author=res[vid].get("author"))); used.add(vid)
    return final

def write_outputs(final):
    today = datetime.date.today().isoformat()
    cats = OrderedDict()
    for sub in ORDER:
        cat, ko, _, _ = SUB[sub]
        cats.setdefault(cat, []).append({"id": sub, "name": ko, "count": len(final[sub]), "tracks": [
            {"id": f"{sub.lower()}-{r['videoId'].lower()}", "title": clean(r["title"]) or r["title"], "rawTitle": r["title"], "artist": r["artist"],
             "videoId": r["videoId"], "license": r["license"], "source": r["source"], "length": r.get("length"), "focus": r["focus"],
             "origin": r["origin"], "alts": r.get("alts", []), "url": f"https://www.youtube.com/watch?v={r['videoId']}"} for r in final[sub]]})
    doc = {"generated": today, "player_format": "{id,title,artist,videoId}", "focus_scale": "1(집중 방해)~5(작업용 최적)",
           "categories": [{"name": k, "subcategories": v} for k, v in cats.items()]}
    json.dump(doc, open("data/bgm_playlist.json", "w"), ensure_ascii=False, indent=1)
    with open("data/bgm_playlist.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["category", "sub_id", "sub_name", "title", "artist", "videoId", "url", "license", "source", "length_sec", "focus", "origin"])
        for c in doc["categories"]:
            for s in c["subcategories"]:
                for t in s["tracks"]:
                    w.writerow([c["name"], s["id"], s["name"], t["title"], t["artist"], t["videoId"], t["url"], t["license"], t["source"], t["length"], t["focus"], t["origin"]])
    # (player JS is generated separately by tools/make_player_snippet.py -> bgm-scenes.js)
    return doc

if __name__ == "__main__":
    final = main()
    doc = write_outputs(final)
    tot = 0
    for c in doc["categories"]:
        for s in c["subcategories"]:
            tot += s["count"]; f4 = sum(1 for t in s["tracks"] if t["focus"] >= 4)
            print(f"{s['id']:14s} {s['name']:24s} {s['count']:3d}  focus>=4: {f4:3d}  artists: {len(set(t['artist'] for t in s['tracks']))}")
    print("TOTAL", tot)
