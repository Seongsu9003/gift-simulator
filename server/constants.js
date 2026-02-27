// 증여세 관련 상수 정의
// 2025년 기준 증여세법 적용

// 증여세 면제 한도 (10년 단위)
const GIFT_TAX_EXEMPTION = {
  // 직계비속 (미성년, 만 19세 미만)
  MINOR_CHILD: 20_000_000, // 2,000만 원

  // 직계비속 (성인, 만 19세 이상)
  ADULT_CHILD: 50_000_000, // 5,000만 원

  // 배우자
  SPOUSE: 600_000_000, // 6억 원

  // 기타 친족
  OTHER_RELATIVE: 10_000_000 // 1,000만 원
};

// 증여세 누진세율 구간 (면제 한도 초과 시 적용)
const GIFT_TAX_RATES = [
  { min: 0, max: 100_000_000, rate: 0.10, deduction: 0 }, // 1억 이하: 10%
  { min: 100_000_000, max: 500_000_000, rate: 0.20, deduction: 10_000_000 }, // 1억~5억: 20% (누진공제 1천만원)
  { min: 500_000_000, max: 1_000_000_000, rate: 0.30, deduction: 60_000_000 }, // 5억~10억: 30% (누진공제 6천만원)
  { min: 1_000_000_000, max: 3_000_000_000, rate: 0.40, deduction: 160_000_000 }, // 10억~30억: 40% (누진공제 1억6천만원)
  { min: 3_000_000_000, max: Infinity, rate: 0.50, deduction: 460_000_000 } // 30억 초과: 50% (누진공제 4억6천만원)
];

// 수익률 시뮬레이터 상수
const INVESTMENT_CONSTANTS = {
  // 연 고정 수익률 (역사적 S&P 500 평균 기반)
  ANNUAL_RETURN_RATE: 0.1023, // 10.23%

  // 월 단위 수익률 (연 수익률을 12로 나눔)
  MONTHLY_RETURN_RATE: 0.1023 / 12,

  // 월 적립 범위
  MIN_MONTHLY_INVESTMENT: 10_000, // 1만 원
  MAX_MONTHLY_INVESTMENT: 1_000_000 // 100만 원
};

// 나이 구분 기준
const AGE_CRITERIA = {
  ADULT_AGE: 19 // 만 19세 이상이 성인
};

module.exports = {
  GIFT_TAX_EXEMPTION,
  GIFT_TAX_RATES,
  INVESTMENT_CONSTANTS,
  AGE_CRITERIA
};