# EstateBook — 집값과 전세를 숫자로 푸는 부동산 교과서

집값은 무엇이 정하고, 전세는 어떻게 굴러가다 왜 위험해지며, 내 집 마련은 숫자로 어떻게 판단하는가. 입지와 금리, 공급의 시차에서 시작해 전세·월세·계약과 권리, 매매와 거래 비용, 주택담보대출과 레버리지, 청약과 재건축, 보유세와 양도세, 정책과 통계, 거품과 인구까지 직접 만지며 배우는 한국어 인터랙티브 교과서입니다.
첫 전월세를 구하는 사회초년생, 내 집 마련을 고민하는 신혼부부, 부모 집의 상속·증여를 앞둔 사람, 투자 관점이 궁금한 사람을 독자로 삼습니다. 본문은 일반인 기준으로 쓰고, 현장 실무는 "중개사 노트", 서명 전에 직접 확인할 항목은 "계약 전 체크" 상자로 덧붙입니다.
책 전체가 가상의 부부 오하늘·정재원과 공인중개사 민태호의 이야기(하늘네 집 노트)를 따라가며, 22장에서는 독자가 자기 숫자를 넣어 봅니다.

배포 주소: https://estatebook.euiyun.com/

## 실행
빌드 과정이 없는 정적 사이트입니다.

```bash
python -m http.server 8000   # → http://localhost:8000
```
`index.html`을 브라우저로 바로 열어도 동작합니다. KaTeX와 폰트는 CDN에서 불러오므로 인터넷 연결이 필요합니다.

## 구성

| 장 | 파일 | 부 | 주제 |
|---|---|---|---|
| 01 | chapters/overview.html | — | 부동산의 지도: 다른 자산과 다른 다섯 가지, 가계 자산의 4분의 3 |
| 02 | chapters/location.html | 원리 | 입지: 지대 이론, 통근 시간, 역세권·학군, 헤도닉 가격 모형 |
| 03 | chapters/value.html | 원리 | 집값과 금리: 임대수익률, 자본환원율, 금리 1%p의 무게, PIR |
| 04 | chapters/supply.html | 원리 | 공급의 시차: 인허가→착공→준공→입주, 거미집 모형 |
| 05 | chapters/jeonse.html | 주거 | 전세의 경제학: 무이자 대출, 전세가율과 갭, 역전세 |
| 06 | chapters/rent.html | 주거 | 월세와 임대차 제도: 전월세 전환율, 계약갱신청구권 |
| 07 | chapters/contract.html | 주거 | 계약과 권리 지키기: 등기부등본, 대항력·우선변제, 전세사기 |
| 08 | chapters/buy.html | 주거 | 매매의 절차와 거래 비용: 중개보수, 취득세, 등기 |
| 09 | chapters/mortgage.html | 금융 | 주택담보대출: LTV·DSR·스트레스 DSR, 상환 방식, 정책대출 |
| 10 | chapters/leverage.html | 금융 | 레버리지와 위험: 자기자본수익률, 갭투자, 경매 |
| 11 | chapters/subscription.html | 금융 | 청약과 분양: 가점제·추첨제, 특별공급, 당첨 확률 |
| 12 | chapters/redevelop.html | 금융 | 재건축과 재개발: 비례율, 권리가액, 분담금 |
| 13 | chapters/holdingtax.html | 세금과 제도 | 보유세: 공시가격, 재산세, 종합부동산세 |
| 14 | chapters/tradetax.html | 세금과 제도 | 사고팔 때의 세금: 취득세, 양도소득세, 상속·증여 기초 |
| 15 | chapters/policy.html | 세금과 제도 | 정책과 규제: 규제지역, 토지거래허가, 풍선 효과 |
| 16 | chapters/data.html | 시장 | 집값 통계 읽기: 실거래가와 호가, 가격지수, 중위·평균 |
| 17 | chapters/bubble.html | 시장 | 거품과 하락: 기대와 군집, 해외 사례와 한국의 사이클 |
| 18 | chapters/beyond.html | 시장 | 주택 밖의 부동산: 오피스텔·상가·토지·리츠 |
| 19 | chapters/future.html | 시장 | 인구와 도시의 미래: 고령화, 1인 가구, 지방 빈집 |
| 20 | chapters/decision.html | 설계 | 사느냐 빌리느냐: 총비용과 손익분기 보유 기간 |
| 21 | chapters/plan.html | 설계 | 내 집 마련 계획: 자금 계획표, 감당 가능한 가격 |
| 22 | chapters/lab.html | — | 부동산 실험실: 30년 주거 경로 |
| 23 | chapters/glossary.html | — | 용어집, 종합 퀴즈 |

공통 코드
- `css/style.css` — 디자인 토큰(라이트/다크), 중개사 노트·계약 전 체크 상자
- `js/common.js` — 내비게이션, 검색, 캔버스·차트·막대·도넛·끌기 헬퍼, 전역 `EB`
- `js/estate.js` — 2026년 제도 값, 대출 상환·DSR·한도, 주거비 비교, 자본환원·헤도닉·거미집 모형, 보증금 회수율, 레버리지, 취득세·보유세·양도세, 청약 가점과 당첨 확률, 정비사업 분담금, 전역 `RE`
- `tools/head.py` — 챕터 `<head>`·사이트맵·JSON-LD 생성기
- `tools/check.py` — 페이지 점검기(콘솔 오류, 가로 넘침, 조작 중 예외)
- `SOURCES.md` — 제도 수치와 출처, 확인 상태

레이아웃과 시뮬레이터 헬퍼는 같은 시리즈의 [InsureBook](https://github.com/geniuskey/insurebook)·[MoneyBook](https://github.com/geniuskey/moneybook)에서 가져왔습니다. 챕터 작성 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

제도 수치는 2026년 한국 제도를 바탕으로 한 교육용 대표값이며 해마다 바뀝니다. 계산은 교육용 모델의 결과입니다. 이 사이트는 특정 지역·단지·상품을 권하지 않으며 투자·세무·법률 자문이 아닙니다.

## 배포 (GitHub Pages)
`CNAME`에 `estatebook.euiyun.com`이 들어 있습니다. `main` 브랜치에 푸시하면 GitHub Actions가 `@euiyun/book`으로 `.book-dist/`를 만들어 배포합니다(저장소 Pages 설정의 소스를 GitHub Actions로 둡니다).

## 라이선스

Copyright (c) 2026 geniuskey and EstateBook contributors

| 적용 대상 | 라이선스 | 재사용 조건 |
|---|---|---|
| JS·CSS·Python·HTML의 실행 코드 | [MIT](LICENSE-MIT) | 수정·재배포·상업적 이용 가능. 저작권 및 라이선스 고지 유지 |
| 교재 본문·그림·문제·해설 | [CC BY 4.0](LICENSE-CC-BY-4.0) | 수정·번역·재배포·상업적 이용 가능. 저작자·출처·라이선스 표시 및 변경 사실 명시 |

자세한 내용은 [라이선스 안내](LICENSE.md)를 참고하세요.
