# dorms-check 입력 파일

보안·개인정보 점검 도구(`dorms-check`)에 넣는 답변 파일입니다.
결과물이 아니라 **입력**이라 저장소에 남깁니다 — 재점검 시 그대로 재사용합니다.

| 파일 | 용도 |
|---|---|
| `judge-answers.json` | AI 판단 항목 9건의 판정과 증거. `dcheck judge --in` 으로 병합 |
| `edzip-answers.json` | 에듀집 적용 여부 5문항 답변 |

```bash
npx -y github:shinnanchanguk/dorms-check judge --in .dorms-check-input/judge-answers.json
```

점검 결과와 조치 내역은 [`../SECURITY.md`](../SECURITY.md) 참고.
