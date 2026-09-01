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
