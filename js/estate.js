/* Copyright (c) 2026 geniuskey and EstateBook contributors.
   Executable code: MIT (see ../LICENSE-MIT).
   Educational values and explanations: CC-BY-4.0 (see ../LICENSE.md). */
/* ==========================================================================
   EstateBook 부동산 계산 엔진 — 전역 객체 RE
   모든 장이 같은 계산을 쓰도록 모아 둔다. 단위는 원, 비율은 소수, 면적은 ㎡, 기간은 년.
   - 제도 값(2026년 기준 대표값): RE.KR
   - 금융: RE.payment, RE.dsr, RE.maxLoan
   - 주거비: RE.convert, RE.brokerage, RE.housingCost, RE.rentVsBuy
   - 가치: RE.capValue, RE.hedonic, RE.cobweb
   - 위험: RE.jeonseRisk, RE.leverage
   - 세금: RE.acqTax, RE.holdingTax, RE.capGainsTax (입력과 계산 단계 steps를 함께 반환)
   - 청약·정비사업: RE.subscriptionScore, RE.odds, RE.redevelop, RE.ratio
   - 케이스: RE.CASE (하늘네 집 노트)
   브라우저(window.RE)와 node(require) 둘 다에서 쓴다.
   ========================================================================== */
(function (root) {
  "use strict";
  const RE = {};

  /* ------------------------------------------------------------ 제도 값 */
  // 2026년 무렵 한국 제도의 대표값. 해마다 바뀌며, 확실하지 않은 값은 본문에서 '약'을 붙이거나 "확인 필요"로 남긴다.
  // 각 값 옆 주석: 근거 법령·기관, (확인일). 확인일이 없는 값은 교육용 근사다.
  RE.KR = {
    year: 2026,

    // 한국은행 기준금리(연). 2026-07-16 2.50→2.75%, 2026-08-27 2.75→3.00% 인상(언론 보도로 확인, 2026-10-08). 10월 이후 결정은 확인 필요
    baseRate: 0.03,

    // 가계 자산 중 실물자산(대부분 부동산) 비중. 2025 가계금융복지조사(2025년 3월 말 기준, 2025-12-04 발표): 가구 평균 자산 5억 6,678만원, 실물자산 75.8%
    householdRealShare: 0.758,
    householdAssets: 5.6678e8,

    /* 임대차: 주택임대차보호법·시행령 (국가법령정보센터) */
    conversion: { spread: 0.02, cap: 0.10 },   // 전월세 전환율 상한 = min(연 10%, 기준금리 + 2%p) — 시행령 제9조
    renewal: { times: 1, years: 2, cap: 0.05 }, // 계약갱신청구권 1회(2년), 갱신 시 증액 상한 5% — 법 제6조의3, 제7조
    // 소액임차인 최우선변제(시행령 제10조·제11조, 2023-02-21 이후 담보물권 설정분): 보증금 limit 이하이면 priority까지 먼저 받는다
    smallTenant: [
      { key: "seoul",  region: "서울특별시",                                 limit: 1.65e8, priority: 5.5e7 },
      { key: "metro",  region: "과밀억제권역(서울 제외)·세종·용인·화성·김포",  limit: 1.45e8, priority: 4.8e7 },
      { key: "city",   region: "광역시·안산·광주·파주·이천·평택",             limit: 8.5e7,  priority: 2.8e7 },
      { key: "other",  region: "그 밖의 지역",                              limit: 7.5e7,  priority: 2.5e7 },
    ],
    smallTenantShareCap: 0.5,                   // 최우선변제 총액은 주택가액(낙찰가)의 1/2까지

    /* 중개보수 상한(주택). 공인중개사법 시행규칙 [별표], 2021-10-19 개정 이후 */
    brokerage: {
      sale:  [ { upTo: 5e7, rate: 0.006, max: 2.5e5 }, { upTo: 2e8, rate: 0.005, max: 8e5 }, { upTo: 9e8, rate: 0.004 }, { upTo: 1.2e9, rate: 0.005 }, { upTo: 1.5e9, rate: 0.006 }, { upTo: Infinity, rate: 0.007 } ],
      lease: [ { upTo: 5e7, rate: 0.005, max: 2e5 },   { upTo: 1e8, rate: 0.004, max: 3e5 }, { upTo: 6e8, rate: 0.003 }, { upTo: 1.2e9, rate: 0.004 }, { upTo: 1.5e9, rate: 0.005 }, { upTo: Infinity, rate: 0.006 } ],
      vat: 0.1,                                 // 일반과세자 중개사무소는 부가가치세 10%가 붙을 수 있다
      rentMultiplier: 100, rentMultiplierSmall: 70, // 월세 거래금액 = 보증금 + 월세×100 (5천만원 미만이면 ×70)
    },

    /* 취득세(주택 유상취득). 지방세법 제11조·제13조의2, 지방세특례제한법 제36조의3 */
    acq: {
      low: 6e8, high: 9e8,                      // 6억 이하 1%, 6억~9억 (취득가/1억 × 2/3 − 3)%, 9억 초과 3%
      heavy: {                                  // 다주택·법인 중과(취득 후 주택 수 기준)
        regulated:   { 2: 0.08, 3: 0.12 },      // 조정대상지역: 2주택 8%, 3주택 이상 12% (일시적 2주택은 일반세율)
        unregulated: { 3: 0.08, 4: 0.12 },      // 그 밖: 3주택 8%, 4주택 이상 12%
      },
      eduRatio: 0.1,                            // 지방교육세: 일반세율이면 취득세의 약 10%(0.1~0.3%)
      eduHeavy: 0.004,                          // 중과세율일 때 지방교육세 0.4%
      ruralOver85: { normal: 0.002, 0.08: 0.006, 0.12: 0.01 }, // 농어촌특별세: 전용 85㎡ 초과만
      firstHome: { credit: 2e6, priceCap: 1.2e9 }, // 생애최초 주택 취득세 감면 최대 200만원(12억 이하, 소득요건 없음). 일몰 2028-12-31(확인 필요). 40세 미만 300만원 확대안은 2026 지방세제 개편안(추진 중)
    },

    /* 재산세(주택). 지방세법 제111조·제111조의2, 시행령 공정시장가액비율 */
    property: {
      rates:   [ { upTo: 6e7, rate: 0.001 },  { upTo: 1.5e8, rate: 0.0015 }, { upTo: 3e8, rate: 0.0025 }, { upTo: Infinity, rate: 0.004 } ],
      special: [ { upTo: 6e7, rate: 0.0005 }, { upTo: 1.5e8, rate: 0.001 },  { upTo: 3e8, rate: 0.002 },  { upTo: Infinity, rate: 0.0035 } ], // 1세대1주택 공시가 9억 이하 특례(현행 기한 2026년 말로 알려짐, 2029년까지 연장안 추진 중 — 확인 필요)
      specialCap: 9e8,
      fmvOne: [ { upTo: 3e8, ratio: 0.43 }, { upTo: 6e8, ratio: 0.44 }, { upTo: Infinity, ratio: 0.45 } ], // 1세대1주택 공정시장가액비율(2026년분, 지방세법 시행령 2026-06-01 시행)
      fmv: 0.6,                                 // 그 밖의 주택
      city: 0.0014,                             // 도시지역분(과세표준 × 0.14%)
      eduRatio: 0.2,                            // 지방교육세 = 재산세 × 20%
    },

    /* 종합부동산세(주택). 종합부동산세법 제8조·제9조, 시행령 공정시장가액비율 */
    comp: {
      deduct: 9e8, deductOne: 1.2e9,            // 기본공제 9억, 1세대1주택 12억
      fmv: 0.6,
      rates:      [ { upTo: 3e8, rate: 0.005 }, { upTo: 6e8, rate: 0.007 }, { upTo: 1.2e9, rate: 0.01 }, { upTo: 2.5e9, rate: 0.013 }, { upTo: 5e9, rate: 0.015 }, { upTo: 9.4e9, rate: 0.02 }, { upTo: Infinity, rate: 0.027 } ],
      ratesHeavy: [ { upTo: 3e8, rate: 0.005 }, { upTo: 6e8, rate: 0.007 }, { upTo: 1.2e9, rate: 0.01 }, { upTo: 2.5e9, rate: 0.02 },  { upTo: 5e9, rate: 0.03 },  { upTo: 9.4e9, rate: 0.04 }, { upTo: Infinity, rate: 0.05 } ], // 3주택 이상
      elderly: [ { age: 70, rate: 0.4 }, { age: 65, rate: 0.3 }, { age: 60, rate: 0.2 } ], // 1세대1주택 고령자 공제
      longHold: [ { years: 15, rate: 0.5 }, { years: 10, rate: 0.4 }, { years: 5, rate: 0.2 } ], // 1세대1주택 장기보유 공제
      creditCap: 0.8,                           // 두 공제 합산 한도 80%
      rural: 0.2,                               // 농어촌특별세 = 종부세 × 20%
      // 2026 세제개편안(2026-09-01 정부안, 국회 심사 중, 확정 전): 공정시장가액비율 70~80%, 실거주 1주택 공제 14억, 세율 체계 개편
    },

    /* 양도소득세(주택). 소득세법 제55조·제89조·제95조·제104조, 시행령 제154조·제156조 */
    cgt: {
      rates: [ { upTo: 1.4e7, rate: 0.06, ded: 0 }, { upTo: 5e7, rate: 0.15, ded: 1.26e6 }, { upTo: 8.8e7, rate: 0.24, ded: 5.76e6 }, { upTo: 1.5e8, rate: 0.35, ded: 1.544e7 },
               { upTo: 3e8, rate: 0.38, ded: 1.994e7 }, { upTo: 5e8, rate: 0.40, ded: 2.594e7 }, { upTo: 1e9, rate: 0.42, ded: 3.594e7 }, { upTo: Infinity, rate: 0.45, ded: 6.594e7 } ],
      basic: 2.5e6,                             // 양도소득 기본공제(연 250만원)
      local: 0.1,                               // 지방소득세 = 양도세 × 10%
      exemptCap: 1.2e9,                         // 1세대1주택 비과세 고가주택 기준(양도가액 12억)
      exemptHold: 2, exemptLive: 2,             // 2년 보유(조정대상지역에서 취득했으면 2년 거주)
      short: { 1: 0.7, 2: 0.6 },                // 주택: 1년 미만 70%, 2년 미만 60%
      ltdOne: { hold: 0.04, live: 0.04, capEach: 0.4, minHold: 3, minLive: 2 }, // 1세대1주택: 보유 연 4% + 거주 연 4%, 최대 80%
      ltdGeneral: { minHold: 3, start: 0.06, step: 0.02, cap: 0.3 },           // 일반: 3년 6%부터 연 2%p, 최대 30%(15년)
      heavy: { 2: 0.2, 3: 0.3 },                // 조정대상지역 다주택 중과 가산(+20%p, +30%p). 중과 배제 유예가 2026-05-09 종료되어 2026-05-10 양도분부터 재개(언론 보도로 확인)
      heavySuspended: false,
      tempTwoYears: 2,                          // 일시적 2주택 종전주택 처분기한: 둘 다 조정대상지역이면 2년(2026-10-01 시행, 그 전 취득·계약분은 3년), 그 밖 3년
      // 2026 세제개편안(추진 중): 장기보유특별공제를 거주 중심으로 전환(2028~) — 확정 전
    },

    /* 대출 규제. 금융위원회 6.27 대책(2025-06-28), 10.15 대책(2025-10-16 시행), 2026 가계부채 관리방안(2026-04-01). 언론 보도로 확인(2026-10-08) */
    loan: {
      ltv: { unregulated: 0.7, regulated: 0.4, firstHome: 0.7, multiRegulated: 0 }, // 담보인정비율: 규제지역 무주택·처분조건 1주택 40%, 생애최초 70%, 규제지역 다주택 구입 0%
      capByPrice: [ { upTo: 1.5e9, cap: 6e8 }, { upTo: 2.5e9, cap: 4e8 }, { upTo: Infinity, cap: 2e8 } ], // 수도권·규제지역 주담대 한도(시가 기준)
      capMetro: 6e8,                            // 수도권·규제지역 주담대 최대 6억(2025-06-28~)
      dsr: { bank: 0.4, nonbank: 0.5 },         // 차주단위 DSR 한도
      stress: { base: 0.015, metroFloor: 0.03, local: 0.0075 }, // 스트레스 DSR 하한: 3단계(2025-07-01) 수도권 1.5%p·지방 0.75%p(지방 주담대 유예 2026년 말까지), 10.15 이후 수도권·규제지역 주담대 3%p
      jeonseInDsr: "수도권·규제지역 1주택자 전세대출 이자분만(2025-10-29~)",
      creditYears: 5,                           // DSR 산정 시 신용대출 만기 5년 가정
    },

    /* 전세보증금반환보증(HUG). 보증금 한도 수도권 7억·그 외 5억, (선순위채권 + 보증금) ≤ 주택가격 × 90%, 공시가격 기준 주택가격 = 공시가격 × 140% (2023-05~) */
    hug: { capMetro: 7e8, capOther: 5e8, ratio: 0.9, publicMult: 1.4 },

    /* 청약 가점(주택공급에 관한 규칙 [별표 1]) */
    sub: { homelessMax: 32, depMax: 35, acctMax: 17, total: 84,
      // 가점제 비율(주택공급에 관한 규칙 제28조, 민영주택): [60㎡ 이하, 60~85㎡, 85㎡ 초과]
      pointShare: { speculative: [0.4, 0.7, 0.8], adjusted: [0.4, 0.7, 0.5], other: [0.4, 0.4, 0] } },
    /* 규제지역(2026-07 기준): 서울 25개 구 전역 + 경기 15곳이 투기과열지구·조정대상지역·토지거래허가구역 (10.15 대책, 2026-06-30 추가 지정) */
    regulatedCount: { seoul: 25, gyeonggi: 15 },

    /* 교육용 대표값(제도 아님) */
    publicRatio: 0.69,                          // 공동주택 공시가격 ÷ 시세(현실화율), 약
    upkeep: 0.005,                              // 연 수선·관리 충당(집값 대비), 교육용
    legal: 0.002,                               // 법무사·등기 비용(집값 대비), 교육용
    moving: 2e6,                                // 이사·청소 비용, 교육용
  };

  /* ------------------------------------------------------------ 기본 수학 */
  RE.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  RE.rng = function (seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  RE.gauss = function (seed) {
    const r = RE.rng(seed);
    return function () { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  };
  /** 표준정규 누적분포 */
  RE.normCdf = function (x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804014327 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };
  /** 표준정규 분위수(Acklam 근사) */
  RE.normInv = function (p) {
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const lo = 0.02425;
    let q, r;
    if (p < lo) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - lo) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };
  /** 구간 표에서 첫 구간 찾기: [{upTo, ...}] */
  const bracket = (tbl, x) => tbl.find((b) => x <= b.upTo) || tbl[tbl.length - 1];
  /** 누진 세율표 적용: [{upTo, rate}] → 세액 */
  RE.progressive = function (tbl, base) {
    let tax = 0, lo = 0;
    for (const b of tbl) {
      if (base <= lo) break;
      tax += (Math.min(base, b.upTo) - lo) * b.rate;
      lo = b.upTo;
    }
    return Math.max(0, tax);
  };
  /** 현재가치: 월 이율 r, n개월, 매월 pmt */
  RE.pv = function (r, n, pmt) { return Math.abs(r) < 1e-12 ? pmt * n : pmt * (1 - Math.pow(1 + r, -n)) / r; };

  /* ------------------------------------------------------------ 금융 */
  /**
   * 상환 스케줄. method: "level"(원리금균등) | "principal"(원금균등) | "bullet"(만기일시)
   * graceYears: 거치 기간(이자만 낸다). 반환: {monthly, first, last, totalInterest, totalPaid, annualFirst, rows:[{m, pay, interest, principal, balance}], years:[{year, pay, interest, principal, balance}]}
   */
  RE.payment = function (o) {
    const P = o.principal, r = (o.rate || 0) / 12, n = Math.max(1, Math.round((o.years || 30) * 12));
    const g = Math.round((o.graceYears || 0) * 12), method = o.method || "level", na = Math.max(1, n - g);
    const level = Math.abs(r) < 1e-12 ? P / na : P * r / (1 - Math.pow(1 + r, -na));
    const rows = [];
    let bal = P;
    for (let m = 1; m <= n; m++) {
      const interest = bal * r;
      let prin;
      if (m <= g) prin = 0;
      else if (method === "principal") prin = P / na;
      else if (method === "bullet") prin = m === n ? bal : 0;
      else prin = level - interest;
      prin = Math.min(prin, bal);
      bal = Math.max(0, bal - prin);
      rows.push({ m, pay: interest + prin, interest, principal: prin, balance: bal });
    }
    const years = [];
    for (let y = 0; y * 12 < rows.length; y++) {
      const s = rows.slice(y * 12, y * 12 + 12);
      years.push({ year: y + 1, pay: s.reduce((a, x) => a + x.pay, 0), interest: s.reduce((a, x) => a + x.interest, 0), principal: s.reduce((a, x) => a + x.principal, 0), balance: s[s.length - 1].balance });
    }
    const totalInterest = rows.reduce((a, x) => a + x.interest, 0);
    return { method, monthly: rows[g] ? rows[g].pay : rows[0].pay, first: rows[0].pay, last: rows[rows.length - 1].pay, totalInterest, totalPaid: P + totalInterest, annualFirst: years[0].pay, rows, years };
  };

  /**
   * DSR(총부채원리금상환비율) = 모든 대출의 연간 원리금 ÷ 연소득.
   * loans: [{principal, rate, years, method, kind}] kind: "mortgage"(기본) | "jeonse"(이자만) | "credit"(만기 5년 가정)
   * stress: 주담대 금리에 더하는 스트레스 가산금리(DSR 계산용, 실제 금리는 그대로)
   */
  RE.dsr = function (o) {
    const stress = o.stress || 0;
    const rows = (o.loans || []).map((l) => {
      let annual;
      if (l.kind === "jeonse") annual = l.principal * l.rate;
      else if (l.kind === "credit") annual = RE.payment({ principal: l.principal, rate: l.rate, years: RE.KR.loan.creditYears }).annualFirst;
      else annual = RE.payment({ principal: l.principal, rate: l.rate + stress, years: l.years || 30, method: l.method || "level" }).annualFirst;
      return Object.assign({}, l, { annual });
    });
    const annual = rows.reduce((a, x) => a + x.annual, 0);
    return { annual, ratio: o.income > 0 ? annual / o.income : Infinity, rows };
  };

  /**
   * 빌릴 수 있는 최대 주담대. 세 한도(DSR, LTV, 금액 상한) 중 가장 작은 값.
   * o: {income, rate, years, price, ltv, dsrCap, stress, otherAnnual(다른 대출의 연 원리금), cap}
   */
  RE.maxLoan = function (o) {
    const dsrCap = o.dsrCap != null ? o.dsrCap : RE.KR.loan.dsr.bank;
    const room = Math.max(0, o.income * dsrCap - (o.otherAnnual || 0)) / 12;
    const byDsr = RE.pv((o.rate + (o.stress || 0)) / 12, Math.round((o.years || 30) * 12), room);
    const byLtv = o.price != null && o.ltv != null ? o.price * o.ltv : Infinity;
    const byCap = o.cap != null ? o.cap : Infinity;
    const max = Math.min(byDsr, byLtv, byCap);
    const binding = max === byDsr ? "dsr" : max === byLtv ? "ltv" : "cap";
    return { byDsr, byLtv, byCap, max, binding, monthly: RE.payment({ principal: max, rate: o.rate, years: o.years || 30 }).monthly };
  };

  /* ------------------------------------------------------------ 주거비 */
  /** 법정 전월세 전환율 상한: min(10%, 기준금리 + 2%p) */
  RE.conversionCap = (base = RE.KR.baseRate) => Math.min(RE.KR.conversion.cap, base + RE.KR.conversion.spread);
  /**
   * 전월세 전환. RE.convert(보증금, 월세, 전환율) →
   * {jeonse(같은 값의 전세 보증금), annualRent, rentAt(보증금) → 그 보증금일 때의 월세, depositAt(월세) → 그 월세일 때의 보증금}
   */
  RE.convert = function (deposit, rent, rate) {
    const jeonse = deposit + rent * 12 / rate;
    return {
      jeonse, annualRent: rent * 12, rate,
      rentAt: (d) => Math.max(0, (jeonse - d) * rate / 12),
      depositAt: (m) => Math.max(0, jeonse - m * 12 / rate),
    };
  };
  /** 중개보수 상한. kind: "sale" | "lease". lease일 때 rent(월세)를 주면 거래금액을 환산한다 */
  RE.brokerage = function (amount, kind = "sale", rent = 0) {
    const B = RE.KR.brokerage;
    let base = amount;
    if (kind === "lease" && rent > 0) {
      base = amount + rent * B.rentMultiplier;
      if (base < 5e7) base = amount + rent * B.rentMultiplierSmall;
    }
    const b = bracket(B[kind], base);
    const fee = b.max != null ? Math.min(base * b.rate, b.max) : base * b.rate;
    return { base, rate: b.rate, fee, max: b.max != null ? b.max : null };
  };

  /**
   * 연간 주거비(한 해에 실제로 사라지는 돈). mode: "buy" | "jeonse" | "rent"
   * 공통: oppRate(내 돈의 기회비용 이율), loanRate
   * buy: price, loan, growth(집값 상승률), holdTax(생략하면 1주택 보유세 계산), upkeepRate, years(거래비용 상각 기간)
   * jeonse: deposit, loan, moveEvery(이사 주기, 년)
   * rent: deposit, rent(월)
   * 반환: {mode, total, monthly, parts:[{key, label, value}]}  value > 0 은 나가는 돈, value < 0 은 들어오는 돈(시세차익)
   */
  RE.housingCost = function (o) {
    const opp = o.oppRate != null ? o.oppRate : 0.03, lr = o.loanRate != null ? o.loanRate : 0.04;
    const parts = [];
    if (o.mode === "buy") {
      const loan = o.loan || 0, equity = o.price - loan;
      const tax = o.holdTax != null ? o.holdTax : RE.holdingTax({ value: o.price * RE.KR.publicRatio, one: true }).total;
      const yrs = o.years || 10;
      const tx = (RE.acqTax({ price: o.price, homes: 1, area: o.area || 84 }).total + RE.brokerage(o.price).fee * 2 + o.price * RE.KR.legal) / yrs;
      parts.push({ key: "interest", label: "대출 이자", value: loan * lr });
      parts.push({ key: "opp", label: "내 돈의 기회비용", value: equity * opp });
      parts.push({ key: "tax", label: "보유세", value: tax });
      parts.push({ key: "upkeep", label: "수선·관리", value: o.price * (o.upkeepRate != null ? o.upkeepRate : RE.KR.upkeep) });
      parts.push({ key: "tx", label: "거래비용(" + yrs + "년 상각)", value: tx });
      parts.push({ key: "gain", label: "집값 변화", value: -o.price * (o.growth || 0) });
    } else if (o.mode === "jeonse") {
      const loan = o.loan || 0, own = o.deposit - loan, every = o.moveEvery || 4;
      parts.push({ key: "interest", label: "전세대출 이자", value: loan * lr });
      parts.push({ key: "opp", label: "보증금의 기회비용", value: own * opp });
      parts.push({ key: "tx", label: "중개보수·이사(" + every + "년마다)", value: (RE.brokerage(o.deposit, "lease").fee + RE.KR.moving) / every });
    } else {
      const every = o.moveEvery || 4;
      parts.push({ key: "rent", label: "월세", value: (o.rent || 0) * 12 });
      parts.push({ key: "opp", label: "보증금의 기회비용", value: (o.deposit || 0) * opp });
      parts.push({ key: "tx", label: "중개보수·이사(" + every + "년마다)", value: (RE.brokerage(o.deposit || 0, "lease", o.rent || 0).fee + RE.KR.moving) / every });
    }
    const total = parts.reduce((a, p) => a + p.value, 0);
    return { mode: o.mode, total, monthly: total / 12, parts };
  };

  /**
   * 사기 vs 전세 vs 월세: 해마다 쌓이는 누적 비용(그해에 팔고 나간다고 칠 때)과 손익분기 연수.
   * o: {price, ltv(또는 loan), loanRate, loanYears, oppRate, growth, rentGrowth, jeonse, jeonseLoan, deposit, rent, years, area, moveEvery}
   * buy 누적비용 = 취득 비용 + Σ(이자 + 기회비용 + 보유세 + 수선) + 매도 중개보수 − (그해 집값 − 산 값)
   */
  RE.rentVsBuy = function (o) {
    const years = o.years || 10, g = o.growth || 0, rg = o.rentGrowth != null ? o.rentGrowth : g;
    const opp = o.oppRate != null ? o.oppRate : 0.03, lr = o.loanRate != null ? o.loanRate : 0.04;
    const loan = o.loan != null ? o.loan : o.price * (o.ltv || 0);
    const sched = loan > 0 ? RE.payment({ principal: loan, rate: lr, years: o.loanYears || 30 }) : null;
    const upfront = RE.acqTax({ price: o.price, homes: 1, area: o.area || 84 }).total + RE.brokerage(o.price).fee + o.price * RE.KR.legal + RE.KR.moving;
    const every = o.moveEvery || 4;
    const rows = [];
    let cb = upfront, cj = 0, cr = 0, jeonse = o.jeonse || 0, rent = o.rent || 0, equity = o.price - loan + upfront;
    for (let y = 1; y <= years; y++) {
      const priceStart = o.price * Math.pow(1 + g, y - 1), priceY = o.price * Math.pow(1 + g, y);
      const yr = sched && sched.years[y - 1] ? sched.years[y - 1] : { interest: 0, principal: 0 };
      cb += yr.interest + equity * opp + RE.holdingTax({ value: priceStart * RE.KR.publicRatio, one: true }).total + priceStart * RE.KR.upkeep;
      equity += yr.principal;
      const buyNow = cb + RE.brokerage(priceY).fee - (priceY - o.price);
      // 전세: 이사 주기마다 시세로 다시 계약, 늘어난 보증금은 내 돈으로 낸다
      if (y > 1 && (y - 1) % every === 0) { jeonse = (o.jeonse || 0) * Math.pow(1 + rg, y - 1); cj += RE.brokerage(jeonse, "lease").fee + RE.KR.moving; }
      if (y === 1) cj += RE.brokerage(jeonse, "lease").fee + RE.KR.moving;
      const jl = o.jeonseLoan || 0;
      cj += (jeonse - jl) * opp + jl * lr;
      // 월세
      if (y > 1 && (y - 1) % every === 0) { rent = (o.rent || 0) * Math.pow(1 + rg, y - 1); cr += RE.brokerage(o.deposit || 0, "lease", rent).fee + RE.KR.moving; }
      if (y === 1) cr += RE.brokerage(o.deposit || 0, "lease", rent).fee + RE.KR.moving;
      cr += rent * 12 + (o.deposit || 0) * opp;
      rows.push({ year: y, buy: buyNow, jeonse: cj, rent: cr, price: priceY });
    }
    const be = (k) => { const r = rows.find((x) => x.buy <= x[k]); return r ? r.year : null; };
    return { rows, upfront, breakEven: { jeonse: be("jeonse"), rent: be("rent") } };
  };

  /* ------------------------------------------------------------ 가치 */
  /** 자본환원 가격: 연 임대료 ÷ (할인율 − 성장률). 할인율 = 금리 + 위험 프리미엄 */
  RE.capValue = function (rent, discount, growth = 0) {
    const d = discount - growth;
    return d <= 0 ? Infinity : rent / d;
  };

  /**
   * 교육용 헤도닉 가격 모형. 실제 시장 추정치가 아니라 크기를 흉내 낸 모형이다.
   * a: {area(㎡), commute(일자리 중심까지 분), walk(역까지 도보 분), school(0~1 학군 지수), age(년), park(bool), households(세대수), base(기준 ㎡당 가격)}
   * 기준: 84㎡, 통근 30분, 역 5분, 학군 0.5, 10년, 공원 없음, 500세대.
   * 반환: {price, perM2, ref, parts:[{key, label, factor, won}]}  won은 다른 속성을 기준에 두고 그 속성만 바꿨을 때의 가격 차이
   */
  RE.hedonic = function (a) {
    a = Object.assign({ area: 84, commute: 30, walk: 5, school: 0.5, age: 10, park: false, households: 500, base: 1.0e7 }, a || {});
    const ref = a.base * 84;
    const L = [
      { key: "area", label: "면적", lv: Math.log(a.area / 84) * 0.95 },
      { key: "commute", label: "통근 시간", lv: -0.015 * (a.commute - 30) },
      { key: "walk", label: "역까지 거리", lv: -0.008 * (Math.min(a.walk, 30) - 5) },
      { key: "school", label: "학군", lv: 0.24 * (a.school - 0.5) },
      { key: "age", label: "건물 나이", lv: -0.011 * (Math.min(a.age, 30) - 10) + 0.006 * Math.max(0, a.age - 30) },
      { key: "park", label: "공원·생활 인프라", lv: a.park ? 0.03 : 0 },
      { key: "size", label: "단지 규모", lv: 0.03 * Math.log10(Math.max(50, a.households) / 500) },
    ];
    const lsum = L.reduce((s, x) => s + x.lv, 0);
    const price = ref * Math.exp(lsum);
    const parts = L.map((x) => ({ key: x.key, label: x.label, factor: Math.exp(x.lv), won: ref * (Math.exp(x.lv) - 1) }));
    return { price, perM2: price / a.area, ref, parts };
  };

  /**
   * 공급 시차 사이클(거미집 모형, 교육용).
   * 가격 편차 x_t = 수요 충격 s_t − (lag년 전 가격에 반응해 착공된 물량이 지금 준공된 양)
   * o: {years, lag(착공→준공, 년), k(공급 반응 ÷ 수요 기울기, 1보다 크면 진동이 커진다), shockYear, shock, demandTrend}
   * 반환: 분기마다 [{t(년), price(1=균형), starts, completions}]
   */
  RE.cobweb = function (o) {
    o = Object.assign({ years: 30, lag: 3, k: 0.8, shockYear: 2, shock: 0.15, demandTrend: 0 }, o || {});
    // 분기 단위로 돌린다. 착공은 지난 1년 평균 가격에 반응하고, 준공은 lag년 뒤 1년에 걸쳐 나온다.
    const Q = 4, n = o.years * Q, L = Math.round(o.lag * Q), x = [], st = [], out = [];
    const avg = (arr, a, b) => { let s = 0, c = 0; for (let i = a; i <= b; i++) { s += i >= 0 && i < arr.length ? arr[i] : 0; c++; } return s / c; };
    for (let q = 0; q <= n; q++) {
      const t = q / Q;
      const s = (t >= o.shockYear ? o.shock : 0) + o.demandTrend * t;
      const comp = avg(st, q - L - 2, q - L + 1);
      const xt = Math.max(-0.8, Math.min(3, s - comp));
      x.push(xt);
      st.push(o.k * avg(x, q - 3, q));
      out.push({ t, price: 1 + xt, starts: st[q], completions: comp });
    }
    return out;
  };

  /* ------------------------------------------------------------ 위험 */
  /**
   * 보증금 회수 계산(경매로 넘어갔을 때, 교육용 단순화).
   * o: {price(시세), deposit, seniorDebt(나보다 앞선 채권: 근저당 등), drop(시세 하락률), auctionRate(낙찰가율), costs(경매 비용), region(최우선변제 지역 key), small(최우선변제 적용 여부)}
   * 반환: {sale, priority, toSenior, recovered, loss, rate, ratio(전세가율), debtRatio((선순위+보증금)/시세), steps}
   */
  RE.jeonseRisk = function (o) {
    const ar = o.auctionRate != null ? o.auctionRate : 0.8;
    const value = o.price * (1 - (o.drop || 0));
    const sale = Math.max(0, value * ar - (o.costs != null ? o.costs : value * 0.01));
    let priority = 0;
    if (o.small && o.region) {
      const t = RE.KR.smallTenant.find((r) => r.key === o.region);
      if (t && o.deposit <= t.limit) priority = Math.min(t.priority, o.deposit, sale * RE.KR.smallTenantShareCap);
    }
    const afterPriority = sale - priority;
    const toSenior = Math.min(o.seniorDebt || 0, afterPriority);
    const rest = Math.max(0, afterPriority - toSenior);
    const recovered = Math.min(o.deposit, priority + Math.min(rest, o.deposit - priority));
    const loss = o.deposit - recovered;
    return {
      value, sale, priority, toSenior, recovered, loss, rate: o.deposit > 0 ? recovered / o.deposit : 1,
      ratio: o.deposit / o.price, debtRatio: ((o.seniorDebt || 0) + o.deposit) / o.price,
      steps: [
        { label: "하락 후 시세", value },
        { label: "낙찰가(낙찰가율 " + Math.round(ar * 100) + "%)에서 경매 비용을 뺀 배당 재원", value: sale },
        { label: "최우선변제(소액임차인)", value: priority },
        { label: "선순위 채권에 먼저 배당", value: toSenior },
        { label: "보증금으로 돌아오는 돈", value: recovered },
      ],
    };
  };

  /**
   * 레버리지와 자기자본수익률.
   * o: {price, equity, rate(대출 금리), growth(연 집값 변화, 기댓값), rent(연 순임대수입), holdCost(연 보유비용), deposit(세입자 보증금, 무이자 부채), years, sigma(연 변동성), n, seed}
   * 대출 = price − equity − deposit. 반환: {loan, gain, interest, roe(연, 결정론), sims:{roe:[정렬된 연평균], lossShare, wipeShare, mean}}
   */
  RE.leverage = function (o) {
    const deposit = o.deposit || 0, loan = Math.max(0, o.price - o.equity - deposit);
    const years = o.years || 1, rent = o.rent || 0, hold = o.holdCost || 0;
    const interest = loan * (o.rate || 0);
    const gain = o.price * (o.growth || 0);
    const roe = (gain + rent - interest - hold) / o.equity;
    const out = { loan, gain, interest, roe, multiple: o.price / o.equity };
    if (o.sigma) {
      const n = o.n || 2000, gs = RE.gauss(o.seed || 11), list = [];
      let loss = 0, wipe = 0;
      for (let i = 0; i < n; i++) {
        let p = o.price;
        for (let y = 0; y < years; y++) p *= Math.exp((o.growth || 0) - o.sigma * o.sigma / 2 + o.sigma * gs());
        const end = p - loan - deposit + (rent - interest - hold) * years;
        const total = end / o.equity - 1;
        if (total < 0) loss++;
        if (end <= 0) wipe++;
        list.push(total);
      }
      list.sort((a, b) => a - b);
      out.sims = { total: list, lossShare: loss / n, wipeShare: wipe / n, median: list[Math.floor(n / 2)], mean: list.reduce((a, b) => a + b, 0) / n };
    }
    return out;
  };

  /* ------------------------------------------------------------ 세금 */
  /**
   * 취득세(주택 유상취득).
   * o: {price, homes(취득 후 주택 수), regulated(조정대상지역), area(전용㎡), firstHome, temporary(일시적 2주택)}
   * 반환: {rate, acq, edu, rural, credit, total, heavy, steps}
   */
  RE.acqTax = function (o) {
    const A = RE.KR.acq, P = o.price, homes = o.homes || 1, area = o.area || 84;
    let rate;
    if (P <= A.low) rate = 0.01;
    else if (P <= A.high) rate = Math.round((P / 1e8 * 2 / 3 - 3) * 1e4) / 1e6; // 세율(%)은 소수점 넷째 자리까지
    else rate = 0.03;
    let heavy = null;
    if (!o.temporary) {
      const tbl = o.regulated ? A.heavy.regulated : A.heavy.unregulated;
      const keys = Object.keys(tbl).map(Number).sort((a, b) => b - a);
      const k = keys.find((x) => homes >= x);
      if (k) heavy = tbl[k];
    }
    if (heavy) rate = heavy;
    const acq = P * rate;
    const edu = heavy ? P * A.eduHeavy : acq * A.eduRatio;
    const rural = area > 85 ? P * (heavy ? (A.ruralOver85[heavy] || 0) : A.ruralOver85.normal) : 0;
    const credit = o.firstHome && !heavy && P <= A.firstHome.priceCap ? Math.min(A.firstHome.credit, acq) : 0;
    const total = acq + edu + rural - credit;
    return {
      rate, acq, edu, rural, credit, total, heavy: !!heavy, effective: total / P,
      steps: [
        { label: "취득세율" + (heavy ? "(중과)" : ""), value: rate, pct: true },
        { label: "취득세 = 취득가액 × 세율", value: acq },
        { label: "지방교육세", value: edu },
        { label: "농어촌특별세" + (area > 85 ? "" : "(85㎡ 이하 비과세)"), value: rural },
        { label: "생애최초 감면", value: -credit },
        { label: "합계", value: total },
      ],
    };
  };

  /**
   * 보유세(재산세 + 종합부동산세), 한 해.
   * o: {value(이 집의 공시가격), total(가진 주택 공시가격 합, 종부세용; 생략하면 value), homes(주택 수), one(1세대1주택), age, years(보유 연수)}
   * 반환: {property:{base, tax, city, edu, total}, comp:{base, gross, overlap, credit, tax, rural, total}, total, steps}
   */
  RE.holdingTax = function (o) {
    const K = RE.KR.property, C = RE.KR.comp;
    const v = o.value, one = !!o.one, homes = o.homes || 1;
    const fmvP = one ? bracket(K.fmvOne, v).ratio : K.fmv;
    const pBase = v * fmvP;
    const useSpecial = one && v <= K.specialCap;
    const pTax = RE.progressive(useSpecial ? K.special : K.rates, pBase);
    const city = pBase * K.city, pEdu = pTax * K.eduRatio;
    const property = { fmv: fmvP, base: pBase, tax: pTax, city, edu: pEdu, total: pTax + city + pEdu, special: useSpecial };
    // 종합부동산세
    const tot = o.total != null ? o.total : v;
    const ded = one ? C.deductOne : C.deduct;
    const cBase = Math.max(0, tot - ded) * C.fmv;
    const gross = RE.progressive(homes >= 3 ? C.ratesHeavy : C.rates, cBase);
    // 재산세 중복분 공제(단순화): 종부세 과세표준에 해당하는 부분에 매겨진 재산세(표준세율 최고 구간 0.4%로 근사)
    const overlap = Math.min(gross, cBase * fmvP * K.rates[K.rates.length - 1].rate);
    let creditRate = 0;
    if (one && cBase > 0) {
      const e = C.elderly.find((x) => (o.age || 0) >= x.age), l = C.longHold.find((x) => (o.years || 0) >= x.years);
      creditRate = Math.min(C.creditCap, (e ? e.rate : 0) + (l ? l.rate : 0));
    }
    const afterOverlap = Math.max(0, gross - overlap);
    const credit = afterOverlap * creditRate;
    const cTax = afterOverlap - credit, rural = cTax * C.rural;
    const comp = { deduct: ded, base: cBase, gross, overlap, creditRate, credit, tax: cTax, rural, total: cTax + rural };
    const total = property.total + comp.total;
    return {
      property, comp, total,
      steps: [
        { label: "공시가격", value: v },
        { label: "재산세 과세표준 = 공시가격 × 공정시장가액비율 " + Math.round(fmvP * 100) + "%", value: pBase },
        { label: "재산세" + (useSpecial ? "(1주택 특례세율)" : ""), value: pTax },
        { label: "도시지역분 + 지방교육세", value: city + pEdu },
        { label: "종부세 과세표준 = (공시가격 합 − " + (ded / 1e8) + "억) × 60%", value: cBase },
        { label: "종합부동산세(재산세 중복분·공제 반영)", value: cTax },
        { label: "농어촌특별세", value: rural },
        { label: "보유세 합계", value: total },
      ],
    };
  };

  /**
   * 양도소득세(주택, 교육용 단순화).
   * o: {buy, sell, costs(필요경비: 취득세·중개보수·수리비 등), years(보유), live(거주), homes(양도 시 주택 수, 이 집 포함), regulated(양도 시 조정대상지역), regulatedAtBuy(취득 시 조정대상지역)}
   * 반환: {gain, exempt, taxableGain, ltdRate, ltd, income, base, rate, tax, local, total, steps}
   */
  RE.capGainsTax = function (o) {
    const G = RE.KR.cgt, homes = o.homes || 1, yrs = o.years || 0, live = o.live || 0;
    const gain = Math.max(0, o.sell - o.buy - (o.costs || 0));
    const oneOk = homes === 1 && yrs >= G.exemptHold && (!o.regulatedAtBuy || live >= G.exemptLive);
    let taxableGain = gain, exempt = false;
    if (oneOk) {
      if (o.sell <= G.exemptCap) { exempt = true; taxableGain = 0; }
      else taxableGain = gain * (o.sell - G.exemptCap) / o.sell;
    }
    const heavyOn = homes >= 2 && o.regulated && !G.heavySuspended && yrs >= 2;
    let ltdRate = 0;
    if (!heavyOn) {
      if (oneOk && yrs >= G.ltdOne.minHold && live >= G.ltdOne.minLive) ltdRate = Math.min(G.ltdOne.capEach, G.ltdOne.hold * Math.floor(yrs)) + Math.min(G.ltdOne.capEach, G.ltdOne.live * Math.floor(live));
      else if (yrs >= G.ltdGeneral.minHold) ltdRate = Math.min(G.ltdGeneral.cap, G.ltdGeneral.start + G.ltdGeneral.step * (Math.floor(yrs) - 3));
    }
    const ltd = taxableGain * ltdRate;
    const income = taxableGain - ltd;
    const base = Math.max(0, income - (taxableGain > 0 ? G.basic : 0));
    let tax, rateLabel;
    if (yrs < 1) { tax = base * G.short[1]; rateLabel = "단기 70%"; }
    else if (yrs < 2) { tax = base * G.short[2]; rateLabel = "단기 60%"; }
    else {
      const add = heavyOn ? (G.heavy[Math.min(3, homes)] || 0) : 0;
      const b = bracket(G.rates, base);
      tax = Math.max(0, base * (b.rate + add) - b.ded);
      rateLabel = "기본세율 " + Math.round(b.rate * 100) + "%" + (add ? " + 중과 " + Math.round(add * 100) + "%p" : "");
    }
    const local = tax * G.local, total = tax + local;
    return {
      gain, exempt, oneOk, taxableGain, ltdRate, ltd, income, base, rateLabel, tax, local, total, effective: gain > 0 ? total / gain : 0,
      steps: [
        { label: "양도차익 = 양도가 − 취득가 − 필요경비", value: gain },
        { label: oneOk ? (exempt ? "1세대1주택 비과세(12억 이하)" : "12억 초과분만 과세하는 양도차익") : "과세 대상 양도차익", value: taxableGain },
        { label: "장기보유특별공제 " + Math.round(ltdRate * 100) + "%", value: -ltd },
        { label: "기본공제 250만원 후 과세표준", value: base },
        { label: "양도소득세(" + rateLabel + ")", value: tax },
        { label: "지방소득세(10%)", value: local },
        { label: "합계", value: total },
      ],
    };
  };

  /* ------------------------------------------------------------ 청약·정비사업 */
  /**
   * 청약 가점. o: {homelessYears(무주택 기간, 년; 유주택이면 -1), dependents(부양가족 수), accountYears(통장 가입 기간)}
   */
  RE.subscriptionScore = function (o) {
    const S = RE.KR.sub;
    const h = o.homelessYears == null || o.homelessYears < 0 ? 0 : Math.min(S.homelessMax, 2 + 2 * Math.floor(o.homelessYears));
    const d = Math.min(S.depMax, 5 + 5 * Math.max(0, Math.floor(o.dependents || 0)));
    const ay = o.accountYears || 0;
    const a = ay < 0.5 ? 1 : ay < 1 ? 2 : Math.min(S.acctMax, 2 + Math.floor(ay));
    return { homeless: h, dependents: d, account: a, total: h + d + a };
  };

  /**
   * 당첨 확률(교육용). 신청자의 가점이 정규분포(mean, sd)라고 보고, 가점제 물량의 커트라인과 추첨제 확률을 계산한다.
   * o: {supply(일반공급 물량), applicants(신청자 수), score, mean, sd, pointShare(가점제 비율)}
   */
  RE.odds = function (o) {
    const supply = o.supply, n = Math.max(1, o.applicants), ps = o.pointShare != null ? o.pointShare : 0.4;
    const mean = o.mean != null ? o.mean : 50, sd = o.sd || 12;
    const pointN = Math.round(supply * ps), lotN = supply - pointN;
    const q = Math.max(0, 1 - pointN / n);
    const cutoff = pointN >= n ? -Infinity : mean + sd * RE.normInv(Math.min(0.999999, Math.max(1e-6, q)));
    const pPoint = pointN <= 0 ? 0 : 1 / (1 + Math.exp(-(o.score - cutoff) / 0.8));
    const pLottery = Math.min(1, lotN / Math.max(1, n - pointN));
    const p = pPoint + (1 - pPoint) * pLottery;
    return { competition: n / supply, cutoff, pPoint, pLottery, p };
  };

  /** 비례율 = (종후자산 총액 − 총사업비) ÷ 종전자산 총액 */
  RE.ratio = (o) => (o.revenue - o.cost) / o.prior;
  /**
   * 정비사업 분담금. o: {rightsValue(종전자산 감정가), ratio(비례율), newPrice(조합원 분양가)}
   * 권리가액 = 종전자산 × 비례율, 분담금 = 조합원 분양가 − 권리가액(음수면 환급)
   */
  RE.redevelop = function (o) {
    const rights = o.rightsValue * o.ratio;
    return { rights, contribution: o.newPrice - rights, refund: Math.max(0, rights - o.newPrice) };
  };

  /* ------------------------------------------------------------ 케이스: 하늘네 집 노트 */
  // 가상의 인물·지역·단지이며 실제와 무관하다. 금액은 교육용으로 정한 값이다.
  RE.CASE = {
    year: 2026,
    haneul: { name: "오하늘", age: 34, job: "중견기업 회계 담당", salary: 4.8e7, monthlyNet: 3.4e6 },
    jaewon: { name: "정재원", age: 35, job: "초등학교 교사", salary: 4.4e7, monthlyNet: 3.1e6 },
    child: { age: 3 },
    livingCost: 4.0e6,                 // 월 생활비(전세대출 이자 포함)
    savings: 8.0e7,                    // 예금·투자
    home: {
      region: "경기 B시", complex: "C아파트", area: 84, floor: 9, built: 2009,
      price: 6.2e8,                    // 2026년 시세(교육용)
      jeonse: 4.0e8, jeonseLoan: 2.0e8, loanRate: 0.038,
      start: "2025-04", end: "2027-04",
      renewalUsed: false,              // 계약갱신청구권을 아직 쓰지 않았다
    },
    landlord: { name: "남궁현", age: 58, homes: 2, bought: 2021, buyPrice: 6.8e8, depositAtBuy: 4.5e8, seniorDebt: 0, ownHome: "서울 A구" },
    father: { age: 66, region: "지방 D시", built: 1994, price: 1.6e8, bought: 2001, buyPrice: 7.0e7 },
    broker: { name: "민태호", age: 52, years: 20 },
    commute: { haneulWork: "서울 도심", jaewonWork: "경기 B시 초등학교" },
    // 02장에서 비교하는 후보 지역(84㎡ 기준 교육용 시세)
    areas: [
      { key: "A", name: "서울 A구", price: 1.25e9, jeonse: 6.5e8, commuteH: 25, commuteJ: 60, walk: 6 },
      { key: "B", name: "경기 B시(지금)", price: 6.2e8, jeonse: 4.0e8, commuteH: 55, commuteJ: 15, walk: 12 },
      { key: "E", name: "경기 E시 신도시", price: 4.9e8, jeonse: 3.0e8, commuteH: 75, commuteJ: 35, walk: 18 },
    ],
  };
  const C = RE.CASE;
  C.monthlyNet = C.haneul.monthlyNet + C.jaewon.monthlyNet;
  C.income = C.haneul.salary + C.jaewon.salary;
  C.monthlySaving = C.monthlyNet - C.livingCost;
  C.ownDeposit = C.home.jeonse - C.home.jeonseLoan;
  C.netWorth = C.ownDeposit + C.savings;

  root.RE = RE;
  if (typeof module !== "undefined" && module.exports) module.exports = RE;
})(typeof window !== "undefined" ? window : globalThis);
