import re, json, time, requests, urllib.parse
S=requests.Session(); S.headers["User-Agent"]="Mozilla/5.0"
home=S.get("https://peritune.com/",timeout=30).text
tags=sorted(set(re.findall(r'href="https://peritune.com/blog/tag/([^"/]+)/"', home)))
print("tags", len(tags))
out={}
for t in tags:
    page=1
    while True:
        url=f"https://peritune.com/blog/tag/{t}/" + (f"page/{page}/" if page>1 else "")
        r=S.get(url,timeout=30)
        if r.status_code!=200: break
        posts=re.findall(r'href="https://peritune.com/blog/(\d{4}/\d{2}/\d{2}/[^"/]+)/"[^>]*>([^<]*)<', r.text)
        slugs=set(re.findall(r'href="https://peritune.com/blog/\d{4}/\d{2}/\d{2}/([^"/]+)/"', r.text))
        if not slugs: break
        for s in slugs: out.setdefault(s, set()).add(urllib.parse.unquote(t))
        if f'/page/{page+1}/' not in r.text: break
        page+=1; time.sleep(0.3)
    time.sleep(0.3)
json.dump({k:sorted(v) for k,v in out.items()}, open("data/peritune_tags.json","w"), ensure_ascii=False, indent=0)
print("posts", len(out))
