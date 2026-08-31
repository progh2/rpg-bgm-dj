"""Minimal YouTube scraping helpers (no API key): search, channel listing, oEmbed verify."""
import re, json, time, sys, urllib.parse
import requests

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
S = requests.Session()
S.headers.update({"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
CC_FILTER = "EgIwAQ%3D%3D"  # Creative Commons filter
_ctx = {}

def _initial_data(html):
    m = re.search(r"ytInitialData\s*=\s*(\{.*?\});\s*</script>", html, re.S)
    if not m:
        m = re.search(r"ytInitialData\"\]\s*=\s*(\{.*?\});", html, re.S)
    return json.loads(m.group(1)) if m else None

def _ctx_from(html):
    k = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html)
    v = re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"', html)
    if k and v:
        _ctx.update(key=k.group(1), ver=v.group(1))

def _walk(o, key):
    if isinstance(o, dict):
        if key in o: yield o[key]
        for v in o.values(): yield from _walk(v, key)
    elif isinstance(o, list):
        for v in o: yield from _walk(v, key)

def _text(t):
    if not t: return ""
    if "simpleText" in t: return t["simpleText"]
    return "".join(r.get("text","") for r in t.get("runs",[]))

def _parse_len(s):
    p = [int(x) for x in s.split(":")] if re.fullmatch(r"[\d:]+", s or "") else None
    if not p: return None
    n = 0
    for x in p: n = n*60 + x
    return n

def _videos(data):
    out = []
    for vr in _walk(data, "videoRenderer"):
        vid = vr.get("videoId")
        if not vid: continue
        out.append({
            "videoId": vid,
            "title": _text(vr.get("title")),
            "channel": _text(vr.get("ownerText") or vr.get("longBylineText")),
            "channelId": (vr.get("ownerText",{}).get("runs",[{}])[0].get("navigationEndpoint",{}).get("browseEndpoint",{}).get("browseId")),
            "length": _parse_len(_text(vr.get("lengthText"))),
            "views": _text(vr.get("viewCountText")),
        })
    for vr in _walk(data, "richItemRenderer"):
        pass
    return out

def _continuation(data):
    for c in _walk(data, "continuationCommand"):
        if c.get("token"): return c["token"]
    return None

def _browse_cont(token, endpoint="search"):
    url = f"https://www.youtube.com/youtubei/v1/{endpoint}?key={_ctx['key']}&prettyPrint=false"
    body = {"context": {"client": {"clientName": "WEB", "clientVersion": _ctx["ver"], "hl":"en","gl":"US"}}, "continuation": token}
    r = S.post(url, json=body, timeout=30)
    r.raise_for_status()
    return r.json()

def search(q, cc=False, pages=1, sleep=0.8):
    url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(q) + (f"&sp={CC_FILTER}" if cc else "")
    html = S.get(url, timeout=30).text
    _ctx_from(html)
    data = _initial_data(html)
    if not data: return []
    vids = _videos(data); tok = _continuation(data)
    for _ in range(pages-1):
        if not tok or "key" not in _ctx: break
        time.sleep(sleep)
        data = _browse_cont(tok, "search")
        vids += _videos(data); tok = _continuation(data)
    seen=set(); res=[]
    for v in vids:
        if v["videoId"] in seen: continue
        seen.add(v["videoId"]); res.append(v)
    return res

def channel_videos(handle_or_url, max_pages=40, sleep=0.8):
    """List uploads of a channel. handle like '@Peritune' or full URL or 'UC...' id."""
    h = handle_or_url
    if h.startswith("UC"): url = f"https://www.youtube.com/channel/{h}/videos"
    elif h.startswith("http"): url = h.rstrip("/") + ("" if h.endswith("/videos") else "/videos")
    else: url = f"https://www.youtube.com/{h}/videos"
    html = S.get(url, timeout=30).text
    _ctx_from(html)
    data = _initial_data(html)
    if not data: return []
    cname = ""
    m = re.search(r'<meta property="og:title" content="([^"]*)"', html)
    if m: cname = m.group(1)
    def grab(d):
        out=[]
        for vr in _walk(d, "videoRenderer"):
            if vr.get("videoId"):
                out.append({"videoId": vr["videoId"], "title": _text(vr.get("title")), "channel": cname,
                            "length": _parse_len(_text(vr.get("lengthText"))), "views": _text(vr.get("viewCountText"))})
        for lv in _walk(d, "lockupViewModel"):
            vid = lv.get("contentId")
            if not vid or lv.get("contentType") not in (None, "LOCKUP_CONTENT_TYPE_VIDEO"): continue
            title = ""
            for t in _walk(lv.get("metadata",{}), "title"):
                if isinstance(t, dict) and t.get("content"): title = t["content"]; break
            length = None
            for b in _walk(lv, "thumbnailBadgeViewModel"):
                if re.fullmatch(r"[\d:]+", b.get("text","")): length = _parse_len(b["text"]); break
            views = ""
            for row in _walk(lv.get("metadata",{}), "metadataParts"):
                for part in row:
                    c = part.get("text",{}).get("content","")
                    if "view" in c: views = c
            out.append({"videoId": vid, "title": title, "channel": cname, "length": length, "views": views})
        return out
    vids = grab(data); tok = _continuation(data)
    for _ in range(max_pages-1):
        if not tok: break
        time.sleep(sleep)
        try: data = _browse_cont(tok, "browse")
        except Exception as e: print("cont err", e, file=sys.stderr); break
        vids += grab(data); tok = _continuation(data)
    seen=set(); res=[]
    for v in vids:
        if v["videoId"] in seen: continue
        seen.add(v["videoId"]); res.append(v)
    return res

def oembed(video_id):
    r = S.get("https://www.youtube.com/oembed", params={"url": f"https://www.youtube.com/watch?v={video_id}", "format":"json"}, timeout=20)
    if r.status_code != 200: return None
    return r.json()

if __name__ == "__main__":
    q = sys.argv[1] if len(sys.argv)>1 else "rpg village theme"
    for v in search(q, cc=True, pages=1)[:10]:
        print(v)
