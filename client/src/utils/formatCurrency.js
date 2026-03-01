// 금액 포맷팅 유틸리티 함수들

/**
 * 숫자에 천 단위 콤마를 추가하는 함수
 * @param {number|string} value - 포맷할 숫자
 * @returns {string} 콤마가 추가된 문자열
 */
export const addCommas = (value) => {
  if (!value && value !== 0) return '';

  // 문자열로 변환 후 숫자만 추출
  const numericValue = value.toString().replace(/[^\d]/g, '');

  if (!numericValue) return '';

  // 천 단위 콤마 추가
  return parseInt(numericValue).toLocaleString();
};

/**
 * 콤마가 포함된 문자열을 숫자로 변환하는 함수
 * @param {string} value - 변환할 문자열
 * @returns {number} 변환된 숫자
 */
export const parseNumericValue = (value) => {
  if (!value) return 0;
  const numericValue = value.toString().replace(/[^\d]/g, '');
  return numericValue ? parseInt(numericValue) : 0;
};

/**
 * 숫자를 한글 금액으로 변환하는 함수
 * @param {number|string} value - 변환할 숫자
 * @returns {string} 한글로 변환된 금액 문자열
 */
export const convertToKoreanCurrency = (value) => {
  const numValue = typeof value === 'string' ? parseNumericValue(value) : value;

  if (!numValue || numValue === 0) return '';

  const 억 = Math.floor(numValue / 100000000);
  const 만 = Math.floor((numValue % 100000000) / 10000);
  const 원 = numValue % 10000;

  let result = '';

  // 억 단위 처리
  if (억 > 0) {
    result += `${억}억`;
    if (만 > 0) {
      result += ` ${addCommas(만)}만원`;
    } else if (원 > 0) {
      result += ` ${addCommas(원)}원`;
    } else {
      result += '원';
    }
  }
  // 만 단위 처리 (억이 없는 경우)
  else if (만 > 0) {
    result = `${addCommas(만)}만`;
    if (원 > 0) {
      result += ` ${addCommas(원)}원`;
    } else {
      result += '원';
    }
  }
  // 만원 미만 처리
  else if (원 > 0) {
    result = `${addCommas(원)}원`;
  }

  return result;
};