# 배포용 보안 헤더 설정

이 폴더의 파일들은 **GitHub Pages에서는 동작하지 않습니다.**
GitHub Pages가 HTTP 응답 헤더를 설정할 수 없기 때문입니다 (`../SECURITY.md` 참고).

저장소 루트에 두었더니 `vercel.json`이 공개 경로로 그대로 열려
스캐너에 "설정 파일 노출"로 잡혔습니다. 어차피 동작하지 않는 파일이므로
이 폴더로 옮겨 노출을 없앴습니다.

## 헤더 지원 호스팅으로 옮길 때

이전 대상에 맞는 파일을 **저장소 루트로 복사**하면 보안 헤더 6종이 즉시 적용됩니다.

| 호스팅 | 옮길 파일 | 위치 |
|---|---|---|
| Netlify | `_headers` | 게시 디렉터리 루트 |
| Cloudflare Pages | `_headers` | 게시 디렉터리 루트 |
| Vercel | `vercel.json` | 저장소 루트 |

```bash
# 예: Netlify / Cloudflare Pages
cp deploy/_headers ./_headers

# 예: Vercel
cp deploy/vercel.json ./vercel.json
```

옮긴 뒤에는 `index.html`의 `<meta http-equiv="Content-Security-Policy">`가
응답 헤더와 중복됩니다. 둘 다 있으면 브라우저는 **더 엄격한 쪽**을 적용하므로
동작에는 문제가 없지만, 관리 지점을 하나로 두려면 meta 쪽을 지워도 됩니다.

`vercel.json`을 Vercel 루트에 둘 경우 그 파일 자체가 공개 노출되지 않는지
(`/vercel.json` 요청이 404인지) 확인하세요. Vercel은 기본적으로 차단합니다.
