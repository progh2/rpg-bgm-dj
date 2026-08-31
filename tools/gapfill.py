# -*- coding: utf-8 -*-
"""Gap-fill thin subcategories via YouTube Creative-Commons-filtered search; verify license row on watch page."""
import sys, os, json, time, re
sys.path.insert(0, os.path.dirname(__file__)); import yt
QUERIES = {
 "A1_prelude": ["rpg title screen music royalty free","fantasy game main menu theme free","prelude harp fantasy game music free"],
 "A2_victory": ["victory fanfare royalty free game","rpg victory theme free music","battle won fanfare 8 bit free"],
 "A3_levelup": ["level up jingle free game music","item get jingle royalty free","rpg treasure jingle free"],
 "A5_gameover": ["game over theme royalty free rpg","defeat theme sad game music free"],
 "A6_save": ["crystal room fantasy music free","sacred shrine game music royalty free","holy temple ambient game music free"],
 "B4_dungeon": ["dungeon theme rpg royalty free","cave ambient game music free loop","dark dungeon crawl music free"],
 "B8_ruinworld": ["ruined world game music free","post apocalyptic rpg music royalty free","desolate wasteland ambient free music"],
 "B9_final": ["final dungeon music royalty free","demon castle theme free game music","dark lord castle rpg music free"],
 "C2_boss": ["boss battle theme royalty free rpg","epic boss fight music free","8 bit boss battle free"],
 "C3_rival": ["rival battle theme free rpg","duel theme game music royalty free"],
 "C4_finalboss": ["final boss theme royalty free","last battle rpg music free","final battle orchestral free game music"],
 "C5_resolve": ["before the battle rpg music free","determination theme game music royalty free","calm before the storm fantasy music free"],
 "D2_memory": ["nostalgic rpg music free","memories piano game music royalty free","hometown theme rpg free"],
 "D7_villain": ["villain theme royalty free","evil theme rpg music free","dark lord theme free music"],
 "D10_charthm": ["character theme rpg royalty free","hero theme fantasy music free"],
 "D12_opening": ["rpg opening theme royalty free","prologue fantasy music free","overture game music free"],
 "D13_ending": ["rpg ending theme royalty free","staff roll game music free","epilogue fantasy music free"],
}
LIC = re.compile(r"Creative Commons Attribution license")
out = json.load(open("data/gapfill.json")) if os.path.exists("data/gapfill.json") else {}
for sub, qs in QUERIES.items():
    for q in qs:
        try: res = yt.search(q, cc=True, pages=3)
        except Exception as e: print("search err", q, e, file=sys.stderr); continue
        for v in res:
            vid=v["videoId"]
            if vid in out: 
                out[vid]["subs"] = sorted(set(out[vid]["subs"]+[sub])); continue
            L=v.get("length")
            if L is None or L<40 or L>1500: continue
            out[vid]={"videoId":vid,"title":v["title"],"artist":v["channel"],"channelId":v.get("channelId"),
                      "length":L,"views":v.get("views",""),"cc_by":True,"subs":[sub],"query":q,"origin":"cc_search"}
        json.dump(out, open("data/gapfill.json","w"), ensure_ascii=False, indent=0)
        print(sub, q, "->", len(res), "total", len(out), flush=True)
        time.sleep(0.6)
print("done", len(out), "cc_by:", sum(1 for r in out.values() if r["cc_by"]))
