# 보안 조치 및 플랫폼 제약

`dorms-check` 스캔(2026-09-01) 결과에 대한 대응 기록입니다.

## 핵심 제약: GitHub Pages는 HTTP 응답 헤더를 설정할 수 없다

스캐너가 지적한 6개 항목은 모두 **HTTP 응답 헤더**로 해결하도록 안내합니다.
그러나 이 사이트는 GitHub Pages 정적 호스팅이라 `_headers`, `vercel.json`,
`middleware.ts` 같은 헤더 설정 수단이 **존재하지 않습니다.**
(Netlify·Vercel·Cloudflare Pages로 옮기면 전부 헤더로 해결 가능합니다.)

그래서 **`<meta>`로 지정 가능한 것은 meta로, 불가능한 것은 다른 수단으로** 대응했습니다.

| 스캔 지적 | 심각도 | 대응 | 상태 |
|---|---|---|---|
| Content-Security-Policy | high | `<meta http-equiv="Content-Security-Policy">` | **해결** |
| 개인정보처리방침 | high | [`privacy.html`](privacy.html) 작성 + 헤더에 링크 노출 | **해결** |
| Referrer-Policy | low | `<meta name="referrer" content="strict-origin-when-cross-origin">` | **해결** |
| 클릭재킹 방어 | medium | JS 프레임 이탈 (아래 설명) | **완화** |
| Strict-Transport-Security | medium | 플랫폼이 이미 강제 (아래 설명) | **불필요** |
| X-Content-Type-Options | low | meta로 지정 불가 — 플랫폼 제약 | **미해결** |
| Permissions-Policy | low | meta로 지정 불가 — 플랫폼 제약 | **미해결** |

---

## 항목별 상세

### Content-Security-Policy — 해결

`index.html`에 meta로 적용했습니다. meta CSP는 브라우저가 정상 적용합니다.

```
default-src 'self';
script-src 'self' https://www.youtube.com https://s.ytimg.com;
style-src 'self';
font-src 'self';
img-src 'self' data: https://i.ytimg.com https://i9.ytimg.com;
frame-src https://www.youtube-nocookie.com https://www.youtube.com;
connect-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
object-src 'none'; base-uri 'self'; form-action 'self';
upgrade-insecure-requests
```

`'unsafe-inline'` 없이 `style-src 'self'`를 유지하기 위해 인라인 `style=` 속성을 전부 제거했습니다.
스킨 견본 색은 `element.style.setProperty()`(CSSOM)로 넣습니다 — CSP가 차단하지 않는 방식입니다.

`frame-ancestors`는 **명세상 meta에서 무시**되므로 넣지 않았습니다(콘솔 경고만 발생).

### 클릭재킹 — 완화

`X-Frame-Options` 헤더도, meta `frame-ancestors`도 쓸 수 없어
`assets/js/app.js` 최상단에서 프레임 탈출로 대응합니다.

```js
if (window.top !== window.self) {
  try { window.top.location = window.self.location; }
  catch { /* 교차 출처라 접근 불가 → 내용을 비운다 */ }
}
```

헤더 방식보다 약합니다(JS 비활성 환경, `sandbox` 속성으로 무력화 가능).
정적 사이트에 로그인·결제가 없어 클릭재킹 실익이 낮다는 점을 감안한 수용 가능한 절충입니다.

### Strict-Transport-Security — 대응 불필요

1. GitHub Pages가 HTTP를 HTTPS로 301 리다이렉트합니다 (스캔에서도 통과 확인).
2. **`github.io` 전체가 브라우저 HSTS 프리로드 목록에 등재**되어 있습니다.
   즉 브라우저가 이 도메인에는 애초에 HTTP로 접속하지 않습니다.

응답 헤더가 없을 뿐, 실제 보호는 이미 최고 수준으로 적용된 상태입니다.

### X-Content-Type-Options / Permissions-Policy — 미해결

둘 다 `<meta>`로 지정할 수 없습니다
(Permissions-Policy는 과거 meta를 지원했으나 명세에서 제거됨).

실질 위험은 낮습니다.
- **nosniff**: GitHub Pages가 모든 파일에 올바른 `Content-Type`을 붙입니다. 이용자 업로드가 없어 MIME 혼동을 유발할 파일 자체가 없습니다.
- **Permissions-Policy**: 이 사이트는 카메라·마이크·위치·결제 API를 전혀 쓰지 않습니다. CSP가 외부 스크립트를 막고 있어 제3자가 이 권한을 요구할 경로도 없습니다.

헤더가 꼭 필요하면 Netlify/Cloudflare Pages로 이전하면 됩니다.

---

## 스캔에 안 잡혔지만 함께 고친 것

### 죽은 CDN 링크 제거 + 폰트 자체 호스팅

`cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/DungGeunMo.woff.css`가
**404였습니다.** 폰트는 처음부터 로드된 적이 없고 monospace로 폴백되고 있었습니다.

오픈소스 픽셀 한글 폰트 **Galmuri11**(SIL OFL 1.1, Lee Minseo)로 교체하고
`assets/fonts/`에 **자체 호스팅**했습니다.

- 서드파티 출처가 사라져 CSP에서 `cdn.jsdelivr.net` 예외가 불필요해짐
- CDN 운영자가 방문자 IP를 수집할 여지 제거
- CDN 장애·변조 위험 제거
- 덤으로 의도했던 픽셀 폰트가 실제로 표시됨

> **이후 변경.** 여관으로 갈아엎으면서(`0036c8d`) 디자인이 픽셀에서 명조로 바뀌었고
> `@font-face` 도 함께 사라졌습니다. Galmuri 파일만 한동안 남아 아무도 안 읽는 채로
> 68KB를 차지하고 있었는데, 지금은 그것도 지웠습니다.
> **웹폰트를 아예 싣지 않습니다** — 글꼴은 전부 방문자 기기의 것을 씁니다.
> 위 항목들이 노리던 바(서드파티 없음·추적 여지 없음)는 그대로 지켜지고,
> 폰트 요청 자체가 0건이 되었습니다.

### YouTube 추적 축소

`youtube.com` → **`youtube-nocookie.com`** 으로 임베드 도메인을 변경했습니다.
재생을 시작하기 전까지 추적 쿠키를 심지 않습니다.

### XSS 재점검

곡 제목·아티스트명은 데이터 파일에서 오지만 원본이 YouTube 영상 제목이므로
신뢰할 수 없는 입력으로 취급합니다. `innerHTML`에 들어가는 모든 값에
`escapeHtml()`이 적용되어 있음을 확인했습니다 (`assets/js/app.js`).

---

## 재현

```bash
npx -y github:shinnanchanguk/dorms-check scan --url https://progh2.github.io/rpg-bgm-dj/
```

리포트는 `.dorms-check/REPORT.md`에 생성됩니다.


---

## 스캔 결과 이력

| 시점 | 보안 점수 | 에듀집 | 비고 |
|---|---|---|---|
| 최초 스캔 | 52/100 (F) | 미충족 | 헤더 6종 + 개인정보처리방침 누락 |
| 방침·CSP 적용 후 | 58/100 (F) | 미충족 | 개인정보처리방침 항목 해소 |
| 방침 조문화 + judge 기록 후 | 54/100 (F) | **충족** | `vercel.json` 루트 노출로 신규 감점 |
| 배포 설정 이동 후 | **58/100 (F)** | **충족** | 노출 해소. 현재 상태 |

### 보안 점수가 58점에서 더 오르지 않는 이유

남은 6개 지적은 모두 **HTTP 응답 헤더**를 요구합니다.
스캐너의 `checkHeaders()`는 `mainRes.headers`만 읽고 **HTML의 `<meta>` 태그는 파싱하지 않습니다.**
따라서 meta로 적용한 CSP·Referrer-Policy는 **브라우저에서는 실제로 동작하지만**
(Chromium 헤드리스에서 적용·차단 확인) 스캐너 점수에는 반영될 수 없습니다.

GitHub Pages에 머무는 한 이 6개는 구조적으로 해소 불가이며,
점수를 올리려면 응답 헤더를 설정할 수 있는 호스팅으로 이전해야 합니다.
`deploy/` 폴더에 Netlify·Cloudflare Pages·Vercel용 설정을 미리 넣어 두었습니다.

## 에듀집(학운위) 트랙

`report.json`의 `tracks.edzip.eligible`은 **true**입니다.

다만 도구는 이 앱이 **에듀집 선정 기준 적용 대상이 아닐 가능성이 크다**고 판정했습니다
(학생 정보 미처리 + 교과 콘텐츠 미포함 → 초·중등교육법 제29조의2 적용 요건 두 가지에 모두 비해당).
제출 자료는 `--continue-out-of-scope`로 생성했으며, 적용 판정은 `out-of-scope`로 기록되어 있습니다.

`edzip council`(내부 기안문·학운위 안건문)은 **실제 에듀집 확인 완료 후에만** 실행됩니다.
`verifyEdzipApproval()`이 `api.edzip.kr`에 조회해 등록 여부와 앱 이름을 대조하므로
임의 주소로는 생성되지 않습니다.


---

## 휴대폰 백그라운드 재생

**질문:** 휴대폰에서 브라우저가 백그라운드가 되면 소리가 멈춘다. 계속 나게 할 수 있나?

**답: YouTube 임베드로는 불가능합니다.** 백그라운드 재생은 YouTube가 **Premium 유료 기능으로 판매**하는
것이라, IFrame Player API가 의도적으로 차단합니다. 우회 시도는
[YouTube API 서비스 약관](https://developers.google.com/youtube/terms/required-minimum-functionality)
위반이며, YouTube가 우회 수단을 지속적으로 차단하고 있습니다.

### 그래도 해결되는 경우 — 화면 꺼짐

실제로 가장 흔한 상황은 *"책상에 폰을 올려두었더니 화면이 꺼지면서 멈췄다"* 입니다.
이건 백그라운드 전환이 아니라 **화면 잠금** 때문이며, **Screen Wake Lock API**로 막을 수 있습니다.

재생기에 **화면 켜둠** 토글을 넣었습니다. 켜두면 재생 중 화면이 꺼지지 않습니다.

- 지원: iOS/iPadOS 16.4+, Android Chrome, 데스크톱 전 브라우저 (전 세계 94% 이상)
- 탭이 숨겨지면 브라우저가 잠금을 자동 해제하므로, 다시 보일 때 재요청합니다
- 미지원 브라우저에서는 버튼이 `N/A`로 비활성화됩니다
- 화면이 계속 켜져 있으므로 배터리를 더 씁니다

### 해결되지 않는 경우

**다른 앱으로 전환하거나 홈 화면으로 나가면** 여전히 멈춥니다. 이건 우회할 수 없습니다.

### 진짜 백그라운드 재생이 필요하다면

유일한 합법적 방법은 **YouTube를 걷어내고 오디오 파일을 직접 호스팅**하는 것입니다.
`<audio>` 엘리먼트는 모바일에서 백그라운드 재생이 되고, Media Session API로
잠금화면 컨트롤도 붙일 수 있습니다.

다만 비용이 큽니다.

- 현재 1,307곡을 오디오 파일로 받으면 수 GB — GitHub Pages 권장 용량(1GB)과 대역폭(월 100GB)을 초과합니다
- **CC BY / CC0 음원만 재배포 가능**합니다. 魔王魂·DOVA-SYNDROME 등 일본 소스는 재배포를 제한하는 경우가 있어 개별 약관 확인이 필요합니다
- 현실적인 선택지는 **CC BY/CC0 곡 중 집중도 높은 100곡 내외를 골라 별도 저장소나 오브젝트 스토리지에 호스팅**하는 방식입니다

이 방향으로 가시려면 별도 작업으로 진행하면 됩니다.
