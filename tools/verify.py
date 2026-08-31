"""oEmbed verification (exists + embeddable) with caching. Usage: verify.py <in.json> <out.json>"""
import sys, os, json, time, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(__file__)); import yt
CACHE="data/oembed_cache.json"
cache=json.load(open(CACHE)) if os.path.exists(CACHE) else {}
def check(vid):
    if vid in cache: return vid, cache[vid]
    try:
        o=yt.oembed(vid)
        r={"ok":bool(o),"author":(o or {}).get("author_name"),"yt_title":(o or {}).get("title")}
    except Exception as e:
        r={"ok":False,"err":str(e)}
    time.sleep(0.15)
    return vid, r
def verify(ids, workers=6):
    todo=[v for v in dict.fromkeys(ids) if v not in cache]
    with cf.ThreadPoolExecutor(workers) as ex:
        for i,(vid,r) in enumerate(ex.map(check, todo)):
            cache[vid]=r
            if i%100==0: json.dump(cache, open(CACHE,"w"))
    json.dump(cache, open(CACHE,"w"))
    return {v:cache[v] for v in ids}
if __name__=="__main__":
    rows=json.load(open(sys.argv[1]))
    res=verify([r["videoId"] for r in rows])
    ok=[dict(r, yt_author=res[r["videoId"]].get("author")) for r in rows if res[r["videoId"]]["ok"]]
    print("verified", len(ok), "/", len(rows))
    json.dump(ok, open(sys.argv[2],"w"), ensure_ascii=False, indent=0)
