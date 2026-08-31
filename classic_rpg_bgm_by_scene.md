# 고전 콘솔 RPG BGM — 장면 유형별 정리

> 대상: 8/16비트 콘솔 및 PC엔진 세대 중심 (1986~1996 전후), 일부 PS1 초기작 포함
> 주요 시리즈: 파이널 판타지(FF), 드래곤 퀘스트(DQ), 이스(Ys), 로맨싱 사가(RS), 크로노 트리거(CT), 성검전설(SD) 등
> 주요 작곡가: 우에마츠 노부오(FF), 스기야마 코이치(DQ), 코시로 유조·이시카와 미에코·Falcom Sound Team jdk(Ys), 이토 켄지(SaGa), 미츠다 야스노리(CT), 키쿠타 히로키(SD2/3)

---

> **이 문서의 후속 작업**: 아래 분류 체계를 그대로 ID화(`A1_prelude` ~ `D13_ending`)하여,
> 각 유형에 해당하는 **저작권 문제 없는 무료 음원**을 유형별로 수십 곡씩 모은 결과가
> [`classic_rpg_bgm_free_playlist.md`](classic_rpg_bgm_free_playlist.md) 및 [`bgm-scenes.js`](bgm-scenes.js) 입니다.
> 대분류 A/B/C/D와 소분류 번호가 양쪽 문서에서 1:1로 대응합니다.

## 0. 한눈에 보는 분류 체계

| 대분류 | 유형 (소분류) | 형태 |
|---|---|---|
| **A. 시스템 징글** | 프렐류드/타이틀, 승리 팡파레, 레벨업/획득, 여관/회복, 게임오버(전멸), 세이브/이벤트 | 짧은 원샷(2~15초), 루프 없음 |
| **B. 탐험 (장소)** | 오버월드/필드, 마을, 성/왕궁, 던전/동굴, 탑/신전/고대유적, 배/비공정, 특수 지형, 폐허/파멸한 세계, 마계/최종 던전 | 루프 1~3분 |
| **C. 전투** | 일반 전투, 보스, 라이벌/특수 보스, 최종 보스, 결전 직전, 도주/추격 | 루프 1~2분 (최종보스는 다악장) |
| **D. 드라마/감정** | 슬픔·애도(진혼곡), 이별·회상, 사랑, 희망·재기, 당당·영웅적 행진, 불길·서스펜스, 악역 테마, 코믹, 신비·환상, 캐릭터 테마, 축제·무도회, 오프닝 서곡, 엔딩·스태프롤 | 이벤트 전용, 루프 또는 원샷 |

---

## A. 시스템 징글 (System Jingles)

### A-1. 프렐류드 / 타이틀
- **기능**: 시리즈 정체성. 게임을 켰을 때 "이 시리즈다"를 각인. 세이브 선택 화면에서도 흔히 재생.
- **음악적 특징**: 아르페지오(FF) 또는 관현악 행진곡(DQ). 조용하고 정적이거나(FF), 웅장하고 당당(DQ). 시리즈 전체가 같은 모티프 재사용.
- **대표곡**
  - FF 전 시리즈 – *Prelude* (하프 아르페지오, FF1부터 고정)
  - DQ 전 시리즈 – *Overture / 序曲* (관현악 행진곡, DQ1부터 고정)
  - CT – *Presentiment / 予感* (타이틀, 불길한 정적) → *Chrono Trigger* (메인 테마, 시계 소리로 시작)
  - Ys I – *Feena* (타이틀, 서정적)
  - Ys II – *To Make the End of Battle* (타이틀/오프닝, 록 계열 — 시리즈 대표곡)
  - SD2 – *Fear of the Heavens / 天使の怖れ* (타이틀, 고래 울음 SFX + 피아노)
  - SD3 – *Meridian Child*
  - RS1~3 – *Opening Title* (각 작품별로 다르나 이토 켄지 특유의 장중한 서곡)

### A-2. 승리 팡파레 (Victory Fanfare)
- **기능**: 전투 종료 보상. 경험치/아이템 화면 동안 재생. 짧은 팡파레 + 루프되는 후반부 구조가 흔함.
- **음악적 특징**: 장조, 트럼펫/브라스 팡파레, 4~8마디. 상승 음형.
- **대표곡**
  - FF 시리즈 – *Victory Fanfare* (FF1~ 전 시리즈 공통. 가장 유명한 게임 팡파레)
  - CT – *Fanfare 1* (일반 승리) / *Fanfare 2*, *Fanfare 3* (이벤트 성공용)
  - RS 시리즈 – *Victory* (짧고 화려한 브라스)
  - SD2 – *Victory / 勝利*
  - DQ: 전투 후 별도 팡파레가 **없음** (레벨업 징글만). 시리즈별 차이점으로 중요.

### A-3. 레벨업 / 획득 / 성공
- **기능**: 성장 및 보상 피드백. 0.5~3초.
- **대표곡**
  - DQ – *Level Up / レベルアップ* (전 시리즈 동일. 5음 상승 징글)
  - DQ – *Item Get*, *Curse / 呪い* (저주 아이템 착용 시 불협화음 — 실패형 징글)
  - FF – *Item Get*, 스토리 이벤트용 짧은 팡파레
  - Ys – 레벨업 시 별도 징글 없이 SFX (액션 RPG 특성)

### A-4. 여관 / 회복 / 휴식
- **기능**: 화면 페이드아웃 후 HP/MP 회복. 안도감.
- **음악적 특징**: 자장가풍, 3~5초, 하강 종지.
- **대표곡**
  - DQ – *Inn / 宿屋* (전 시리즈 공통, 매우 유명)
  - FF – *Inn / 宿屋* (FF1~6 공통 하프 징글)
  - CT – *Inn* (짧은 종소리)
  - DQ – *Church / 教会* (부활·저주 해제 — 오르간, 경건)
  - FF – *Sleep* (텐트/오두막 사용 시)

### A-5. 게임오버 / 전멸
- **기능**: 실패 통보. 짧고 무겁게. (DQ는 예외: 왕이 부활시키므로 별도 음악 흐름)
- **음악적 특징**: 단조, 느린 하강, 종결 없이 페이드. 5~15초.
- **대표곡**
  - FF1~6 – *Dead Music / Game Over* (Prelude 변주형 애가)
  - DQ2 – *Requiem / レクイエム* (전멸 시 왕에게 돌아갈 때 + 이벤트 애도곡 겸용)
  - DQ1 – *Death / 死* (매우 짧은 하강 징글)
  - CT – *Game Over* (짧은 단조 종지)
  - Ys – *Game Over* (짧은 단조)

### A-6. 세이브 / 크리스탈 / 신성 오브젝트
- FF – *Crystal Room / クリスタルの部屋* (FF3/4/5. 크리스탈 앞, 신비·정적)
- DQ – *Chapel* (교회 세이브)

---

## B. 탐험 — 장소별 BGM (Exploration)

### B-1. 오버월드 / 필드 (모험의 시작)
- **기능**: 가장 오래 듣는 곡. 여정의 광활함과 기대감. 후반부 필드는 톤이 바뀌기도 함 (희망 → 불안 → 재기).
- **음악적 특징**: 중간 템포(90~120), 장조/도리안, 넓은 음역 선율, 반복 견딜 수 있는 2~3분 루프. 보통 A-B-A 구조.
- **대표곡**
  - FF1 – *Main Theme* (시리즈 메인 테마 원형)
  - FF2 – *Main Theme*
  - FF3 – *Eternal Wind / 悠久の風* (시리즈 필드곡 중 최고 인기 중 하나)
  - FF4 – *Main Theme of Final Fantasy IV* (전반) / *Another Moon* (달 표면, 후반)
  - FF5 – *Main Theme of Final Fantasy V (Four Hearts)* / *Cursed Earth* (제3세계)
  - FF6 – *Terra's Theme / ティナ* (전반, 붕괴 전 세계) / *Dark World / 死界* → *Searching for Friends / 仲間を求めて* (후반, 붕괴 후 세계)
  - DQ1 – *Unknown World / 広野を行く* (혼자 걷는 고독)
  - DQ2 – *Only Lonely Boy* (1인) → *Endless World / 果てしなき世界* (3인 파티 후, 밝아짐) — **파티 규모에 따라 필드곡 교체**
  - DQ3 – *Adventure / 冒険の旅* (필드 명곡)
  - DQ4 – *Wagon Wheel's March / 馬車のマーチ* (5장 필드)
  - DQ5 – *Toward the Horizon / 地平の彼方へ*
  - DQ6 – *Through the Fields / 木漏れ日の中で*
  - CT – *Memories of Green / 緑の思い出* (1000 A.D.) / *Wind Scene (Yearnings of the Wind) / 風の憧憬* (600 A.D.) / *Ruined World* (2300 A.D. 황폐) — **시대별로 필드곡 교체**
  - Ys I – *First Step Towards Wars* (필드 겸 일반 전투곡 — Ys는 범프 시스템이라 필드곡이 전투곡을 겸함)
  - Ys II – *Ruins of Moondoria*
  - RS3 – *Overworld (フィールド)* 계열
  - SD2 – *Into the Thick of It / 少年は荒野をめざす*

### B-2. 마을 (평화, 일상)
- **기능**: 안전지대. 긴장 해소, 정보 수집.
- **음악적 특징**: 느린~중간 템포, 목관·플루트·리코더·오보에, 민속 무곡풍(3/4, 6/8 흔함), 짧은 루프. 국가/문화별로 변주 (아랍풍, 동양풍 등).
- **대표곡**
  - FF1 – *Town / 街*
  - FF4 – *Welcome to Our Town / 街のテーマ* / *Mystic Mysidia* (마법 도시, 신비) / *Troian Beauty* (트로이아, 하프) / *Land of Dwarves* (드워프, 코믹)
  - FF5 – *Harvest / 街のテーマ* / *Home Sweet Home* (주인공 고향)
  - FF6 – *Kids Run Through the City Corner / 街角の子供達* / *Slam Shuffle* (조조, 재즈풍 무법지대)
  - DQ1 – *People / 街の人々*
  - DQ2 – *Pastoral / 街の賑わい*
  - DQ3 – *Town / 街* / *Village / 村* (마을 규모별 구분)
  - DQ4 – *Homeland / 故郷*
  - CT – *Peaceful Days / やすらぎの日々* (1000 A.D. 마을) / *Rhythm of Wind, Sky and Earth* (원시시대 이오카 마을, 타악)
  - Ys I – *Fountain of Love* (미네아 마을)
  - Ys II – *Tender People* (라미아 마을) / *Companile of Lane* (랜스 마을, 종소리)
  - Ys III – *Trading Town of Redmont*

### B-3. 성 / 왕궁 (위엄, 권위)
- **기능**: 왕의 알현, 임무 부여. 격식.
- **음악적 특징**: 관현악, 브라스·팀파니, 바로크풍 대위법(DQ), 느린 행진.
- **대표곡**
  - DQ1 – *Chateau Ladutorm / ラダトーム城* (시리즈 성곡 원형)
  - DQ2/3 – *Castle / 王宮*
  - DQ5 – *Castle Trumpeter / 王宮のトランペット*
  - FF1 – *Cornelia Castle*
  - FF2 – *The Rebel Army / 反乱軍のテーマ* (성이자 진영 테마)
  - FF4 – *Kingdom Baron / バロン王国* (위압적) / *Fabul* (동양풍 무술의 나라)
  - FF6 – *The Empire "Gestahl" / 帝国* (악의 제국, 군국주의 행진)
  - CT – *Guardia Castle (Courage and Pride)* / *Zeal Palace* (부유 왕국, 신비)

### B-4. 던전 / 동굴 (긴장, 미스터리)
- **기능**: 탐색 긴장. 랜덤 인카운터 사이의 불안감.
- **음악적 특징**: 단조, 느린 템포, 저음 오스티나토, 불협 화음, 에코·리버브, 미니멀.
- **대표곡**
  - FF1 – *Matoya's Cave* (마녀의 동굴, 신비) / *Gurgu Volcano* (화산)
  - FF4 – *Into the Darkness / 深淵*
  - FF5 – *Dungeon / ダンジョン*
  - FF6 – *The Mines of Narshe* / *Phantom Forest*
  - DQ1 – *Dungeon / 洞窟* (층이 깊어질수록 **피치가 내려가는** 유명한 연출)
  - DQ3 – *Dungeon / ダンジョン*
  - DQ4 – *Frightening Dungeons / 恐怖の洞窟*
  - CT – *Secret of the Forest* (숲, 신비하지만 밝음) / *Underground Sewer* / *Lab 16's Ruin*
  - Ys II – *Subterranean Canal* / *Rasteenie Mine*
  - Ys I – *Beat of the Terror* (폐광)

### B-5. 탑 / 신전 / 고대 유적 (장엄, 시련)
- **음악적 특징**: 오르간·파이프, 상승 음형, 종교적 분위기, 스케일 큰 루프.
- **대표곡**
  - FF3 – *Crystal Tower* / *Forbidden Land Eureka*
  - FF4 – *Mt. Ordeals / 試練の山* / *Tower of Zot* / *Giant of Babil*
  - FF6 – *Devil's Lab / 魔導研究所* (공장, 기계적 리듬)
  - CT – *Manoria Cathedral* / *Tyranno Lair* / *Ocean Palace* / *Black Omen*
  - Ys I – *Palace* (솔로몬 신전) / *Palace of Destruction*, *Tower of the Shadow of Death* (다름의 탑)
  - Ys II – *Palace of Salmon* (살몬 신전) / *Moat of Burnedbless*
  - Ys III – *Valestein Castle* / *Illburns Ruins*
  - DQ5 – *Tower of Death / 死の塔*

### B-6. 배 / 비공정 / 탈것 (해방감)
- **기능**: 이동 수단 획득 = 세계가 열리는 순간. 필드곡보다 빠르고 밝음.
- **음악적 특징**: 빠른 템포, 스윙/행진, 상승 브라스.
- **대표곡**
  - FF1 – *Ship / 海* / *Airship / 飛空艇*
  - FF3 – *Go Above the Clouds! / 雲の上へ* / *The Boundless Ocean*
  - FF4 – *The Red Wings / 赤い翼* (비공정단 — B-6이자 D-5 당당 테마) / *Hey Cid!*
  - FF6 – *The Airship Blackjack* / *The Serpent Trench*
  - DQ2 – *Sailing / 海原を行く*? (배 획득 후)
  - DQ3 – *Heavenly Flight / おおぞらをとぶ* (불사조 라미아, 시리즈 최고 명곡 중 하나)
  - DQ5 – *Sailing / 海の風*? (배)
  - DQ6 – *Pegasus / ペガサス*
  - CT – *Wings That Cross Time / 時の翼* (에포크)
  - SD2 – *Flight into the Unknown* (플라미)
  - **초코보 테마** (FF2~) — 탈것이자 코믹 (D-8 참조): *Chocobo Theme*, *Mambo de Chocobo*, *Samba de Chocobo*, *Techno de Chocobo*

### B-7. 특수 지형 (설원·사막·바다·화산·숲)
- 설원: Ys II – *Ice Ridge of Noltia* / FF6 – *The Mines of Narshe*(설산 도시)
- 사막/아랍풍: FF6 – *Wild West* (남부 대륙, 서부극풍) / DQ4 – *Desert*
- 화산: FF1 – *Gurgu Volcano*
- 초원/원시: CT – *Primitive Mountain*, *Burn! Bobonga!*
- 바다 속: FF1 – *Sunken Shrine* / FF3 – *Beneath the Horizon*
- 정글/야생: FF6 – *The Veldt* (가우, 타악 중심)

### B-8. 폐허 / 파멸한 세계 (절망)
- **기능**: 스토리 중반 대재앙 이후. 필드곡의 톤이 완전히 바뀜.
- **음악적 특징**: 매우 느림, 단조, 텅 빈 음향, 바람 소리, 페달 포인트.
- **대표곡**
  - FF6 – *Dark World / 死界* (붕괴 후 세계 필드, 절망) → 팔콘 획득 후 *Searching for Friends*(희망)으로 전환
  - CT – *Ruined World / 荒れ果てた世界* (2300 A.D.) / *Lab 16's Ruin* / *Derelict Factory*
  - DQ2 – *Requiem* (문브루크 성 폐허)
  - FF5 – *Cursed Earth / 呪われし大地*

### B-9. 마계 / 최종 던전
- FF1 – *Temple of Chaos*
- FF2 – *Pandaemonium / パンデモニウム* (마계 성)
- FF4 – *The Lunarians / 月の民*, *Another Moon*
- FF5 – *The Evil Lord Exdeath / エクスデス城* / *The Void*
- FF6 – *Kefka's Tower / 魔塔*
- CT – *Black Omen* / *Lavos's Theme*
- DQ3 – *Alefgard*(반전 지하세계) / *Zoma's Castle*
- Ys I – *Devil's Wind* (다름의 탑 최상층)

---

## C. 전투 (Battle)

### C-1. 일반 전투 (Normal Battle)
- **기능**: 랜덤 인카운터. 수백 번 듣게 되므로 질리지 않는 속도감이 핵심. 짧은 인트로(1~2초) 후 바로 본 루프.
- **음악적 특징**: 빠른 템포(140~180), 단조, 리듬 섹션 강조(베이스 오스티나토 + 드럼), 짧은 루프(40~60초), 록/프로그레시브 영향(우에마츠·이토), 관현악 행진(스기야마).
- **대표곡**
  - FF1 – *Battle*
  - FF2 – *Battle Scene 1*
  - FF3 – *Battle 1*
  - FF4 – *Fight 1 / バトル1*
  - FF5 – *Battle 1*
  - FF6 – *Battle / 戦闘*
  - DQ1 – *Fight / 戦闘*
  - DQ2 – *Fight*
  - DQ3 – *Fighting Spirits / 戦闘のテーマ*
  - DQ4 – *Battle / 戦闘*
  - DQ6 – *Brave Fight / 勇気ある戦い*?
  - CT – *Battle 1*
  - RS1 – *Battle 1 / バトル1*, *Battle 2 / バトル2* (이토 켄지 — 신디 리드 + 하드록, 시리즈 상징)
  - RS2 – *Battle 1*, *Battle 2*
  - RS3 – *Battle 1*, *Battle 2*
  - SD2 – *Danger*(보스)와 달리 일반 전투는 필드곡 그대로 (심리스 액션 RPG)
  - Ys I/II – 일반 전투 전용곡 **없음** (필드곡이 전투곡 겸용, 범프 시스템)
  - Ys III – *Be Careful* (일반 스테이지 전투 겸)

### C-2. 보스 전투 (Boss Battle)
- **기능**: 스토리 상 중요한 적. 일반 전투보다 위압감·긴박감.
- **음악적 특징**: 더 빠르거나 더 무거움, 불협 화음, 변박, 저음 브라스, 인트로가 김(등장 연출).
- **대표곡**
  - FF2 – *Battle Scene 2*
  - FF3 – *Battle 2*
  - FF4 – *Fight 2 / バトル2* / *The Dreadful Fight / ゴルベーザ四天王とのバトル* (4천왕전, 시리즈 최고 보스곡 중 하나)
  - FF5 – *The Decisive Battle / 決戦*
  - FF6 – *The Decisive Battle / 決戦* / *The Fierce Battle / 死闘* (아트마 웨폰 등)
  - DQ2 – *Deathfight / 死を賭して*
  - DQ3 – *Hero's Challenge / 勇者の挑戦* (바라모스·조마전)
  - DQ4 – *Battle for the Glory / 栄光への戦い*
  - DQ5 – *Satan / 不死身の敵に挑む*
  - CT – *Boss Battle 1* / *Boss Battle 2*
  - RS1 – *Passionate Rhythm / 熱情の律動*? (강적전)
  - RS2 – *Seven Heroes Battle / 七英雄バトル* (시리즈 대표 보스곡)
  - RS3 – *Four Noble Devils Battle 1 & 2 / 四魔貴族バトル1・2*
  - SD2 – *Danger / 危機*
  - SD3 – *Nuclear Fusion*
  - Ys I – *Holders of Power* (보스 공통)
  - Ys II – *Protectors* (보스 공통)
  - Ys III – *Chop!!* / *A Searing Struggle*

### C-3. 라이벌 / 특수 보스 (전용 전투곡)
- **기능**: 특정 인물과의 대결에 전용곡. 캐릭터 테마의 전투 변주인 경우가 많음.
- **대표곡**
  - FF5 – *Clash on the Big Bridge / ビッグブリッヂの死闘* (길가메시, 시리즈 최고 인기 전투곡)
  - CT – *Battle with Magus / 魔王決戦* (마왕 전용)
  - FF6 – 캐릭터 전용 전투곡 없음 (오페라 *Grand Finale*가 이벤트 전투 연출에 가까움)
  - FF4 – *Golbez, Clad in Darkness* (골베자 등장 시 — 전투곡은 아니고 위압 연출)
  - RS2 – 칠영웅 각각 테마 없이 공통 *Seven Heroes Battle*
  - Ys II – *Termination* (다름 전용 — 최종보스이자 유일한 전용 전투곡)

### C-4. 최종 보스 (Final Battle)
- **기능**: 클라이맥스. 페이즈별로 곡이 바뀌거나 다악장 구성.
- **음악적 특징**: 파이프오르간(종교적/초월적), 합창, 다악장(느림→빠름), 길이 5분 이상. 페이즈 전환 = 악장 전환.
- **대표곡**
  - FF1 – *Last Battle* (카오스)
  - FF3 – *This is the Last Battle* (암흑의 구름)
  - FF4 – *The Final Battle / 最後の闘い* (제로무스, 오르간 인트로)
  - FF5 – *The Final Battle / 最後の戦い* (네오 엑스데스)
  - FF6 – *Dancing Mad / 妖星乱舞* (케프카, 4악장 17분 — 오르간+합창, 최종보스곡의 정점)
  - DQ1 – 용왕전 전용곡 없음 (일반 *Fight* 사용) — 초기작의 한계
  - DQ3 – *Hero's Challenge* (조마, 보스곡 공용)
  - DQ4 – *Battle for the Glory* (보스곡 공용, 최종보스 전용곡 없음)
  - DQ5 – *Satan*
  - CT – *World Revolution / 世界変革の時* (라보스 외피) → *Last Battle / ラストバトル* (라보스 코어) — **페이즈별 교체**
  - RS1 – *Saruin (サルーイン)* 최종전 (이토 켄지)
  - RS2 – *Last Battle / ラストバトル* (합체 칠영웅)
  - RS3 – *Last Battle / ラストバトル* (파괴신)
  - SD2 – *Meridian Dance / 子午線の祀り* (마나의 성수)
  - SD3 – *Sacrifice Part 3*
  - Ys I – *Final Battle* (다크 팩트)
  - Ys II – *Termination* (다름)

### C-5. 결전 직전 / 결의 (Determination)
- **기능**: 최종 던전 진입 전, 파티 결의 장면. 전투곡은 아니지만 긴장 상승.
- **대표곡**
  - CT – *Determination / 決意*
  - FF6 – *The Returners / リターナー* (반군 결의)
  - FF4 – *Suspicion / 疑惑*(불안) → *Run!*(긴급)
  - DQ4 – *Battle for the Glory* 인트로 부분

### C-6. 도주 / 추격 / 긴급 (Escape, Chase)
- **기능**: 시간 제한 탈출, 추격 시퀀스. 카운트다운.
- **음악적 특징**: 매우 빠름, 반복 짧은 프레이즈, 상승 크로매틱.
- **대표곡**
  - FF4 – *Run! / 走れ!*
  - FF5 – *Hurry! Hurry! / 急げ!急げ!*
  - FF6 – *Save Them! / 救出* / *Catastrophe / 崩壊* (부유 대륙 붕괴, 탈출 카운트다운)
  - CT – *Bike Chase* (조니 레이스) / *Confusion*
  - DQ – *Escape* 징글 (도망 성공 시)

---

## D. 드라마 / 감정 (Emotional & Story Events)

### D-1. 슬픔 / 애도 / 진혼곡 (Sorrow, Mourning, Requiem)
- **기능**: 캐릭터 사망, 마을 파괴, 희생. 게임에서 가장 기억에 남는 순간을 담당.
- **음악적 특징**: 단조, 느린 템포(50~70), 피아노·현·오보에 독주, 긴 서스테인, 종결감 없는 반복, 화성 진행이 단순.
- **대표곡**
  - FF2 – 전용 애도곡 없음 (동료 사망이 잦은데도 *Dead Music*·정적으로 처리 — 초기작)
  - FF3 – *Elia, the Maiden of Water / 水の巫女エリア* (엘리아 희생. 시리즈 초기 애도곡의 원형)
  - FF4 – *Cry in Sorrow / 哀しみのテーマ* (미시디아 학살, 팔롬·포롬 석화, 텔라 사망 등 — 시리즈 대표 애도곡)
  - FF5 – *Dear Friends / はるかなる故郷* (회상·우정) / *Requiem*? (갈프 사망 장면 — 곡명 재확인 필요)
  - FF6 – *Epitaph / 墓碑銘* (피가로 형제 부친 사망 회상, 섀도우 등) / *Forever Rachel / レイチェル* (로크의 상실) / *Coin Song / コイン* (형제 이별) / *Rest in Peace* (다릴, 셋저 회상)
  - DQ2 – *Requiem / レクイエム* (문브루크 멸망, 전멸)
  - DQ4 – *Elegy / エレジー* (시리즈 대표 애도곡. 5장 로자·시몬 등)
  - DQ5 – *Sorrow / 哀愁物語*? (파파스 사망 등)
  - CT – *At the Bottom of Night / 夜の底にて* (마르의 소멸, 크로노 사망 이후 등) / *Silent Light / 静かな光* / *Far Off Promise / 遠い約束* (오르골, 상실과 약속)
  - Ys I – *Rest in Peace* (엔딩 — 애도 겸)
  - Ys III – *Tearful Twilight*
  - SD2 – *A Wish / ひとつの願い*? / *Prophecy / 予言*
  - SD3 – *Angel's Fear*

### D-2. 이별 / 회상 / 향수 (Farewell, Reminiscence)
- **기능**: 플래시백, 고향, 헤어짐. 애도보다 부드럽고 따뜻함.
- **음악적 특징**: 장조지만 느림, 오르골·하프·피아노, 옛 선율의 재인용(모티프 회귀).
- **대표곡**
  - FF5 – *Dear Friends / はるかなる故郷* / *Home Sweet Home*
  - FF6 – *Awakening / 目覚め* (티나) / *Relm / リルム*
  - FF4 – *Melody of Lute / ギルバートのリュート* (길버트, 상실)
  - CT – *Memories of Green* / *Epilogue - To Good Friends* / *Far Off Promise*
  - DQ2 – *My Road, My Journey / この道わが旅* (엔딩, 향수)
  - DQ4 – *Homeland*
  - Ys II – *Lilia* (릴리아, 서정) / *Don't Go So Away* / *A Still Time*
  - Ys I – *See You Again*

### D-3. 사랑 / 애정 (Love Theme)
- **기능**: 연인, 남녀 주인공 장면. 시리즈 대표곡이 되기도 함.
- **음악적 특징**: 장조, 느린 3박 또는 4박, 현악 중심, 넓은 도약 선율.
- **대표곡**
  - FF4 – *Theme of Love / 愛のテーマ* (로자·세실. 일본 초등 음악 교과서 수록)
  - FF6 – *Celes / セリス* / *Aria di Mezzo Carattere* (오페라 아리아 — 극중극)
  - CT – *Schala's Theme / サラのテーマ* (사라, 신비·애수) / *Far Off Promise*
  - Ys I – *Feena*
  - Ys II – *Lilia*
  - DQ5 – *Bridal Waltz / 結婚ワルツ* (결혼식) / *Love Song Sagashite*(DQ2 주제가)

### D-4. 희망 / 재기 / 출발 (Hope, Rebirth)
- **기능**: 절망 후 다시 일어서기. 붕괴한 세계에서 동료를 찾아가는 장면.
- **음악적 특징**: 단조로 시작해 장조로 풀리거나, 처음부터 밝은 상승 선율. 필드곡을 겸함.
- **대표곡**
  - FF6 – *Searching for Friends / 仲間を求めて* (붕괴 후 팔콘 비공정. 절망 후 희망의 대표곡)
  - FF3 – *Eternal Wind*
  - FF2 – *The Rebel Army / 反乱軍のテーマ* (저항의 희망)
  - DQ2 – *Endless World* (동료 합류 후)
  - DQ3 – *Into the Legend / そして伝説へ* (엔딩)
  - CT – *Chrono Trigger* (메인, 결의와 희망) / *Frog's Theme / カエルのテーマ* (기사의 재기)
  - Ys II – *To Make the End of Battle* (싸움을 끝내기 위해 — 제목부터 결의)

### D-5. 당당 / 영웅적 / 군대 행진 (Heroic March, Pride)
- **기능**: 군대 출정, 영웅의 등장, 위풍당당한 진영. 악의 군대면 위압, 아군이면 고양.
- **음악적 특징**: 2/4 또는 4/4 행진곡, 스네어 드럼, 브라스 팡파레, 점음표 리듬.
- **대표곡**
  - FF4 – *The Red Wings / 赤い翼* (바론 비공정단 출정 — 게임 오프닝. 시리즈 최고 행진곡)
  - FF2 – *The Rebel Army* (반란군, 자긍심)
  - FF6 – *Troops March On / 帝国の進軍*(제국군 행진, 위압) / *Edgar & Sabin / エドガー、マッシュ* (왕가의 당당함) / *The Returners*
  - DQ 전 시리즈 – *Overture* (서곡 자체가 영웅 행진)
  - DQ4 – *Wagon Wheel's March*
  - CT – *Frog's Theme* (기사도, 게임 내 최고 당당 테마) / *Guardia Castle (Courage and Pride)*
  - Ys II – *To Make the End of Battle*
  - Ys III – *The Boy's Got Wings* (오프닝, 록 당당)
  - SD3 – *Meridian Child*

### D-6. 불길 / 음모 / 서스펜스 (Ominous, Suspense)
- **기능**: 뭔가 잘못됐다는 예감. 배신, 함정, 악역 등장 직전.
- **음악적 특징**: 저음 페달, 반음계, 트레몰로 현, 불규칙 리듬, 침묵 활용.
- **대표곡**
  - FF4 – *Suspicion / 疑惑* / *Golbez, Clad in Darkness / ゴルベーザ* (오르간, 등장 위압)
  - FF6 – *Omen / 予兆* (오프닝, 마도 아머 행진) / *Metamorphosis / 変貌* — 케프카 등장 시에는 무음도 자주 활용
  - FF5 – *The Evil Lord Exdeath*
  - CT – *Presentiment* / *Strange Occurrences / 不思議な出来事* / *Mystery of the Past* / *Sealed Door / 封印の扉* / *Undersea Palace* (긴장 상승형)
  - Ys I – *Tension* (다크 팩트 대면)
  - SD2 – *The Oracle / 呪術師*

### D-7. 악역 테마 (Villain Theme)
- **기능**: 악역의 캐릭터 정체성. 코믹·광기(케프카)부터 초월적 공포(라보스)까지.
- **음악적 특징**: 반음계, 오르간, 왜곡된 왈츠/행진(광기), 혹은 무조에 가까운 텍스처(우주적 공포).
- **대표곡**
  - FF6 – *Kefka / ケフカ* (광대 행진, 광기 코믹) → *Dancing Mad* (신격화)
  - FF4 – *Golbez, Clad in Darkness* (오르간 위압)
  - FF5 – *The Evil Lord Exdeath*
  - FF6 – *The Empire "Gestahl"*
  - CT – *Magus's Theme (Battle with Magus)* / *Lavos's Theme / ラヴォスのテーマ* (초월적)
  - DQ3 – *Zoma*? (보스곡 공용) / DQ5 – *Satan*
  - RS2 – *Seven Heroes* 테마 (칠영웅)

### D-8. 코믹 / 유머 / 마스코트 (Comic Relief)
- **기능**: 긴장 완화. 초코보·무그·스펙키오 등 마스코트나 개그 장면.
- **음악적 특징**: 빠른 장조, 스타카토, 라틴/재즈/랙타임, 관악 유머.
- **대표곡**
  - FF 시리즈 – *Chocobo Theme* (FF2~) / *Mambo de Chocobo* (FF5) / *Samba de Chocobo* (FF4) / *Techno de Chocobo* (FF6)
  - FF5 – *Critter Tripper Fritter!? / モーグリのテーマ* (무그)
  - FF6 – *Mog* / *Spinach Rag* (랙타임, 술집) / *Johnny C. Bad* (재즈)
  - FF4 – *Dancing Calcobrena* (인형 무곡, 코믹+섬뜩) / *Palom & Porom* / *Land of Dwarves*
  - CT – *Delightful Spekkio* / *Gonzales's Song / ゴンザレスのうた* / *Bike Chase*
  - DQ4 – *Casino / カジノ*
  - SD2 – *Eternal Recurrence*? (코믹 장면)

### D-9. 신비 / 환상 / 초월 (Mystical, Ethereal)
- **기능**: 고대 문명, 마법 왕국, 시간의 틈, 신비한 존재.
- **음악적 특징**: 페달 톤, 모달(리디안·도리안), 신디 패드, 벨/첼레스타, 부유하는 리듬.
- **대표곡**
  - CT – *Corridors of Time / 時の回廊* (지르 왕국. 미츠다 최고 명곡. 시타르+타블라 느낌) / *Zeal Palace* / *Schala's Theme* / *End of Time / 時の最果て*
  - FF4 – *Mystic Mysidia* / *The Lunarians* / *Illusionary World / 幻想*
  - FF6 – *Awakening* / *Metamorphosis*
  - FF3 – *Forbidden Land Eureka* / *Crystal Tower*
  - FF5 – *The Book of Sealings / 封印の書* / *Music Box*
  - DQ3 – *Heavenly Flight*
  - Ys I – *Dreaming* / *Palace*
  - SD2 – *Fear of the Heavens* / *Phantom and a Rose*

### D-10. 캐릭터 테마 (Character Leitmotif)
- **기능**: 캐릭터 등장/이벤트마다 반복. 전투곡·애도곡의 변주 원천.
- **대표 사례**
  - FF6 – 14명 전원 테마 보유: *Terra*, *Locke*, *Edgar & Sabin*, *Celes*, *Shadow*, *Cyan*, *Gau*, *Setzer*, *Strago*, *Relm*, *Mog*, *Umaro*, *Gogo*, *Kefka* — **JRPG 캐릭터 테마 체계의 완성형**
  - FF4 – *Rydia*, *Theme of Love*(로자), *Melody of Lute*(길버트), *Palom & Porom*, *Golbez*
  - CT – *Frog's Theme*, *Robo's Theme*, *Ayla's Theme*, *Magus's Theme*, *Schala's Theme*, *Lavos's Theme*
  - Ys – *Feena*, *Lilia*
  - DQ4 – 장별 주인공 테마(라이언·아리나·트루네코·미네아/마냐 — 각 장의 필드곡이 캐릭터 테마)
  - RS1 – 8명 주인공 각각의 오프닝 테마 (프리 시나리오 시스템)

### D-11. 축제 / 무도회 / 극중극 (Festival, Ball, Opera)
- **기능**: 화려한 연출. 게임 안에서 음악 자체가 이벤트의 중심.
- **대표곡**
  - FF6 – *Aria di Mezzo Carattere* / *The Wedding Waltz ~ Duel* / *Grand Finale* (오페라 극장, 16비트 성악 합성)
  - CT – *Guardia Millennial Fair / ガルディア千年祭* (축제) / *First Festival of Stars* (엔딩 축제)
  - DQ5 – *Bridal Waltz* (결혼)
  - FF5 – *Waltz Suomi* / *Tenderness in the Air*
  - FF6 – *Spinach Rag* (술집 피아노) / *Johnny C. Bad*
  - DQ4 – *Casino*

### D-12. 오프닝 서곡 / 프롤로그 컷신
- **기능**: 타이틀 이후 스토리 도입. 세계관과 톤을 제시.
- **대표곡**
  - FF1 – *Opening Theme / オープニング・テーマ* (다리 건너는 장면 — 나중에 시리즈 "메인 테마"가 됨)
  - FF4 – *Prologue* + *The Red Wings*
  - FF6 – *Omen* (눈 속 마도 아머 행진, 3부 구성)
  - CT – *Morning Sunlight / 朝の日ざし* (종소리 알람)
  - Ys II – *To Make the End of Battle*
  - Ys III – *The Boy's Got Wings* / *Prelude to the Adventure*
  - SD2 – *Fear of the Heavens*
  - SD3 – *Angel's Fear*
  - RS – 각 주인공별 프롤로그

### D-13. 엔딩 / 피날레 / 스태프롤
- **기능**: 여정의 총결산. 등장한 모든 테마를 메들리로 재인용하는 경우가 많음.
- **음악적 특징**: 10분 이상, 다악장, 메인 테마의 장조 확장, 캐릭터 테마 메들리(FF6 *Ending Theme* 21분).
- **대표곡**
  - FF1 – *Ending Theme*
  - FF4 – *Epilogue / エピローグ*
  - FF5 – *Ending Theme* / *Dear Friends*
  - FF6 – *Balance is Restored / 蘇る緑* (캐릭터 테마 전곡 메들리)
  - DQ2 – *My Road, My Journey*
  - DQ3 – *Into the Legend / そして伝説へ*
  - DQ4 – *Finale*
  - CT – *To Far Away Times / 遥かなる時の彼方へ* (스태프롤. 명곡) / *Epilogue - To Good Friends*
  - Ys I – *Rest in Peace* → *See You Again*
  - Ys II – *A Still Time* → *Stay with Me Forever*
  - SD2 – *Meridian Dance* → *Together Always*? (스태프롤)
  - RS3 – *Ending*

---

## E. 시리즈별 음악 설계 성향 요약

| 시리즈 | 작곡가 | 사운드 성향 | 특징적 장면-음악 규칙 |
|---|---|---|---|
| **FF** | 우에마츠 노부오 | 프로그레시브 록 + 관현악 + 클래식 | 시리즈 공통 징글(Prelude, Victory, Chocobo). 캐릭터 테마 체계(FF4~6). 최종보스 다악장. 붕괴 전/후 필드곡 교체 |
| **DQ** | 스기야마 코이치 | 정통 관현악, 바로크·고전 형식 | 서곡·레벨업·여관 징글 전 시리즈 고정. 전투 승리 팡파레 없음. 필드곡이 파티 상황(인원/탈것)에 따라 교체. 던전 깊이별 피치 하강 |
| **Ys** | 코시로 유조 / 이시카와 미에코 / Falcom jdk | 일본 록·퓨전, 신디 리드, 빠른 템포 | **일반 전투곡 없음**(필드곡 겸용). 보스 공용곡 1곡 + 최종보스 전용. 히로인 테마(Feena, Lilia)가 서정 축. PC엔진 CD판은 라이브 밴드 편곡 |
| **RS/SaGa** | 이토 켄지 | 하드록 전투, 장중한 서곡 | 전투곡이 시리즈 정체성(Battle 1/2 + 특급 보스 + 라스트). 프리 시나리오라 주인공별 테마. 전투곡 수가 필드곡보다 많음 |
| **CT** | 미츠다 야스노리 (+우에마츠) | 월드뮤직·앰비언트·재즈 요소 | 시대(1000/600/2300/BC/지르)별 필드곡. 캐릭터 테마 + 시대 테마 이중 구조. 최종전 페이즈별 교체 |
| **SD2/3** | 키쿠타 히로키 | 앰비언트, 자연음 SFX 통합, 다성 | 액션 RPG라 필드=전투. 보스 전용곡 1~2곡. 타이틀곡에 환경음(고래·새) 합성 |

---

## F. 관찰 — 장면 ↔ 음악 매핑 규칙 (설계 참고)

1. **징글은 원샷, 장면은 루프**. 징글(승리·레벨업·여관·게임오버)은 2~15초에 종결감이 있고, 장소/전투곡은 40초~3분 루프에 종결감이 없다.
2. **전투곡은 인트로 1~2초 이내 본론 진입**. 수백 번 듣기 때문. 보스곡은 인트로가 길어도 됨(등장 연출).
3. **같은 장소라도 스토리 국면에 따라 곡 교체**: FF6(붕괴 전/후), DQ2(1인/3인), CT(시대), FF4(지상/달). 필드곡 교체 = 스토리 전환 신호.
4. **애도곡은 단순·느림·독주**. 피아노/오보에/현 한 성부, 50~70 BPM, 화성 3~4개 반복. 게임에서 가장 기억되는 곡군.
5. **당당/영웅 = 행진곡 리듬 + 브라스 + 스네어**. 아군이면 장조(Red Wings 전반, Frog), 적군이면 단조(Troops March On, Gestahl).
6. **악역 = 오르간 또는 왜곡된 춤곡**. 종교적 위압(Golbez, Zeromus, Dancing Mad) 혹은 광기의 왈츠/행진(Kefka, Calcobrena).
7. **최종보스 = 페이즈 = 악장**. 느린 오르간 도입 → 격렬한 전개 → 합창/초월. Dancing Mad, Lavos(World Revolution → Last Battle), Sacrifice.
8. **캐릭터 테마는 이벤트·전투·애도로 변주되어 재사용**. FF6와 CT가 이 체계를 완성. 엔딩에서 전곡 메들리로 회수.
9. **시리즈 공통 징글이 브랜드**. Prelude/Victory(FF), 서곡/레벨업/여관(DQ)은 20년 넘게 유지. 게임 하나를 만들더라도 징글 세트를 먼저 고정하면 정체성이 생긴다.
10. **액션 RPG는 필드=전투**. Ys·성검전설은 일반 전투곡이 없고 필드곡 자체가 빠르다. 턴제는 전투곡 별도.

---

## 참고 소스
- [Music of the SaGa series — Wikipedia](https://en.wikipedia.org/wiki/Music_of_the_SaGa_series)
- [Romancing SaGa Music List — SaGa Wiki](https://saga.fandom.com/wiki/Romancing_SaGa_Music_List)
- [Romancing Saga OSV — Discogs](https://www.discogs.com/release/1921893-Kenji-Ito-Romancing-Saga-Original-Sound-Version)
- [Ys I & II — Wikipedia](https://en.wikipedia.org/wiki/Ys_I_%26_II)
- [Ys Book I & II PC Engine — VGMRips](https://vgmrips.net/packs/pack/ys-book-i-ii-tg-cd)
- [Music of Chrono Trigger — Wikipedia](https://en.wikipedia.org/wiki/Music_of_Chrono_Trigger)
- [Awesome Music in Dragon Quest — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/AwesomeMusic/DragonQuest)
- [Suspiciously Similar Song / Square Enix — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/SuspiciouslySimilarSong/SquareEnix)

> 주의: 곡명은 공식 OST 영문/일문 표기를 병기했으나, 시대·판본(FC/SFC/PC엔진/리메이크)에 따라 표기가 다를 수 있음. `?` 표시는 곡명 또는 사용 장면이 기억에 의존해 확실하지 않은 항목이므로 VGMdb 등에서 재확인 권장.
