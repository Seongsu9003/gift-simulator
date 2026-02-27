import React, { useState } from 'react';

// 증여세 계산기 컴포넌트
function TaxCalculator() {
  // 폼 상태
  const [formData, setFormData] = useState({
    giftAmount: '',
    relationship: 'child',
    currentAge: '',
    accumulatedGiftAmount: ''
  });

  // 로딩 및 결과 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 백엔드 API 호출
      const response = await fetch('https://gift-simulator-production.up.railway.app/api/tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftAmount: parseInt(formData.giftAmount),
          relationship: formData.relationship,
          currentAge: parseInt(formData.currentAge),
          accumulatedGiftAmount: parseInt(formData.accumulatedGiftAmount) || 0
        })
      });

      if (!response.ok) {
        throw new Error('API 호출에 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        throw new Error(data.error || '결과를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 면제 한도 사용률 게이지 컴포넌트
  const ExemptionGauge = ({ usageRate, isExceeded }) => {
    const strokeColor = usageRate <= 50 ? '#28a745' : usageRate <= 80 ? '#ffc107' : '#dc3545';
    const circumference = 2 * Math.PI * 45; // 반지름 45인 원의 둘레
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (circumference * Math.min(usageRate, 100)) / 100;

    return (
      <div className="gauge-container">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg width="120" height="120" viewBox="0 0 100 100">
            {/* 배경 원 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e9ecef"
              strokeWidth="8"
              fill="transparent"
            />
            {/* 진행률 원 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={strokeColor}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div className="gauge-value" style={{
              fontSize: '1.5rem',
              color: strokeColor
            }}>
              {usageRate}%
            </div>
          </div>
        </div>
        <div className="gauge-label">
          면제 한도 사용률
          {isExceeded && (
            <div style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '0.25rem' }}>
              ⚠️ 한도 초과
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tax-calculator-container">
      {/* 입력 폼 */}
      <div className="form-container">
        <h2 className="form-title">💰 증여세 계산기</h2>

        <form onSubmit={handleSubmit}>
          {/* 증여 금액 */}
          <div className="form-group">
            <label htmlFor="giftAmount" className="form-label">
              증여 금액 (원)
            </label>
            <input
              type="number"
              id="giftAmount"
              name="giftAmount"
              className="form-input"
              value={formData.giftAmount}
              onChange={handleInputChange}
              placeholder="25000000"
              min="0"
              step="1000000"
              required
            />
            <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
              증여하려는 금액을 입력하세요
            </small>
          </div>

          {/* 수증자 나이 */}
          <div className="form-group">
            <label htmlFor="currentAge" className="form-label">
              수증자 현재 나이
            </label>
            <input
              type="number"
              id="currentAge"
              name="currentAge"
              className="form-input"
              value={formData.currentAge}
              onChange={handleInputChange}
              placeholder="10"
              min="0"
              max="100"
              required
            />
            <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
              증여받는 자녀의 만 나이를 입력하세요
            </small>
          </div>

          {/* 관계 선택 */}
          <div className="form-group">
            <label htmlFor="relationship" className="form-label">
              수증자와의 관계
            </label>
            <select
              id="relationship"
              name="relationship"
              className="form-select"
              value={formData.relationship}
              onChange={handleInputChange}
            >
              <option value="child">직계비속 (자녀)</option>
              <option value="spouse">배우자</option>
              <option value="other">기타 친족</option>
            </select>
          </div>

          {/* 누적 증여액 */}
          <div className="form-group">
            <label htmlFor="accumulatedGiftAmount" className="form-label">
              현재 10년 구간 누적 증여액 (원)
            </label>
            <input
              type="number"
              id="accumulatedGiftAmount"
              name="accumulatedGiftAmount"
              className="form-input"
              value={formData.accumulatedGiftAmount}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
            <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
              현재 10년 구간에서 이미 증여한 금액 (없으면 0)
            </small>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? '계산 중...' : '증여세 계산하기'}
          </button>
        </form>

        {/* 에러 메시지 */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}
      </div>

      {/* 결과 표시 */}
      {results && (
        <div className="result-container">
          {/* 면제 한도 사용률 게이지 */}
          <div className="result-card">
            <h3 className="result-title">📊 면제 한도 현황</h3>
            <ExemptionGauge
              usageRate={results.exemptionUsageRate}
              isExceeded={results.isExemptionExceeded}
            />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                {results.ageCategory} 기준 면제 한도: <strong>{formatCurrency(results.exemptionLimit)}</strong>
              </div>
            </div>
          </div>

          {/* 증여 정보 */}
          <div className="result-card">
            <h3 className="result-title">📋 증여 정보</h3>
            <div className="result-item">
              <span className="result-label">증여 금액</span>
              <span className="result-value" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {formatCurrency(results.giftAmount)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">수증자 분류</span>
              <span className="result-value">{results.ageCategory}</span>
            </div>
            <div className="result-item">
              <span className="result-label">관계</span>
              <span className="result-value">
                {results.relationship === 'child' ? '직계비속 (자녀)' :
                 results.relationship === 'spouse' ? '배우자' : '기타 친족'}
              </span>
            </div>
          </div>

          {/* 세금 계산 결과 */}
          <div className="result-card">
            <h3 className="result-title">💳 세금 계산 결과</h3>
            <div className="result-item">
              <span className="result-label">기존 누적 증여액</span>
              <span className="result-value">{formatCurrency(results.accumulatedGiftAmount)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">총 증여액 (10년 구간)</span>
              <span className="result-value">{formatCurrency(results.totalGiftInPeriod)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">면제 한도</span>
              <span className="result-value">{formatCurrency(results.exemptionLimit)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">한도 초과 금액</span>
              <span className="result-value" style={{
                color: results.excessAmount > 0 ? '#dc3545' : '#28a745',
                fontWeight: 'bold'
              }}>
                {formatCurrency(results.excessAmount)}
              </span>
            </div>
            <div className="result-item" style={{
              borderTop: '2px solid #e9ecef',
              paddingTop: '1rem',
              marginTop: '1rem'
            }}>
              <span className="result-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                납부할 증여세
              </span>
              <span className="result-value" style={{
                color: results.taxAmount > 0 ? '#dc3545' : '#28a745',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {formatCurrency(results.taxAmount)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                실제 수령 금액
              </span>
              <span className="result-value" style={{
                color: '#28a745',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {formatCurrency(results.netReceiveAmount)}
              </span>
            </div>
          </div>

          {/* 세율 정보 */}
          <div style={{
            background: '#e7f3ff',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c5460' }}>📈 증여세율 정보</h4>
            <div style={{ color: '#0c5460', fontSize: '0.9rem' }}>
              <p style={{ margin: '0.25rem 0' }}>• 면제 한도 초과분에 대해 누진세율 적용</p>
              <p style={{ margin: '0.25rem 0' }}>• 1억원 이하: 10% / 1~5억원: 20% / 5~10억원: 30%</p>
              <p style={{ margin: '0.25rem 0' }}>• 10~30억원: 40% / 30억원 초과: 50%</p>
            </div>
          </div>

          {/* 면책 조항 */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              color: '#856404',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}>
              ⚠️ 본 결과는 참고용이며 실제 세무 신고와 다를 수 있습니다
            </p>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#856404',
              fontSize: '0.875rem'
            }}>
              정확한 세금 계산을 위해서는 세무 전문가와 상담하시기 바랍니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaxCalculator;