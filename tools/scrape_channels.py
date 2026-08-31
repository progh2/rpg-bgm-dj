import sys, json, os, time, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(__file__)); import yt
from channels import CHANNELS, CHANNELS2
CHANNELS = CHANNELS + CHANNELS2
os.makedirs("data/channels", exist_ok=True)
def job(ch):
    cid, name, lic, url, pages = ch
    out = f"data/channels/{cid}.json"
    if os.path.exists(out): return f"skip {name}"
    try:
        vids = yt.channel_videos(cid, max_pages=pages, sleep=0.7)
    except Exception as e:
        return f"ERR {name}: {e}"
    json.dump({"channelId":cid,"name":name,"license":lic,"url":url,"videos":vids}, open(out,"w"), ensure_ascii=False, indent=0)
    return f"ok {name}: {len(vids)}"
with cf.ThreadPoolExecutor(3) as ex:
    for r in ex.map(job, CHANNELS): print(r, flush=True)
