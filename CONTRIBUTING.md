# EstateBook 챕터 작성 가이드

빌드 과정 없는 정적 사이트다. `index.html` + `chapters/<slug>.html` + 공통 `css/style.css`, `js/common.js`(전역 `EB`), `js/estate.js`(전역 `RE`).
로컬 실행: `python -m http.server 8000` → http://localhost:8000 (file://로 열어도 동작하게 classic script만 쓴다. ES module 금지.)
레이아웃·헬퍼 코드는 같은 시리즈의 [InsureBook](https://github.com/geniuskey/insurebook)(원래는 [MoneyBook](https://github.com/geniuskey/moneybook))에서 가져왔다. 전역 이름만 `IB`/`INS` → `EB`/`RE`로 바꿨다.
문체와 시뮬레이터 수준은 MoneyBook의 [집: 월세·전세·매매](https://moneybook.euiyun.com/chapters/housing.html)와 [대출 상환의 구조](https://moneybook.euiyun.com/chapters/loan.html)를 본보기로 삼는다. 이 두 장과 겹치는 내용은 더 깊게 쓰고, MoneyBook 장을 전체 URL로 링크한다.

## 기여물의 라이선스
실행 코드는 MIT, 본문·그림·문제·해설 등 교육 콘텐츠는 CC BY 4.0. 구분은 [라이선스 안내](LICENSE.md)를 따른다.

## 이 책이 답하려는 질문
1. **집값은 무엇이 정하는가.** 입지(일자리·교통·학교 접근성), 금리와 임대수익률, 공급의 시차, 대출 규제, 기대와 심리가 각각 가격을 움직인다. 장마다 "이 가격 변화는 어느 힘에서 왔는가"를 한 번은 짚는다.
2. **전세는 어떻게 굴러가고, 왜 위험해지는가.** 전세는 세입자가 집주인에게 주는 무이자 대출이다. 전세가율, 갭, 역전세, 깡통전세, 전세사기가 같은 구조에서 나온다는 것을 숫자로 보여 준다.
3. **내 집 마련은 숫자로 어떻게 판단하는가.** 사느냐 빌리느냐, 언제·어디서·얼마의 대출로 사느냐를 총비용과 위험으로 비교한다. 정답을 주지 않고, 독자가 자기 숫자를 넣어 판단하게 한다.
4. **독자 모두에게 쓸모 있게.** 첫 전월세를 구하는 사회초년생, 내 집 마련을 고민하는 신혼부부, 부모 집의 상속·증여를 앞둔 사람, 투자 관점이 궁금한 사람. 본문은 사전 지식 없는 일반인 기준으로 쓰고, 현장 실무는 `.callout.pro`(중개사 노트), 계약 전에 직접 확인할 항목은 `.callout.buyer`(계약 전 체크), 깊은 이야기는 `.callout.deep`(심화)로 덧붙인다.

## 원칙
- **한국어**, 평서문 "~다", 이모지 금지. 용어는 처음 나올 때 `<span class="term">전세가율</span><span class="en">(Jeonse-to-price ratio)</span>`처럼 쓰고 한 문장으로 풀어 준다. 업계 말(갭투자, 영끌, 몸테크, 줍줍, 피, 분담금 폭탄)은 쓰되 바로 뜻을 풀어 준다.
- **만져 보며 배우기**(Bartosz Ciechanowski가 본보기). 읽고 외우는 책이 아니라, 숫자를 직접 끌고 바꿔 보면서 "아, 그래서"를 얻는 책이다.
  - 개념 하나에 조작 가능한 그림 하나. 정적인 SVG는 조작으로 대신할 수 없을 때만 쓴다(장마다 2~4개: 구조도, 흐름도, 비교표 그림).
  - 한 시뮬레이터는 **한 가지**만 보여 준다. 슬라이더는 1~3개. 장마다 5~8개, 큰 종합 시뮬레이터는 장 끝에 하나.
  - 앞 시뮬레이터에서 만진 것 위에 다음 것을 쌓는다. 글은 시뮬레이터 바로 앞에서 "무엇을 움직여 볼지"를, 바로 뒤에서 "무엇을 봤는지"를 말한다.
  - 슬라이더뿐 아니라 캔버스 위 직접 끌기(`EB.drag`)를 적극적으로 쓴다(지도 위 집을 끌어 역에서 멀어지게 하기, 금리 곡선의 점 끌기, 입주 시점 세로선 끌기). 끌 수 있는 것에는 손잡이를 그린다.
  - 값을 끝까지 밀었을 때 **무너지는 모습**이 보여야 한다: 금리가 오르면 DSR 한도가 줄고 집값이 내려간다, 전세가율 90%에서 집값이 10% 빠지면 보증금이 깡통이 된다, 레버리지가 손실을 몇 배로 키운다, 입주 물량이 몰리면 역전세가 온다. 한계가 배울 점이다.
  - 결과는 숫자(`.sim-readout`)로도 함께 보여 준다. 금액은 `EB.won()`으로 "1억 2,346만원"처럼 쓴다.
  - 애니메이션을 아끼지 않는다(`EB.loop`). 화면 밖에서는 멈춘다(`EB.loop`가 자동 처리).
- 순서: 일상의 질문 → 조작 가능한 그림 → 원리(필요하면 수식, KaTeX, 장마다 0~3개) → 시뮬레이터 → 실제 제도·수치 → 하늘네 집 노트 → 핵심 정리 → 확인 퀴즈(4문항, 정답 위치 섞기).
- **수치는 2026년 한국 제도 기준 대표값**을 엔진의 `RE.KR`에 모아 두고 본문에서는 "2026년 기준"을 붙인다. 세율·대출 규제·청약 요건·정책대출 조건은 자주 바뀌므로 쓰기 전에 공식 출처(국토교통부, 국세청, 기획재정부(2026년부터 재정경제부로 표기되는 자료가 있다), 금융위원회, 한국부동산원, 주택도시보증공사(HUG), 청약홈, 인터넷등기소, 국가법령정보센터)에서 확인하고, 확인하지 못한 값은 '약', '~'을 붙이거나 "확인 필요"로 남긴다. 확인 결과와 출처는 [SOURCES.md](SOURCES.md)에 모은다. 장마다 한 번은 `.callout.warn`으로 "제도와 수치는 해마다 바뀐다"를 말한다. 논의 중인 정책(2026 세제개편안의 종부세·장기보유특별공제 개편 등)은 "추진 중", "확정 전"이라고 분명히 쓴다.
- **지어낸 통계·판례·사건번호를 쓰지 않는다.** 실제 시장 데이터(가격지수 등)는 출처와 기준 시점을 밝히고, 확보하지 못하면 "교육용 가상 데이터"라고 표시한 모형 데이터를 쓴다. 판례·분쟁은 "이런 유형의 분쟁이 있다" 수준으로 일반화한다.
- **투자 권유를 하지 않는다.** 특정 단지·건설사·시행사·중개법인·유튜버 이름을 쓰지 않는다. 지역은 "서울 A구", "경기 B시", 단지는 "C아파트"처럼 가상의 이름을 쓴다(공공기관·제도 이름은 괜찮다). 집값 전망을 하지 않는다.
- **공정하게.** "집은 무조건 사야 한다"도 "집값은 반드시 떨어진다"도 쓰지 않는다. 전세·월세·매매, 갭투자, 재건축, 오피스텔·상가 같은 주제는 장점과 한계, 맞는 사람과 안 맞는 사람을 함께 쓴다. 세입자와 집주인 양쪽의 시각을 다 보여 준다.
- 외부 라이브러리는 KaTeX만. 이미지 대신 인라인 SVG/canvas.
- 색은 CSS 변수(`var(--accent)`)나 `EB.palette()`를 쓴다. 들어오는 돈(임대료 수입·시세차익·환급)은 `--ok`, 나가는 돈(이자·세금·손실)은 `--bad`, 주의는 `--warn`, 주제색은 `--accent`(청록), 보조는 `--accent-2`(호박색).
- 모바일(폭 360px)에서 가로 스크롤 금지. SVG는 `viewBox`만 주고(폭 420~480) width/height 생략.
- 다른 장을 언급할 때는 `<a href="jeonse.html">5장</a>`처럼 링크한다. MoneyBook 장을 참고로 걸 때는 전체 URL(`https://moneybook.euiyun.com/chapters/housing.html`)을 쓴다.

## head 블록

모든 HTML 페이지에는 아래 Cloudflare Web Analytics 코드를 `<head>`에 한 번 포함한다. SEO 자동 생성 블록 밖에 두며, 시리즈 공통 Site Token을 유지한다.

각 챕터 `<head>`에는 아래 표식만 두고 `python3 tools/head.py <slug>`를 실행한다(인자 없이 실행하면 전체 장 + 사이트맵 + `index.html`의 JSON-LD를 갱신한다). 제목·번호는 `js/common.js`의 `CHAPTERS`에서 읽는다. `js/estate.js`는 항상 함께 불러온다.
```html
<!doctype html>
<!-- Copyright (c) 2026 geniuskey and EstateBook contributors.
     Executable code: MIT (see ../LICENSE-MIT).
     Text, illustrations, questions and explanations: CC-BY-4.0 (see ../LICENSE.md). -->
<html lang="ko">
<head>
<!--head:start {"desc": "한 문장 설명"}-->
<!--head:end-->
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"3d6151a0abc94ede89285d462527fa80"}'></script>
<!-- End Cloudflare Web Analytics -->
</head>
```

## 페이지 골격
```html
<body data-chapter="slug">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter NN</div><h1>제목</h1><p class="lead">…</p>
    <ul class="objectives"><li>…</li></ul>
  </header>
  <section id="영문-id"><h2>절 제목</h2> … </section>
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>…</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> … </div></section>
</main>
<script>(function () { "use strict"; /* 시뮬레이터 */ })();</script>
</body>
```
상단바·챕터 목록·여섯 부 띠·오른쪽 목차·h2 번호·이전/다음·푸터·퀴즈 동작·KaTeX 렌더는 `common.js`가 자동으로 만든다. 직접 넣지 않는다.

## 컴포넌트
- 그림: `<figure class="diagram"><svg viewBox="0 0 440 300" role="img" aria-label="…">…</svg><figcaption><b>그림 1. 제목.</b> 설명</figcaption></figure>`. SVG 안에서는 `.lbl`, `.lbl-dim`, `.lbl-b`, `.lbl-acc`, `.lbl-acc2`, `.lbl-bad`, `.t-mono`, `.s-line`, `.s-axis`, `.s-acc`, `.s-acc2`, `.s-ok`, `.s-dash`, `.s-bad`, `.f-surface`, `.f-elev`, `.f-acc`, `.f-acc2`, `.f-ok`, `.f-warn`, `.f-bad`, `.f-acc-soft`, `.f-acc2-soft`, `.f-ok-soft`, `.f-warn-soft`, `.f-bad-soft` 클래스를 쓴다. 색을 직접 적지 않는다(다크 모드). 화살표 머리는 `<marker>`에 `fill="context-stroke"`. marker id는 장 안에서 겹치지 않게 짓는다.
- 시뮬레이터:
```html
<div class="sim" id="sim-x">
  <div class="sim-head"><span class="sim-tag">SIMULATOR</span><h3>제목</h3></div>
  <div class="sim-body side">
    <div class="sim-view"><canvas id="x-cv"></canvas></div>
    <div class="sim-controls">
      <label class="ctrl"><span>이름 <output id="x-a-out"></output></span><input type="range" id="x-a" min="0" max="10" step="0.1" value="3"></label>
      <div class="seg" id="x-mode"><button data-value="a" class="on">A</button><button data-value="b">B</button></div>
      <label class="check"><input type="checkbox" id="x-c"> 옵션</label>
      <div class="btn-row"><button class="btn primary" id="x-go">실행</button><button class="btn" id="x-re">다시</button></div>
    </div>
  </div>
  <div class="sim-readout"><div class="stat"><span class="k">이름</span><span class="v" id="x-o-1">—</span></div></div>
  <div class="sim-note">해볼 것: ① … ② … ③ … (모델의 가정)</div>
</div>
```
  컨트롤이 없거나 캔버스를 직접 끄는 시뮬레이터는 `.sim-body`에서 `side`를 빼고 `.sim-view` 안에 `<span class="hint">끌어서 움직인다</span>`를 둔다. `<select>`는 쓰지 않는다(`.seg`를 쓴다).
- 수식: `<div class="formula">$$…$$<div class="where">기호 설명</div></div>`, 문장 속은 `\(…\)`. 수식은 꼭 필요한 곳에만(장마다 0~3개). 수식보다 그림과 숫자가 먼저다.
- 강조 상자: `.callout`, `.callout.tip`, `.callout.warn`, `.callout.deep`(심화), `.callout.pro`(중개사 노트), `.callout.buyer`(계약 전 체크). 첫 `<strong>`이 제목이다(라벨은 CSS가 앞에 붙인다). **장마다 `.callout.pro` 1~3개, `.callout.buyer` 1~2개**를 넣는다. 중개사 노트는 현장 실무(설명 순서, 확인 서류, 흔한 실수, 손님이 자주 묻는 질문, 중개보수와 손님 이익이 부딪히는 순간)를, 계약 전 체크는 등기부등본·계약서·대출 서류에서 직접 확인할 항목을 담는다.
- 표: `<div class="table-wrap"><table>…</table></div>`. 숫자 칸은 `class="num"`.
- 영수증·계산서: `<div class="slip"><div class="row"><span>취득세</span><span>7,026,600</span></div>…<div class="row total"><span>합계</span><span>…</span></div></div>`.
- 금액 색: `<span class="won plus">+50만원</span>`, `<span class="won minus">−12만원</span>`.
- 범례: `<div class="legend"><span><i style="background:var(--bad)"></i>이자</span></div>`, `.pill`, `.ok-t` `.bad-t` `.warn-t`.
- 퀴즈: `<div class="quiz-q"><p>문제</p><div class="opts"><button class="opt">…</button><button class="opt" data-correct>정답</button></div><div class="quiz-exp">해설</div></div>` (장마다 4문항, 정답 위치를 섞는다).
- 하늘네 집 노트(아래 참조):
```html
<div class="casefile">
  <div class="tag"><b>CASE 하늘네</b><span>집 노트 · 5장</span></div>
  <h4>집주인의 갭 2.2억, 우리 보증금은 얼마나 안전한가</h4>
  <p>…이 장의 방법을 하늘네에게 적용한 결과. 태호(중개사)의 시각, 하늘네(세입자·매수 희망자)의 시각, 필요하면 남궁현(집주인)의 시각을 함께…</p>
  <div class="clue"><div><b>이 장에서 정한 것</b>…</div><div><b>아직 남은 문제</b>…</div><div><b>다음 단계</b>…</div></div>
</div>
```

## 이어지는 케이스: 하늘네 집 노트
모든 장은 같은 가상의 가족과 공인중개사 한 명의 이야기를 한 걸음씩 진전시킨다. 각 장 끝(핵심 정리 앞)에 `.casefile` 하나를 넣고, **아래 표에서 자기 장에 해당하는 내용만** 다룬다. 뒤 장의 결론을 미리 말하지 않는다. 숫자는 `RE.CASE`와 엔진으로 직접 계산해서 쓴다(`node -e "require('./js/estate.js'); const R = RE; …"`로 확인). 모든 인물·지역·단지는 가상이다.

- 가구(`RE.CASE`): 오하늘(34세, 중견기업 회계 담당, 연봉 약 4,800만원, 월 실수령 약 340만원), 배우자 정재원(35세, 초등학교 교사, 연봉 약 4,400만원, 월 실수령 약 310만원), 딸 하나(3세). 경기 B시 C아파트 84㎡(2009년 준공, 9층) 전세 4억원(전세대출 2억원, 연 3.8%), 2025년 4월 입주, **2027년 4월 만기**, 계약갱신청구권은 아직 쓰지 않았다. 예금·투자 약 8,000만원, 월 생활비 약 400만원(전세대출 이자 포함) → 월 저축 약 250만원. 순자산 약 2억 8,000만원(보증금 중 자기 돈 2억 + 예금·투자 8,000만). 하늘은 서울 도심으로 통근(약 55분), 재원은 B시 안의 학교로 통근(약 15분). 질문: "만기 때 다시 전세냐, 이번엔 사느냐."
- 집 시세(교육용): C아파트 84㎡ 약 6억 2,000만원. 후보 지역(`RE.CASE.areas`): 서울 A구 약 12억 5,000만원(전세 6억 5,000만), 경기 B시 6억 2,000만원(전세 4억), 경기 E시 신도시 약 4억 9,000만원(전세 3억).
- 집주인: 남궁현(58세). 서울 A구에 자기 집이 있고, C아파트를 2021년에 6억 8,000만원에 전세 4억 5,000만원을 끼고 산 갭투자 2주택자(갭 2억 3,000만원). 2025년 재계약 때 시세가 내려 보증금을 4억으로 낮추며 차액 5,000만원을 돌려줘야 했다(역전세). 역전세와 세금 장에서 집주인의 셈법을 보여 준다.
- 하늘의 아버지(66세): 지방 D시의 1994년 준공 아파트 1채(2001년 7,000만원에 취득, 시세 약 1억 6,000만원). 상속·증여와 지방 주택 문제(14장, 18장, 19장)에 등장.
- 중개사: 민태호(52세, 공인중개사 20년 차, B시에서 사무소 운영). 원칙은 "거래보다 설명이 먼저". 중개보수를 받는 입장과 손님의 이익이 부딪히는 순간(거래가 성사돼야 보수를 받는다, 매도인과 매수인 양쪽에서 받는다)도 숨기지 않는다.

| 장 | 이 장에서 다루는 것 |
|---|---|
| 01 부동산의 지도 | 하늘네 소개. 집 대차대조표: 보증금 4억(자기 돈 2억 + 전세대출 2억), 예금·투자 8,000만원, 순자산 2억 8,000만원, 월 저축 250만원. 만기까지 남은 시간(2027년 4월). 하늘의 질문 "다시 전세냐, 이번엔 사느냐". 민태호 소개와 첫 만남의 약속(설명 먼저, 거래는 나중, 보수 구조를 먼저 밝힌다). 집주인 남궁현이 갭투자 2주택자라는 사실만 언급. |
| 02 입지 | 후보 지역 3곳(서울 A구, 경기 B시, 경기 E시)을 두 사람의 통근 시간과 84㎡ 가격으로 비교(`RE.hedonic`). 통근 시간을 돈으로 환산하면 A구의 비싼 값 중 얼마가 '시간값'인가. 재원의 직장이 B시라는 제약. |
| 03 집값과 금리 | C아파트의 임대수익률(전세 4억을 전환율로 연 임대료로 바꾼 값 ÷ 시세 6.2억)과 자본환원 가격(`RE.capValue`). 금리 1%p 변화가 이론 가격을 얼마나 움직이는가. 하늘네 연소득 9,200만원 대비 PIR(B시 약 6.7, A구 약 13.6). |
| 04 공급의 시차 | B시 인근 2027~2028년 입주 예정 물량(교육용 가상 데이터)과 만기 시점(2027년 4월) 전세가 시나리오(`RE.cobweb`). 입주 물량이 몰리면 하늘네는 협상력이 생기고 집주인은 역전세를 맞는다. |
| 05 전세의 경제학 | 남궁현의 셈법: 2021년 6.8억 매입 − 보증금 4.5억 = 갭 2.3억, 2025년 보증금 4억으로 재계약하며 5,000만원 역전세. 지금 전세가율 약 65%, 갭 2.2억. 집값이 10~40% 내릴 때 하늘네 보증금 회수율(`RE.jeonseRisk`). 집주인 시각과 세입자 시각을 나란히. |
| 06 월세와 임대차 제도 | 만기 선택지 계산: 계약갱신청구권을 쓰면 증액 상한 5%(4억 → 최대 4억 2,000만원), 반전세(보증금 2억 + 월세) 전환 시 법정 전환율 상한(2026년 기준 기준금리 3.0% + 2%p = 5%)으로 본 월세, 세입자의 실제 연 주거비(`RE.convert`, `RE.housingCost`). |
| 07 계약과 권리 지키기 | 매수 후보 매물과 지금 전셋집의 등기부등본 실습: 근저당 채권최고액, 가압류, 신탁등기 여부. 하늘네 전입신고·확정일자 확인, 전세보증금반환보증(HUG) 가입 요건 점검. 태호가 짚는 위험 신호. |
| 08 매매의 절차와 거래 비용 | B시 84㎡(6.2억)를 산다고 할 때 영수증: 취득세(생애최초 감면 포함, `RE.acqTax`), 중개보수(`RE.brokerage`), 법무비, 이사·수리비. 가계약금과 계약금, 잔금일과 전세 만기 맞추기. 남궁현이 C아파트를 판다면 매도인의 시각. |
| 09 주택담보대출 | 하늘네 DSR 한도(연소득 9,200만원, 스트레스 DSR, 전세대출 상환 후)와 LTV(B시 비규제 70% vs 서울 A구 규제지역 40%·6억 상한)로 본 최대 대출(`RE.maxLoan`). 금리 3.5~6% 시나리오의 월 상환액, 고정·변동 선택. 정책대출 소득 요건(소득 9,200만원이라 일부 상품은 해당하지 않는다). |
| 10 레버리지와 위험 | 하늘네가 자기 돈 약 2억 4,000만원으로 6.2억 집을 사면(대출 약 3억 8,000만원) 집값 ±20%가 자기자본에서 몇 %인가(`RE.leverage`). 남궁현의 갭투자 수익률과 손실 비대칭. 대출을 못 갚으면 생기는 일(경매 절차의 일반적 흐름). |
| 11 청약과 분양 | 하늘네 청약 가점(`RE.subscriptionScore`): 무주택 기간 약 4년(10점), 부양가족 2명(15점), 통장 9년(11점) = 36점. 특별공급(신혼부부·생애최초·다자녀 아님) 자격 점검, 경쟁률로 본 당첨 확률(`RE.odds`), 당첨 시 중도금·잔금 일정과 지금 전세 만기의 충돌. |
| 12 재건축과 재개발 | 하늘이 관심을 보인 서울 A구의 재건축 추진 단지(가상) "몸테크" 검토: 권리가액·비례율·분담금(`RE.redevelop`), 사업 기간이 늘어날 때와 공사비가 오를 때 분담금. 하늘네의 결론: 가족 상황과 맞지 않는 이유. |
| 13 보유세 | 6.2억 집(공시가격 약 4억 3,000만원)을 1주택으로 가질 때 재산세·종부세(`RE.holdingTax`). 남궁현의 2주택 보유세와 비교. 2026 세제개편안(추진 중)이 바뀌면 달라지는 것은 "확정 전"으로만. |
| 14 사고팔 때의 세금 | 하늘네가 사고 나중에 팔 때의 세금 전체(취득세, 1세대 1주택 비과세 요건, `RE.capGainsTax`). 아버지의 D시 아파트를 상속받거나 증여받으면 하늘네의 주택 수와 세금이 어떻게 바뀌는가(기초만). 남궁현이 C아파트를 팔 때 다주택 중과(2026년 5월 재개)의 영향. |
| 15 정책과 규제 | 규제지역 지정이 하늘네 후보지에 미치는 영향: 서울 A구는 규제지역·토지거래허가구역(LTV 40%, 실거주 의무), B시는 비규제. 규제가 옆 지역 가격을 미는 풍선 효과의 원리. |
| 16 집값 통계 읽기 | 태호가 보여 준 C아파트 실거래가와 호가(교육용 가상 데이터), "B시 집값 반등" 기사 제목의 숫자를 거래량과 중위값으로 다시 계산. 하늘이 보던 지수와 실거래가가 다르게 움직이는 이유. |
| 17 거품과 하락 | 하늘의 두 불안("지금 안 사면 영영 못 산다" vs "곧 떨어진다")을 PIR·전세가율·대출 증가·거래량으로 점검하는 체크리스트. 전망이 아니라 "내가 견딜 수 있는 하락"을 정한다. |
| 18 주택 밖의 부동산 | 아버지가 권유받은 분양형 상품(수익률 보장 생활형 숙박시설·상가 등, 가상)의 수익 구조와 공실·환금성 위험, 리츠와 비교. |
| 19 인구와 도시의 미래 | 아버지의 D시 아파트: 지방 인구 감소와 빈집, 팔지·물려받을지·세를 놓을지. 하늘네가 30년 뒤를 생각할 때 확정할 수 있는 것(인구 구조)과 없는 것(금리, 정책). |
| 20 사느냐 빌리느냐 | 사기 vs 전세 연장 vs 반전세의 10년 총비용(`RE.rentVsBuy`): 집값 상승률·금리·기회비용별 손익분기 보유 기간, 거주 안정성(아이 학교)의 값을 얼마로 칠 것인가. |
| 21 내 집 마련 계획 | 하늘네의 결정과 그 이유. 감당 가능한 가격 역산(월 상환 한도, 비상금 6개월 유지), 자금 계획표, 잔금일과 전세 만기 맞추기. 결정은 정답이 아니라 하늘네의 선택으로 쓰고, 다른 가족이라면 다른 선택이 맞을 수 있다는 것을 함께 보인다(갱신청구권으로 2년을 벌고 청약을 병행하는 길, 같은 생활권 84㎡를 사는 길을 모두 계산한 뒤 하나를 고른다). |
| 22 실험실 | 독자가 하늘네 또는 자기 가구를 넣어 30년 주거 경로를 돌린다. |
| 23 용어집 | 케이스 없음. |

## JS 헬퍼 (`EB`, `js/common.js`)
- `EB.canvas(el|선택자, draw(ctx, w, h), {aspect, minHeight, maxHeight})` → `{redraw(), ctx, w, h, canvas}`. 리사이즈·테마 변경 시 자동으로 다시 그린다. draw 안에서 `EB.palette()`를 매번 다시 읽는다. w, h는 CSS px. 문자열은 `querySelector` 선택자이므로 `"#id"`로 넘긴다. 만들자마자 draw를 한 번 부르므로 draw가 읽는 상태와 컨트롤(`EB.range`, `EB.seg`)을 먼저 만든다. 폭에 따라 높이가 달라져야 하면 옵션 객체에 `get height() { … }` getter를 넘긴다.
- `EB.drag(canvas|선택자, {start(x, y, e), move(x, y, e), end(), hover(x, y, e)})` 캔버스 위 끌기(마우스·터치, CSS px). draw에서 계산한 배치(상자, 축 변환)를 바깥 변수에 저장해 두고 move에서 역변환한다.
- `EB.chart(ctx, box|null, {x:[min,max], y:[min,max], logX, logY, xLabel, yLabel, xFmt, yFmt, xTicks, yTicks, series:[{data:[[x,y]], color, width, dash, fill}], vlines:[{x,color,label}], hlines:[{y,color,label}], points:[{x,y,color,r,label}], bands:[{x0,x1,color}]})` → `{X, Y, box}`. 금액 축은 `yFmt: EB.wonAxis`. box를 생략하면 왼쪽 여백 58px이다. 축 글자가 길면 box를 직접 준다.
- `EB.bars(ctx, box|null, {labels, stacks:[{label, color, data}], y, yFmt, yLabel, gap, hlines, highlight, valueFmt})` → `{X(i), Y, box, bw}` 누적 막대(음수는 아래로).
- `EB.donut(ctx, cx, cy, R, [{label, value, color}], {inner, center:{big, small}, labels, highlight})` → `{hit(x, y)}` 도넛.
- `EB.range(id, fmt, onInput)` → `get()`, `get.set(v)`. 출력은 `id + "-out"` 요소.
- `EB.seg(id, onChange)` → `get()`, `get.set(v)`. `EB.stat(id, html)`.
- `EB.loop(el, (dt, t) => {})` 화면에 보일 때만 도는 애니메이션. `.stop()`, `.start()`, `.toggle()`.
- `EB.palette()` → `{bg, text, dim, faint, grid, axis, border, surface, accent, accent2, ok, warn, bad, red, green, blue, series}`, `EB.color(name)`, `EB.isDark()`, `EB.onTheme(cb)`.
- `EB.won(x, {digits, short})` "1억 2,346만원"(10만원 미만은 "45,000원"처럼 원 단위), `EB.wonAxis(x)` "1.2억", "1.5만", `EB.pct(x, digits)` "3.45%", `EB.fmt(x, digits)`.
- `EB.canvas`는 만들면서 draw를 바로 부른다. draw 안에서 자기 반환값을 참조하지 않는다(초기화 전 접근 오류).
- 고정폭 글꼴(`EB.font(px, true)`, SVG의 `.t-mono`)은 숫자·영문에만 쓴다. 한글은 자간이 벌어진다.
- `EB.font(px, mono, weight)`, `EB.erf`, `EB.rng(seed)`(0~1 난수 함수), `EB.randn()`, `EB.randnSeeded(seed)`, `EB.poisson(λ)`, `EB.debounce`, `EB.clamp/lerp/map`.
- `EB.CHAPTERS`, `EB.PARTS`(여섯 부, `short`는 좁은 화면의 짧은 이름).

## 부동산 계산 엔진 (`RE`, `js/estate.js`)
모든 장이 같은 계산을 쓰게 하는 공통 엔진이다. 대출 상환·한도, 주거비, 세금, 보증금 회수율, 레버리지, 청약 가점 계산은 직접 만들지 말고 이것을 쓴다(장 고유의 작은 계산은 직접 해도 된다). 단위는 원, 비율은 소수, 면적은 ㎡, 기간은 년. 엔진에 필요한 함수가 없으면 장 안에서 만들고, 여러 장이 쓸 만하면 엔진에 추가한다(기존 함수의 동작은 바꾸지 않는다). 엔진 값은 본문에서 "이 책의 모델로 계산하면"이라고 밝힌다.
- 제도 값 `RE.KR`(각 값에 근거와 확인일 주석): 기준금리 `baseRate`, 가계 실물자산 비중 `householdRealShare`, 전월세 전환율 `conversion`, 계약갱신청구권 `renewal`, 소액임차인 최우선변제 `smallTenant`, 중개보수 상한 `brokerage`, 취득세 `acq`, 재산세 `property`, 종합부동산세 `comp`, 양도소득세 `cgt`(누진세율·장기보유특별공제·단기세율·다주택 중과), 대출 규제 `loan`(LTV·주담대 한도·DSR·스트레스 가산금리), 전세보증 `hug`, 청약 가점 `sub`, 교육용 대표값(`publicRatio` 공시가격 현실화율, `upkeep`, `legal`, `moving`).
- 금융: `RE.payment({principal, rate, years, method, graceYears})` → `{monthly, first, last, totalInterest, totalPaid, annualFirst, rows, years}`(method: `level` 원리금균등, `principal` 원금균등, `bullet` 만기일시). `RE.dsr({income, loans:[{principal, rate, years, method, kind}], stress})` → `{annual, ratio, rows}`(kind: `mortgage`, `jeonse` 이자만, `credit` 5년 가정). `RE.maxLoan({income, rate, years, price, ltv, dsrCap, stress, otherAnnual, cap})` → `{byDsr, byLtv, byCap, max, binding, monthly}`.
- 주거비: `RE.conversionCap(기준금리)` 법정 전환율 상한, `RE.convert(보증금, 월세, 전환율)` → `{jeonse, annualRent, rentAt(보증금), depositAt(월세)}`, `RE.brokerage(금액, "sale"|"lease", 월세)` → `{base, rate, fee, max}`, `RE.housingCost({mode: "buy"|"jeonse"|"rent", …})` → `{total, monthly, parts:[{key, label, value}]}`(이자, 기회비용, 보유세, 수선비, 거래비용 상각, 집값 변화), `RE.rentVsBuy({price, ltv|loan, loanRate, oppRate, growth, rentGrowth, jeonse, jeonseLoan, deposit, rent, years, moveEvery})` → `{rows:[{year, buy, jeonse, rent, price}], upfront, breakEven:{jeonse, rent}}`.
- 가치: `RE.capValue(연 임대료, 할인율, 성장률)`, `RE.hedonic({area, commute, walk, school, age, park, households, base})` → `{price, perM2, ref, parts:[{key, label, factor, won}]}`(교육용 가격 모형), `RE.cobweb({years, lag, k, shockYear, shock, demandTrend})` → 분기별 `[{t, price, starts, completions}]`(k > 1이면 진동이 커진다).
- 위험: `RE.jeonseRisk({price, deposit, seniorDebt, drop, auctionRate, costs, region, small})` → `{value, sale, priority, toSenior, recovered, loss, rate, ratio, debtRatio, steps}`, `RE.leverage({price, equity, deposit, rate, growth, rent, holdCost, years, sigma, n, seed})` → `{loan, gain, interest, roe, multiple, sims:{total, lossShare, wipeShare, median, mean}}`.
- 세금(모두 `steps`로 계산 단계를 함께 반환): `RE.acqTax({price, homes, regulated, area, firstHome, temporary})`, `RE.holdingTax({value, total, homes, one, age, years})` → `{property, comp, total}`, `RE.capGainsTax({buy, sell, costs, years, live, homes, regulated, regulatedAtBuy})`.
- 청약·정비사업: `RE.subscriptionScore({homelessYears, dependents, accountYears})` → `{homeless, dependents, account, total}`, `RE.odds({supply, applicants, score, mean, sd, pointShare})` → `{competition, cutoff, pPoint, pLottery, p}`, `RE.ratio({revenue, cost, prior})` 비례율, `RE.redevelop({rightsValue, ratio, newPrice})` → `{rights, contribution, refund}`.
- 기본: `RE.pv`, `RE.progressive(세율표, 과세표준)`, `RE.normCdf`, `RE.normInv`, `RE.rng(seed)`, `RE.gauss(seed)`.
- 케이스: `RE.CASE`(위 인물 값, `areas`, 파생값 `monthlyNet`, `income`, `monthlySaving`, `ownDeposit`, `netWorth`).

세금 계산은 실제 세법의 주요 흐름만 따른 **교육용 단순화**다(재산세 세부담 상한, 종부세의 재산세 중복분 공제 산식, 상속주택·일시적 2주택 특례, 감면·경과 규정 등을 생략하거나 근사했다). 본문에서 엔진 값을 쓸 때는 "이 책의 모델로 계산하면"을 붙이고, 실제 세액은 국세청 홈택스·위택스 모의계산이나 세무 전문가에게 확인하라고 밝힌다.

## 점검
- `python3 tools/check.py <slug>` (playwright 필요). 넓은 화면·라이트와 360px·다크로 열어 콘솔 오류, 가로 넘침, 조작 중 예외를 보고한다. `--shots 폴더`로 스크린샷을 남겨 눈으로도 본다. 크로미움 경로는 `CHROMIUM_PATH` 환경 변수로 바꿀 수 있다.
- 브라우저 콘솔에 오류가 없어야 한다. 다크·라이트 테마 모두 확인.
- 캔버스 글자는 `EB.font()`로, 색은 `EB.palette()`로.
- 장을 끝낼 때마다 쓴 제도 수치와 출처를 [SOURCES.md](SOURCES.md)에 적고, 확인하지 못한 값을 따로 표시한다.
