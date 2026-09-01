// 폰트 서브셋 (issue #16)
//
// Galmuri11 원본은 현대 한글 11,172자를 전부 담아 woff2 로도 490KB 다.
// 실제로 쓰이는 글자는 1,200자 남짓이라 대부분이 낭비다.
//
// 데이터가 바뀌면 다시 돌려야 한다:
//   node tools/subset_font.mjs
//
// 서브셋에 없는 글자는 CSS 폰트 스택의 다음 글꼴로 자연스럽게 넘어간다.
// 깨지지 않고 모양만 달라지므로 안전한 축소다.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const subsetFont = require('/tmp/node_modules/subset-font');

const ROOT = process.cwd();
const SRC = path.join(ROOT, '.font-src');      // 원본 보관 (저장소에는 안 올림)
const OUT = path.join(ROOT, 'assets/fonts');
const CDN = 'https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist';

/** 원본 woff2 가 없으면 배포처에서 받아 둔다. */
async function ensureSource(name) {
  const dst = path.join(SRC, `${name}.woff2`);
  if (fs.existsSync(dst)) return dst;
  fs.mkdirSync(SRC, { recursive: true });
  console.log(`원본 내려받는 중: ${name}.woff2`);
  const res = await fetch(`${CDN}/${name}.woff2`);
  if (!res.ok) throw new Error(`원본을 받지 못했습니다: ${name} (${res.status})`);
  fs.writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
  return dst;
}

/** 실제로 화면에 그려질 수 있는 글자를 모은다. */
function collectChars() {
  const chars = new Set();
  const add = (s) => { for (const c of String(s)) chars.add(c); };

  // 1) 소스에 박힌 문구 전부
  for (const f of ['index.html', 'privacy.html', 'assets/css/player.css',
                   'assets/js/app.js', 'assets/js/dj.js', 'assets/js/skins.js',
                   'assets/js/moods.js', 'assets/js/icons.js', 'assets/js/character.js']) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) add(fs.readFileSync(p, 'utf8'));
  }

  // 2) 곡 제목·아티스트·라이선스·장면명
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bgm_playlist.json'), 'utf8'));
  for (const c of doc.categories) {
    add(c.name);
    for (const s of c.subcategories) {
      add(s.name);
      for (const t of s.tracks) { add(t.title); add(t.artist); add(t.license); }
    }
  }

  // 3) 여유분 — 라틴 전체, 숫자, 흔한 기호, 자주 쓰는 한글 음절
  add('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
  add(` !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~·…—–“”‘’«»×÷°※★☆○●◎△▲▽▼□■◇◆←→↑↓⇒`);
  // 한글 자모(조합 안 된 낱자)와 흔한 음절 — 곡 제목이 바뀌어도 웬만하면 덮이도록
  add('가각간갈감갑강개객거건걸검것게겨격견결경계고곡곤골공과관광교구국군굴굽궁권귀규균그극근글금급기긴길김깊까꺼께꼬꽃끝나낙난날남납낫낮내너널넓넣네녀년노녹논놀농높놓뇌누눈느는늘능니다단달담답당대댓더던덜덤덧데도독돈돌동되된두둘뒤드득든들듯등디따딸때떠떤또뜨라락란람랑래램량러럭런럴럼럽렁레려력련렬령례로록론롤롱료루류르른를름릎리린림립링마막만많말맑맞매맥맨머먹먼멀메며면명몇모목몰못몸무문묻물뭐미민믿밀및바박반받발밝밤밥방배백뱅버번벌범법베벽변별병보복본볼봄봉부북분불붉브블비빈빌빛사산살삶삼상새색생서석선설섬성세션소속손솔송쇠수숙순술숨쉬스슬습승시식신실심십싶쌍써썹쓰씨아악안않알암압앞애야약양어억언얼엄업없엇엉에여역연열염엽영예오옥온올옴옷와완왕외요욕용우운울움웃원월위유육윤율으은을음응의이익인일임입잇있잉자작잔잘잠잡장재쟁저적전절점접정제조족존졸종좋좌죄주죽준줄중즈즉지직진질짐집짓짜쪽찌차착찬찰참창채책처척천철첫청체초촌총최추축춘출춤충취측층치친칠침카커컴케코콘쿠크큰클키타탁탄탈탐탑태택터턴테토통투트특틀틈티파판팔패퍼페편평포폭표푸품풍프플피필하학한할함합항해핵행향허험헤현혈협형혜호혹혼홀홍화확환활황회획횟효후훈훨휘휴흐흔흘흡흥희흰히힘');
  return [...chars].join('');
}

const text = collectChars();
console.log(`서브셋에 포함할 고유 글자: ${new Set(text).size}자`);

fs.mkdirSync(OUT, { recursive: true });
for (const name of ['Galmuri11', 'Galmuri11-Bold']) {
  const src = await ensureSource(name);
  const before = fs.statSync(src).size;
  const buf = await subsetFont(fs.readFileSync(src), text, { targetFormat: 'woff2' });
  const dst = path.join(OUT, `${name}.woff2`);
  fs.writeFileSync(dst, buf);
  const after = buf.length;
  console.log(`${name}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (${(100 - after / before * 100).toFixed(1)}% 감소)`);
}
