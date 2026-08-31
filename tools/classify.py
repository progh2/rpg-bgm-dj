# -*- coding: utf-8 -*-
"""Keyword-based scene classifier for track titles (EN/JA/KO)."""
import re

# subcategory id -> (category, ko name, [regex keywords], focus_default)
# focus_default: 1..5 how suitable for background/work listening
SUB = {
 # A. system jingles
 "A1_prelude":   ("A 시스템", "프렐류드/타이틀", r"\b(prelude|title (screen|theme|music)|main menu|menu (theme|music|screen)|opening theme|start screen|main theme|theme song|logo (theme|sting)|game start|press start|character select|save (screen|select)|file select)\b|タイトル|タイトル画面|プレリュード|メニュー|メインテーマ|ゲームスタート", 3),
 "A2_victory":   ("A 시스템", "승리 팡파레", r"\b(victory|fanfare|fanfar|triumph(ant)?|you win|winner|win(ning)? theme|clear!?|stage clear|level clear|quest complete|mission complete|success|congratulations|well done|battle won|we did it|celebration sting)\b|勝利|ファンファーレ|クリア|成功|達成", 1),
 "A3_levelup":   ("A 시스템", "레벨업/획득", r"\b(level ?up|item get|get item|treasure|jingle|sting(er)?|achievement|unlock(ed)?|power ?up|reward|found|acquire[d]?|pick ?up|coin|collect|new (item|skill|ability)|short (cue|jingle|theme)|notification|chime|bonus|discovery)\b|レベルアップ|ジングル|入手|獲得|宝箱|習得|アイテム", 1),
 "A4_inn":       ("A 시스템", "여관/회복/휴식", r"\b(inn|rest(ing)?|lullaby|sleep|campfire|camp|cozy|resting place|healing|bedtime)\b|宿屋|休憩|回復|子守|安らぎ|焚き火|癒し|ヒーリング", 5),
 "A5_gameover":  ("A 시스템", "게임오버/전멸", r"\b(game ?over|defeat(ed)?|you (lose|died)|fail(ure)?|lost)\b|ゲームオーバー|敗北|全滅", 1),
 "A6_save":      ("A 시스템", "세이브/크리스탈/신성", r"\b(crystal|shrine|sanctuary|holy|sacred|chapel|prayer|hymn|church|cathedral|altar)\b|クリスタル|祠|聖|教会|祈り|礼拝", 4),
 # B. exploration
 "B1_overworld": ("B 탐험", "오버월드/필드", r"\b(overworld|world map|field|journey|adventure|travel(l?ing|ers?)?|wander(ing)?|road|plains?|meadow|grassland|hills?|voyage|quest|explor(e|ation|ing)|setting out|set out|departure|open world|countryside|pilgrim)\b|フィールド|旅路|旅の|冒険|草原|平原|旅立ち|大地|放浪|街道", 4),
 "B2_town":      ("B 탐험", "마을/평화", r"\b(town|village|city|market|tavern|shop|harbor|harbour|port|hamlet|inn keeper|peaceful (day|time|life)|daily life|bazaar|square|farm|pub|alehouse|marketplace|merchant)\b|街|町|村|市場|酒場|港|日常|平和|お店|ショップ", 5),
 "B3_castle":    ("B 탐험", "성/왕궁", r"\b(castle|palace|kingdom|royal|throne|king|queen|court|majest(y|ic)|noble|regal|coronation|knights? of|empire|imperial)\b|お城|城の|城内|王宮|王国|宮殿|玉座|帝国|王の|女王|王子|姫", 3),
 "B4_dungeon":   ("B 탐험", "던전/동굴", r"\b(dungeon|cave(rn|s)?|catacombs?|crypt|sewer|underground|mine(s|shaft)?|labyrinth|maze|depths|tunnel|abyss|pit|lair)\b|ダンジョン|洞窟|洞穴|地下|迷宮|坑道|地底", 3),
 "B5_temple":    ("B 탐험", "탑/신전/고대유적", r"\b(temple|tower|ruins?|ancient|relic|monument|pyramid|tomb|sanctum|forgotten|lost civilization|megalith|spire|citadel|fortress|monastery)\b|神殿|塔|遺跡|古代|廃墟|遺構|要塞|寺院", 4),
 "B6_vehicle":   ("B 탐험", "배/비공정/탈것", r"\b(airship|ship|sail(ing)?|flight|flying|fly|sky|clouds?|voyage|balloon|wings?|soar(ing)?|zeppelin|glide|ocean (voyage|crossing)|on the sea|seafar|aloft)\b|飛空艇|船|航海|飛行|空|大空|翼", 4),
 "B7_terrain":   ("B 탐험", "특수 지형(설원·사막·숲·바다·화산)", r"\b(snow(y|field)?|ice|frozen|winter|blizzard|glacier|tundra|desert|sand(s)?|dunes?|oasis|forest|woods|woodland|grove|jungle|swamp|marsh|volcano|lava|magma|fire (cave|mountain)|ocean|sea|underwater|beach|island|coast|river|lake|waterfall|mountain|peak|savanna|prairie|canyon|wasteland|tropical|autumn|spring|summer|rain|storm)\b|雪|氷|砂漠|森|ジャングル|沼|火山|海|水中|島|川|湖|滝|山|秋|春|夏|雨|嵐", 4),
 "B8_ruinworld": ("B 탐험", "폐허/파멸한 세계", r"\b(ruined|ruin(ation)?|wasteland|desolat(e|ion)|apocalyp(se|tic)|after the (war|fall|end)|aftermath|barren|dead (world|land|city)|abandoned|forsaken|devastat|fallen (world|kingdom)|ashes|scorched|silent (world|ruins)|empty world|end of the world|post-apoc)\b|荒廃|廃墟|滅び|崩壊|終末|荒野", 4),
 "B9_final":     ("B 탐험", "마계/최종 던전", r"\b(final dungeon|last dungeon|demon(ic)? (realm|world|castle|lord'?s|throne)|hell(ish|fire)?|underworld|netherworld|dark (castle|tower|fortress|realm|throne|citadel|palace|sanctum)|evil (castle|lair|fortress|throne)|void|chaos|inferno|nether|infernal|pandemonium|the end is near|last stand|abyss(al)?|throne of|damnation|purgatory|doom(sday)?|apocalypse|black (tower|throne|citadel))\b|魔界|魔王城|最終|冥界|地獄|魔城|混沌|終焉|奈落|深淵", 2),
 # C. battle
 "C1_battle":    ("C 전투", "일반 전투", r"\b(battle|fight(ing)?|combat|encounter|skirmish|clash|duel|arena|melee|action|attack|brawl|warfare|onslaught|struggle)\b|戦闘|バトル|戦い|闘い|対決|戦う", 2),
 "C2_boss":      ("C 전투", "보스 전투", r"\b(boss|showdown|confrontation|decisive|fierce|nemesis|dragon fight|giant|colossus|titan|behemoth|monster (battle|fight))\b|ボス|決戦|強敵|死闘|激闘", 1),
 "C3_rival":     ("C 전투", "라이벌/특수 보스", r"\b(rival|duel|versus|vs\.?|challenger|showdown|one on one|1v1|arch ?enemy|warlord)\b|ライバル|宿敵|因縁", 1),
 "C4_finalboss": ("C 전투", "최종 보스", r"\b(final (boss|battle|fight|showdown|confrontation|stand|clash|encounter)|last (boss|battle|fight|stand|clash)|ultimate (battle|enemy|evil|showdown|foe)|apocalypse battle|end boss|god of (war|destruction)|demon king|dark lord|overlord|the end of all|climax|endgame|the last (war|fight)|judgment day|final hour|decisive battle|fate of the world|showdown with)\b|ラスボス|最終決戦|最後の戦い|最終戦|魔王(戦|との)|決着", 1),
 "C5_resolve":   ("C 전투", "결전 직전/결의", r"\b(determination|determined|resolve|resolution|conviction|before the (battle|storm|fight|war|dawn)|calm before|prepar(e|ing|ation)|call to arms|rally(ing)?|march to war|eve of|last night|vow|oath|pledge|stand (up|strong|together|firm)|rise up|courage|bravery|steel(ing)? (yourself|resolve)|no turning back|point of no return|gathering (storm|forces)|the plan|strategy|council of war|final preparations|ready for)\b|決意|覚悟|決戦前|出陣|前夜|誓い|勇気|奮起|覚醒", 3),
 "C6_chase":     ("C 전투", "도주/추격/긴급", r"\b(chase|escape|run(ning)?( away)?|pursuit|hurry|flee|flight from|countdown|emergency|alarm|alert|urgent|panic|breakout|getaway|race)\b|追跡|逃走|脱出|緊急|急げ|逃げ", 1),
 # D. drama
 "D1_sorrow":    ("D 드라마", "슬픔/애도/진혼곡", r"\b(sad(ness)?|sorrow(ful)?|grief|mourn(ing)?|requiem|elegy|lament(ation)?|funeral|tears?|tearful|weep(ing)?|loss|melanchol(y|ic)|tragic|tragedy|in memoriam|farewell to|death of|dirge|heartbreak|sadly|despair|crying|cry)\b|悲しみ|悲しい|哀しみ|哀愁|鎮魂|レクイエム|涙|嘆き|絶望|追悼|切ない|悲哀", 4),
 "D2_memory":    ("D 드라마", "이별/회상/향수", r"\b(memor(y|ies)|remembrance|nostalgi[ac]|reminisc|flashback|farewell|goodbye|parting|homeland|hometown|childhood|distant (past|days|memory)|days gone|long ago|once upon|old days|reflection|lost days|yesterday|home sweet home|homesick)\b|思い出|回想|懐かし|別れ|故郷|郷愁|昔|さよなら|過去", 5),
 "D3_love":      ("D 드라마", "사랑/애정", r"\b(love|romance|romantic|tender(ness)?|affection|beloved|heart(s)?|lovers?|devotion|serenade|sweetheart|valentine|wedding|bride|embrace|kiss)\b|愛の|恋の|恋する|ラブ|恋人|結婚|優しさ|ロマンス|愛し", 4),
 "D4_hope":      ("D 드라마", "희망/재기/출발", r"\b(hope(ful)?|new (dawn|day|beginning|journey|world|horizon)|dawn|sunrise|rebirth|reborn|rise again|rising|awakening|awake|begin(ning)?s?|first step|onward|forward|light (returns|of)|revival|renewal|spring comes|brighter|tomorrow|uplifting|inspir(ing|ation)|resurgence|resilience)\b|希望|夜明け|再生|始まり|前へ|明日へ|復活|目覚め", 4),
 "D5_heroic":    ("D 드라마", "당당/영웅적 행진", r"\b(hero(ic|es)?'?s?|march(ing)?|triumph(ant)?|glory|glorious|valor|valour|brave(ry)?|legend(ary)?|epic|majestic|honou?r|knights?|army|soldiers?|parade|cavalry|banner|conquer|conquest|victory march|anthem|warriors?|champion|crusade|paladin)\b|英雄|勇者|行進|マーチ|栄光|凱旋|騎士|軍隊|進軍|誇り|堂々", 3),
 "D6_ominous":   ("D 드라마", "불길/음모/서스펜스", r"\b(ominous|omen|suspense(ful)?|tension|tense|foreboding|sinister|creep(y|ing)|eerie|uneasy|unsettling|dread|conspiracy|intrigue|shadow(s|y)?|lurking|stalking|whisper(s|ing)?|premonition|menace|menacing|danger(ous)?|threat|warning|nightmare|haunted|haunting|ghost(ly)?|horror|spooky|scary|fear|paranoia|stealth|sneak(ing|y)?|infiltrat|mystery|mysterious|enigma|secret(s)?|hidden|unknown|strange)\b|不穏|不安|緊張|陰謀|予感|恐怖|怪しい|忍び|潜入|謎|ミステリ|不気味|闇の|影の|ホラー", 3),
 "D7_villain":   ("D 드라마", "악역 테마", r"\b(villain(ous)?|evil|demon(ic)?|devil|dark lord|overlord|tyrant|wicked|malevolent|malice|corrupt(ed|ion)?|witch|necromancer|lich|vampire|dracula|dark (magic|side|ritual|power)|antagonist|nefarious|diabolic|satanic|cult(ist)?|the enemy|mastermind|madness|insanity|clown|jester)\b|悪役|魔王|邪悪|魔女|狂気|道化|悪魔|邪神|悪の|敵の|魔物", 2),
 "D8_comic":     ("D 드라마", "코믹/유머/마스코트", r"\b(comic(al)?|comedy|funny|humou?r(ous)?|silly|goofy|quirky|wacky|cute|kawaii|playful|cartoon|chibi|slapstick|jolly|bouncy|whimsical|clumsy|mischief|mischievous|cheeky|prank|circus|carnival|polka|kazoo|ukulele|happy go lucky|tiptoe|sneaky funny)\b|コミカル|コメディ|おもしろ|かわいい|可愛|ほのぼの|ゆるい|ズッコケ|ギャグ|楽しい|陽気|ピエロ|わくわく|ワクワク", 3),
 "D9_mystic":    ("D 드라마", "신비/환상/초월", r"\b(myst(ic|ical)|magic(al)?|arcane|ethereal|enchant(ed|ing|ment)?|fairy|faerie|fae|spirit(s|ual)?|dream(y|s|scape|ing)?|celestial|astral|cosmic|stars?|starlight|moonlight|moon|aurora|nebula|otherworld(ly)?|ancient magic|sacred grove|elven|elves|wonder(land)?|floating|illusion|phantasm|fantasia|surreal|transcend|void of|time (and space|travel|rift)|dimension|portal|crystal cave|glow(ing)?|luminous|twilight)\b|神秘|幻想|魔法|精霊|妖精|夢|星空|星の|月夜|月の|天空|幻の|異世界|時空|エルフ|不思議|きらめき|光の", 5),
 "D10_charthm":  ("D 드라마", "캐릭터 테마", r"\b(theme of|'s theme|character theme|hero'?s theme|heroine|princess|prince|wizard|mage|thief|rogue|ranger|bard|minstrel|monk|samurai|ninja|pirate|priest(ess)?|healer|sage|witch'?s|dwarf|dwarves|goblin|orc|robot|android|golem|dragon(s)?|wolf|cat|the (girl|boy) who|old man|traveler'?s song)\b|のテーマ|魔法使い|盗賊|吟遊詩人|侍|忍者|海賊|僧侶|ドワーフ|ゴブリン|ロボット|ドラゴン|竜の|狼|猫", 3),
 "D11_festival": ("D 드라마", "축제/무도회/극중극", r"\b(festival|fair|carnival|celebration|feast|party|dance|dancing|waltz|ball(room)?|minuet|gavotte|opera|aria|theater|theatre|stage|tavern song|drinking song|jig|reel|hornpipe|tarantella|masquerade|banquet|fiesta|bard'?s (song|tale)|folk (dance|song)|hoedown|shanty|fireworks|parade)\b|祭|祭り|お祭り|ダンス|舞踏|ワルツ|宴|パーティ|踊り|オペラ|舞台|花火|カーニバル", 4),
 "D12_opening":  ("D 드라마", "오프닝 서곡/프롤로그", r"\b(opening|overture|prologue|intro(duction)?|once upon a time|the beginning|chapter (1|one|i)|prelude to|legend begins|tale begins|story begins|a new story|beginning of)\b|オープニング|序曲|プロローグ|序章|物語の始まり|始まりの", 3),
 "D13_ending":   ("D 드라마", "엔딩/피날레/스태프롤", r"\b(ending|end (theme|credits|of (the )?(journey|story|adventure))|finale|epilogue|credits|staff roll|the end|closing|curtain|last chapter|afterglow|happy end(ing)?|to (the )?far ?away|conclusion|the journey'?s end|reunion|homecoming|coming home)\b|エンディング|終章|エピローグ|フィナーレ|スタッフロール|終わり|帰還|大団円|旅の終わり", 4),
}

ORDER = list(SUB.keys())

BRAND = re.compile(r"【魔王魂公式】|魔王魂|フリーBGM素材|フリーBGM|無料フリーBGM|無料BGM|音楽素材MusMus|MusMus QUEST|MusMus|FREE BGM DOVA-SYNDROME OFFICIAL YouTube CHANNEL|DOVA-SYNDROME|Free BGM&SE Senses Circuit Official YouTube Channel|Senses Circuit|Royalty[- ]Free (Music|BGM)|Copyright[- ]free BGM|No Copyright|\(FREE DOWNLOAD\)|FREE DOWNLOAD|Free Download|Free BGM|Free Music|Music Track|\(Looping\)|Looping|by Alexander Nakarada|Alexander Nakarada|By HeatleyBros|HeatleyBros|Kevin MacLeod|Scott Buckley|PeriTune|Blossom Tales: The Sleeping King|Songs from an Unmade World|Songs From An Unmade World|TeknoAXE|Ross Bugden|Nihilore|Vindsvept|Darren Curtis|Strezov Sampling|Raw Demo Track|CC[- ]BY|OFFICIAL|Official|YouTube|CHANNEL|Channel|20 ?min\.?|1 hour|Extended|Loop(ed)?|Ver(sion)?\.?|ver\.|カラオケ|Karaoke|Instrumental|\[|\]|【|】|『|』|「|」|#\d+", re.I)
def clean(title):
    t = BRAND.sub(" ", title)
    t = re.sub(r"\s+", " ", t).strip(" -–—|:・")
    return t
_RX = {k: re.compile(v[2], re.I) for k,v in SUB.items()}

# strong disambiguation: if these hit, prefer that subcategory
PRIORITY = ["C4_finalboss","A5_gameover","A2_victory","A3_levelup","A4_inn","A1_prelude","C2_boss","C6_chase","B8_ruinworld","B9_final","D11_festival","D13_ending","D12_opening","D1_sorrow","D3_love","D8_comic","B2_town","B3_castle","B4_dungeon","B5_temple","B6_vehicle","D7_villain","C1_battle","C3_rival","C5_resolve","D5_heroic","D4_hope","D2_memory","D6_ominous","D9_mystic","B7_terrain","B1_overworld","D10_charthm","A6_save"]

CALM = re.compile(r"\b(calm|calming|relax(ed|ing)?|peaceful|gentle|soft|quiet|ambient|chill|lo-?fi|lofi|serene|tranquil|soothing|meditat|sleep|study|focus|piano|harp|flute|acoustic|slow|dreamy|mellow|healing|lullaby|drone|atmospher(e|ic))\b|穏やか|静か|癒し|落ち着|ゆったり|リラックス|安らぎ|優しい|ピアノ|ハープ|しっとり|作業用|環境音|アンビエント", re.I)
LOUD = re.compile(r"\b(intense|aggressive|metal|hard ?rock|dubstep|edm|trap|drum ?and ?bass|dnb|brutal|epic (battle|action)|action|fast|hype|extreme|scream|rage|fury|furious|thrash|riot|violent|war drums|heavy|banger|loud|shred)\b|激しい|激戦|メタル|ハード|ロック|激", re.I)

def classify(title, extra="", feel=""):
    """Return list of (sub_id, score) sorted; empty if none."""
    text = f"{clean(title)} {extra}"
    hits = {}
    for k, rx in _RX.items():
        n = len(rx.findall(text))
        if n: hits[k] = n
    # feel words (incompetech) mapping
    f = feel.lower()
    if f:
        fm = {"somber":"D1_sorrow","dark":"D6_ominous","eerie":"D6_ominous","unnerving":"D6_ominous","suspenseful":"D6_ominous","mysterious":"D9_mystic","mystical":"D9_mystic","epic":"D5_heroic","humorous":"D8_comic","uplifting":"D4_hope","action":"C1_battle","intense":"C2_boss","aggressive":"C1_battle","calming":"A4_inn","calm":"A4_inn","relaxed":"B2_town","bright":"B2_town","bouncy":"D8_comic"}
        for w,k in fm.items():
            if w in f: hits[k] = hits.get(k,0) + 0.5
    if not hits: return []
    ranked = sorted(hits.items(), key=lambda kv: (-kv[1], PRIORITY.index(kv[0]) if kv[0] in PRIORITY else 99))
    # priority override: if any priority sub in top group within 1 point
    top = ranked[0][1]
    cands = [k for k,s in ranked if s >= top-0.5]
    best = min(cands, key=lambda k: PRIORITY.index(k) if k in PRIORITY else 99)
    ranked = [(best, hits[best])] + [(k,s) for k,s in ranked if k!=best]
    return ranked

def focus_score(title, sub_id, length=None, feel=""):
    base = SUB[sub_id][3]
    t = f"{clean(title)} {feel}"
    if CALM.search(t): base += 1
    if LOUD.search(t): base -= 2
    if length and length < 60: base -= 2
    elif length and length < 100: base -= 1
    if length and length >= 180: base += 0.5
    return max(1, min(5, round(base)))
