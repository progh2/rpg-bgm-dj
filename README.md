# 작업용 RPG BGM 재생기 데이터셋

고전 콘솔 RPG(파이널 판타지 / 드래곤 퀘스트 / 이스 / 로맨싱 사가 / 크로노 트리거 / 성검전설)의
BGM 사용 관례를 **34개 장면 유형**으로 분류하고, 그 각 유형에 대응하는 **저작권 문제 없는 무료 라이선스 음원**을
장면별로 수십 곡씩 모아 재생기용 데이터로 만든 저장소입니다.

**총 1,300곡 / 42 아티스트 / 34 장면 유형** (작업용 `focus≥4`: 764곡). 전 곡 oEmbed 재생 가능 검증 완료.

## 문서

| 파일 | 내용 |
|---|---|
| `classic_rpg_bgm_by_scene.md` | 1차 조사. 원작 게임들의 BGM이 어떤 장면에 어떤 음악적 특징으로 쓰였는지 정리한 분류 체계 |
| `classic_rpg_bgm_free_playlist.md` | 2차 결과. 위 분류에 맞춰 수집한 무료 음원 목록 + 라이선스 요약 |

## 데이터

| 파일 | 용도 |
|---|---|
| `bgm-scenes.js` | **재생기에 바로 import** — `{id,title,artist,videoId}` 형태. mini-homepage 재생기와 동일한 스키마 |
| `data/bgm_playlist.json` | 전체 메타데이터(길이·집중도·라이선스·출처 URL·차순위 분류) |
| `data/bgm_playlist.csv` | 스프레드시트로 훑어볼 때 |

## 재생기 연동

```js
import { BGM_BY_SCENE, FOCUS_PLAYLIST, buildPlaylist, creditFor } from './bgm-scenes.js';

// 1) 작업용 기본 재생목록 (집중도 4 이상만, 전 장면 혼합)
const tracks = FOCUS_PLAYLIST;

// 2) 장면을 골라서 재생목록 구성
const calm = buildPlaylist(['B2_town', 'A4_inn', 'D9_mystic', 'D2_memory'], 4);

// 3) 크레딧 표기 (CC BY 계열은 표기가 라이선스 조건)
element.textContent = creditFor(currentTrack);   // "PeriTune — CC BY 4.0"
```

기존 재생기가 쓰던 `videoId` 배열 자리에 그대로 넣으면 됩니다. YouTube IFrame API가
영상 삭제/임베드 차단 시 `onError`를 내므로, 그 경우 다음 곡으로 넘기는 처리를 넣어 두는 편이 안전합니다.

## 집중도(focus) 값

작업하며 듣기 적합한 정도를 1~5로 매긴 값입니다. 곡 길이(너무 짧은 징글 감점),
차분함/격렬함 키워드, 장면 유형의 기본 성격을 합산합니다.

- **5** — 계속 틀어놔도 부담 없음 (마을, 여관, 신비, 회상)
- **4** — 작업용으로 무난 (필드, 유적, 애도, 축제)
- **3** — 상황에 따라 (성, 던전, 코믹)
- **1~2** — 작업용 비권장 (전투, 보스, 추격, 팡파레·징글)

`FOCUS_PLAYLIST`는 4 이상만 담습니다.

## 수집 방법

`tools/` 아래 스크립트로 재현 가능합니다.

```
tools/yt.py                  YouTube 검색·채널 목록 스크래핑 (API 키 불필요)
tools/channels.py            검증된 무료 라이선스 작곡가 채널 화이트리스트 (48개)
tools/scrape_channels.py     채널별 업로드 전수 수집 → data/channels/*.json
tools/peritune_tags.py       PeriTune 공식 사이트 태그 수집 (곡→분위기 매핑)
tools/classify.py            제목 키워드(영/일/한) → 34개 장면 분류 + 집중도 산출
tools/build.py               분류 실행. incompetech 메타데이터·PANICPUMPKIN 공식 장면분류 반영
tools/verify.py              oEmbed로 영상 존재·임베드 가능 검증 (캐시)
tools/assemble.py            소분류별 선별(아티스트 라운드로빈) → JSON/CSV/JS 출력
tools/report.py              마크다운 리포트 생성
```

## 라이선스 주의

- 대부분 **CC BY 4.0** — 출처 표기만 하면 상업 이용 포함 자유. 재생기에 아티스트명 표시가 곧 라이선스 준수입니다.
- **Vindsvept / Derek & Brandon Fiechter** 는 비상업 조건이 붙습니다. 개인 작업용 재생에는 문제없지만 수익화된 곳에 쓰지 마세요.
- **魔王魂 / DOVA-SYNDROME / MusMus / PANICPUMPKIN** 등 일본 소스는 각 사이트 이용약관을 따릅니다(대개 무료·표기 권장).
- YouTube의 "크리에이티브 커먼즈" 검색 필터 결과는 **의도적으로 제외**했습니다. 표본 검사에서 업로더가
  CC BY로 잘못 표시한 저작권 음원(파이널 판타지 커버 등)이 발견되어, 검증된 공식 아티스트 채널만 사용합니다.
