# -*- coding: utf-8 -*-
import sys, os, json, glob, re
sys.path.insert(0, os.path.dirname(__file__))
from classify import classify, focus_score, SUB, ORDER
from collections import defaultdict, Counter

def load_channels():
    rows=[]
    for f in glob.glob("data/channels/*.json"):
        d=json.load(open(f))
        for v in d["videos"]:
            if not v.get("title"): continue
            rows.append({"videoId":v["videoId"],"title":v["title"],"artist":d["name"],"channelId":d["channelId"],
                         "license":d["license"],"source":d["url"],"length":v.get("length"),"views":v.get("views",""),"origin":"channel"})
    return rows

def load_incompetech():
    # Kevin MacLeod pieces with video links & feel metadata
    rows=[]
    d=json.load(open("data/incompetech_pieces.json")); g=json.load(open("data/incompetech_genres.json"))
    for p in d:
        v=p.get("video") or ""
        m=re.search(r"(?:youtu\.be/|v=)([A-Za-z0-9_-]{11})", v)
        if not m: continue
        t=p["title"].strip()
        L=p.get("length") or ""
        secs=None
        if re.fullmatch(r"\d\d:\d\d:\d\d",L):
            h,mn,s=map(int,L.split(":")); secs=h*3600+mn*60+s
        rows.append({"videoId":m.group(1),"title":t,"artist":"Kevin MacLeod","channelId":"UCSZXFhRIx6b0dFX3xS8L1yQ",
                     "license":"CC BY 4.0","source":"https://incompetech.com/","length":secs,"views":"",
                     "feel":p.get("feel",""),"genre":g.get(str(p.get("genre")),""),"desc":p.get("description",""),"origin":"incompetech"})
    return rows

NOISE = re.compile(r"\b(tutorial|how to|vlog|livestream|live stream|stream archive|announcement|q&a|interview|behind the scenes|making of|update|unboxing|review|reaction|podcast|trailer|teaser|shorts?|sfx|sound effects?|voice|kontakt|patreon|challenge|poll|karaoke|official mv|lyric)\b|#shorts|効果音|ボイス|カラオケ|歌唱|MV|PV|素材集|まとめ|メドレー", re.I)

# Covers reproduce a copyrighted COMPOSITION even when the recording is CC-licensed. Excluded.
COVER = re.compile(r"\b(cover(ed|s)?|tribute|arrange(d|ment)? of|remix of|instrumental of|originally by|as heard in)\b|\[COVER\]|カバー|カヴァー|歌ってみた|弾いてみた", re.I)
# Full albums / compilations / medleys are not single tracks; unusable in a per-track player.
MIX = re.compile(r"\b(mix vol|full album|album stream|compilation|megamix|medley|playlist|best of|collection vol|\d+\s*tracks? in|demo reel|showreel)\b|メドレー|アルバム|\d+\s*曲", re.I)
# 15분을 넘기면서 제목이 앨범/사운드트랙을 가리키면 개별 곡이 아니라 통합본이다.
# (Kevin MacLeod의 "Concentration" 같은 장시간 단일 집중곡은 살려야 하므로 길이만으로는 거르지 않는다.)
LONG_ALBUM = re.compile(r"\b(soundtrack|ost|album|collection|anthology|selection)\b|サウンドトラック|音楽集", re.I)

PP_HEAD = {"RPGダンジョン":"B4_dungeon","RPG戦闘ザコ":"C1_battle","RPGザコ":"C1_battle","RPGバトル":"C1_battle","RPG戦闘ボス":"C2_boss","RPG戦闘ラスボス":"C4_finalboss",
 "RPG悪のテーマ":"D7_villain","RPG村＆町＆施設":"B2_town","RPG町＆施設":"B2_town","RPGピンチ":"C6_chase","RPG全滅＆廃墟":"B8_ruinworld","RPG場所":"B5_temple",
 "RPG回想":"D2_memory","キャラクターテーマ":"D10_charthm","RPGフィールド":"B1_overworld","RPGお城":"B3_castle","RPG教会":"A6_save","RPGシーン":"D6_ominous",
 "パズル・ミニゲーム":"D8_comic","スポーツ":"D8_comic","アクション":"C1_battle","シューティング":"C6_chase"}
PP = json.load(open("data/panicpumpkin.json")) if os.path.exists("data/panicpumpkin.json") else {}
def pp_sub(title):
    m=re.search(r"No\.(\d+)", title)
    if not m: return None
    e=PP.get(str(int(m.group(1))))
    if not e: return None
    for h in e["heads"]:
        if h in PP_HEAD: return PP_HEAD[h]
    g=e["genres"]
    if "jingle" in g: return "A3_levelup"
    if "battle" in g: return "C1_battle"
    if "dungeon" in g: return "B4_dungeon"
    if "field_ruin_sad" in g: return "B1_overworld"
    if "village_castle_church" in g: return "B2_town"
    if "town_fun" in g: return "B2_town"
    return None

def build(rows):
    out=[]; seen=set()
    for r in rows:
        if r["videoId"] in seen: continue
        if NOISE.search(r["title"]) or COVER.search(r["title"]) or MIX.search(r["title"]): continue
        L=r.get("length")
        lo = 3 if r.get("genre")=="Stings" else 25
        if L is not None and (L<lo or L>1800): continue   # too short (jingle spam) / too long (mixes)
        if L is not None and L > 900 and LONG_ALBUM.search(r["title"]): continue
        res=classify(r["title"], r.get("desc",""), r.get("feel",""))
        if r.get("genre")=="Stings":
            f=(r.get("feel") or "").lower(); d=(r.get("desc") or "").lower()
            js = "A5_gameover" if any(w in f+d for w in ("dark","somber","eerie","unnerving","fail","sad")) else ("A2_victory" if any(w in f+d for w in ("bright","uplifting","epic","triumph","win")) else "A3_levelup")
            res=[(js,9)]+[x for x in res if x[0]!=js]
        if "PANICPUMPKIN" in r["title"]:
            ps=pp_sub(r["title"])
            if ps: res=[(ps,9)]+[x for x in res if x[0]!=ps]
        if not res: continue
        seen.add(r["videoId"])
        sub=res[0][0]
        r=dict(r); r["sub"]=sub; r["alts"]=[k for k,_ in res[1:3]]
        r["focus"]=focus_score(r["title"], sub, L, r.get("feel",""))
        out.append(r)
    return out

if __name__=="__main__":
    rows=load_incompetech()+load_channels()
    print("raw rows", len(rows))
    out=build(rows)
    print("classified", len(out))
    c=Counter(r["sub"] for r in out)
    for k in ORDER: print(f"{k:14s} {SUB[k][1]:22s} {c.get(k,0):4d}  focus>=4: {sum(1 for r in out if r['sub']==k and r['focus']>=4)}")
    json.dump(out, open("data/classified_channels.json","w"), ensure_ascii=False, indent=0)
