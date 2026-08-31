# RPG BGM DJ

옛날 콘솔 RPG(파이널 판타지 / 드래곤 퀘스트 / 이스 / 로맨싱 사가 / 크로노 트리거 / 성검전설)의
BGM 사용 관례를 **34개 장면 유형**으로 분류하고, 각 유형에 대응하는 **저작권 문제 없는 무료 라이선스 음원**을
모아, 윈앰프 감성의 재생기로 틀어주는 프로젝트입니다. 기본 용도는 **일하며 틀어놓기**.

### ▶︎ https://progh2.github.io/rpg-bgm-dj/

치비 DJ **노이즈**가 네 가지 질문으로 지금 필요한 결을 물어보고, 그 자리에서 재생목록을 짜 줍니다.

---

## 이 재생기가 하는 일

- **질답으로 즉석 선곡** — 상황(급함·평온·몰입·지침) / 장소(마을·자연·유적·실내) / 소리 존재감 / 격한 곡 허용 여부를 묻고 40곡을 뽑습니다. 같은 아티스트가 연달아 나오지 않게 흩뿌립니다.
- **윈앰프 감성 셸** — LCD 시간 표시, 스크롤 마퀴, 스펙트럼 애널라이저, 베벨 처리된 창과 버튼.
- **스킨 7종** — Classic / Crystal / Ember / Verdant / Arcane / Sepia / Mono. 고정할 수도, 곡 분위기에 맡길 수도 있습니다.
- **분위기 반응형 배색** — 재생 중인 곡의 장면이 바뀌면 페이지 색조가 따라 변합니다(10가지 무드 팔레트).
- **턴테이블 메타포** — 곡이 바뀌면 반대쪽 덱으로 레코드가 교체되고, 톤암이 내려오며 판이 돕니다. 라벨은 역회전시켜 장면 이름이 읽히게 했습니다.
- **곡 정보와 라이선스 상시 표시** — CC BY 계열은 출처 표기가 라이선스 조건이므로, 아티스트·라이선스·원곡 링크를 항상 띄웁니다. 비상업 조건 곡에는 경고를 붙입니다.

키보드: `Space` 재생/일시정지, `Shift+←/→` 이전/다음 곡.

---

## 문서

| 파일 | 내용 |
|---|---|
| [`classic_rpg_bgm_by_scene.md`](classic_rpg_bgm_by_scene.md) | 1차 조사. 원작 게임들의 BGM이 어떤 장면에 어떤 음악적 특징으로 쓰였는지 정리한 분류 체계 |
| [`classic_rpg_bgm_free_playlist.md`](classic_rpg_bgm_free_playlist.md) | 2차 결과. 분류에 맞춰 수집한 무료 음원 목록 + 라이선스 요약 |

## 데이터

| 파일 | 용도 |
|---|---|
| `bgm-scenes.js` | 재생기가 읽는 데이터. `{id,title,artist,videoId,focus,length,license}` |
| `data/bgm_playlist.json` | 전체 메타데이터(차순위 분류·출처 URL 포함) |
| `data/bgm_playlist.csv` | 스프레드시트로 훑어볼 때 |

다른 데서 쓰려면:

```js
import { BGM_BY_SCENE, FOCUS_PLAYLIST, buildPlaylist, creditFor } from './bgm-scenes.js';

const tracks = FOCUS_PLAYLIST;                                   // 집중도 4 이상 전체
const calm = buildPlaylist(['B2_town','A4_inn','D9_mystic'], 4);  // 장면 골라서
element.textContent = creditFor(currentTrack);                    // "PeriTune — CC BY 4.0"
```

## 집중도(focus)

작업하며 듣기 적합한 정도를 1~5로 매긴 값입니다. 곡 길이(짧은 징글 감점), 차분함/격렬함 키워드,
장면 유형의 기본 성격을 합산합니다.

- **5** 계속 틀어놔도 부담 없음 (마을, 여관, 신비, 회상)
- **4** 작업용으로 무난 (필드, 유적, 애도, 축제)
- **3** 상황에 따라 (성, 던전, 코믹)
- **1~2** 작업용 비권장 (전투, 보스, 추격, 팡파레·징글)

DJ 질답의 "소리 존재감" 답변이 이 하한을 정합니다.

---

## 라이선스 주의

- 대부분 **CC BY 4.0** — 출처 표기만 하면 상업 이용 포함 자유. 재생기에 아티스트명이 표시되는 것이 곧 준수입니다.
- **Vindsvept**, **Derek & Brandon Fiechter** 는 **비상업 조건**입니다. 개인 작업용 재생은 괜찮지만 수익화된 방송·영상에는 쓰지 마세요. 재생 시 경고가 뜹니다.
- **魔王魂 / DOVA-SYNDROME / MusMus / PANICPUMPKIN / Senses Circuit** 등 일본 소스는 각 사이트 이용약관을 따릅니다(대개 무료, 표기 권장).
- YouTube의 "크리에이티브 커먼즈" 검색 필터 결과는 **의도적으로 제외**했습니다. 표본 검사에서 업로더가 CC BY로 잘못 표시한 저작권 음원(파이널 판타지 커버, 게임 음원 리업로드)이 확인되었기 때문입니다. 검증된 공식 아티스트 채널만 사용합니다.
- 타인 작곡의 커버곡, 앨범 통합본·메들리도 걸러냈습니다.

## 수집 재현

```
tools/yt.py                YouTube 검색·채널 목록 스크래핑 (API 키 불필요)
tools/channels.py          무료 라이선스 작곡가 공식 채널 화이트리스트 (48개)
tools/scrape_channels.py   채널별 업로드 전수 수집 → data/channels/*.json
tools/peritune_tags.py     PeriTune 공식 사이트 태그 수집 (곡→분위기 매핑)
tools/classify.py          제목 키워드(영/일/한) → 34개 장면 분류 + 집중도 산출
tools/build.py             분류 실행. incompetech 메타데이터·PANICPUMPKIN 공식 장면분류 반영
tools/verify.py            oEmbed로 영상 존재·임베드 가능 검증 (캐시)
tools/assemble.py          소분류별 선별(아티스트 라운드로빈) → JSON/CSV 출력
tools/make_player_snippet.py  재생기용 bgm-scenes.js 생성
tools/report.py            마크다운 리포트 생성
```

## 재생기 구조

```
index.html              셸 (창 배치)
assets/css/player.css   윈앰프 크롬 · 스킨 변수 · 턴테이블 · 캐릭터 애니메이션
assets/js/app.js        재생 제어 · YouTube IFrame · 상태 관리
assets/js/dj.js         질답 정의 및 재생목록 생성 로직
assets/js/character.js  치비 DJ SVG 아트웍
assets/js/skins.js      스킨 7종 정의 + localStorage
assets/js/moods.js      장면 → 무드 → 팔레트 매핑
```

빌드 도구 없이 순수 ES 모듈로 동작합니다. 로컬에서 볼 때는 `python3 -m http.server` 로 띄우면 됩니다
(`file://` 로는 모듈 임포트가 막힙니다).
