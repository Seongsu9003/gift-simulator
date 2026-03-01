import React, { useState, useEffect } from 'react';

// 30년 증여 로드맵 컴포넌트
function RoadmapForm({ childInfo }) {
  // 폼 상태
  const [formData, setFormData] = useState({
    childBirthDate: '',
    relationship: 'child',
    existingGiftAmount: '',
    monthlyInvestment: ''
  });

  // 날짜 선택 상태
  const [dateSelection, setDateSelection] = useState({
    year: '',
    month: '',
    day: ''
  });

  // 로딩 및 결과 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // 자녀 정보 자동 채우기
  useEffect(() => {
    if (childInfo && childInfo.birthDate) {
      const [year, month, day] = childInfo.birthDate.split('-');

      // 날짜 선택 상태 설정
      setDateSelection({
        year: year,
        month: parseInt(month).toString(),
        day: parseInt(day).toString()
      });

      // 폼 데이터 설정
      setFormData(prev => ({
        ...prev,
        childBirthDate: childInfo.birthDate,
        relationship: childInfo.relationship || 'child'
      }));
    }
  }, [childInfo]);

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 날짜 선택 처리
  const handleDateChange = (field, value) => {
    setDateSelection(prev => {
      const newSelection = { ...prev, [field]: value };

      // 일 수 조정 (선택한 월에 맞게)
      if (field === 'month' && newSelection.day) {
        const daysInMonth = getDaysInMonth(parseInt(newSelection.year) || 2024, parseInt(value));
        if (parseInt(newSelection.day) > daysInMonth) {
          newSelection.day = daysInMonth.toString();
        }
      }

      // 전체 날짜가 선택되면 formData 업데이트
      if (newSelection.year && newSelection.month && newSelection.day) {
        const formattedDate = `${newSelection.year}-${newSelection.month.padStart(2, '0')}-${newSelection.day.padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, childBirthDate: formattedDate }));
      }

      return newSelection;
    });
  };

  // 월별 날짜 수 계산
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // 연도 옵션 생성 (1994~2026, 역순)
  const yearOptions = [];
  for (let year = 2026; year >= 1994; year--) {
    yearOptions.push(year);
  }

  // 월 옵션 생성
  const monthOptions = [];
  for (let month = 1; month <= 12; month++) {
    monthOptions.push(month);
  }

  // 일 옵션 생성
  const getDayOptions = () => {
    if (!dateSelection.year || !dateSelection.month) return [];

    const daysInMonth = getDaysInMonth(parseInt(dateSelection.year), parseInt(dateSelection.month));
    const dayOptions = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dayOptions.push(day);
    }
    return dayOptions;
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 백엔드 API 호출
      const response = await fetch('https://gift-simulator-production.up.railway.app/api/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childBirthDate: formData.childBirthDate,
          relationship: formData.relationship,
          existingGiftAmount: parseInt(formData.existingGiftAmount) || 0,
          monthlyInvestment: parseInt(formData.monthlyInvestment)
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

  // 퍼센트 포맷팅 함수
  const formatPercent = (percent) => {
    return percent + '%';
  };

  // 연령대별 이모지 아이콘
  const getAgeIcon = (ageCategory) => {
    if (ageCategory.includes('미성년')) {
      if (ageCategory.includes('0-10')) return '👶';
      return '🧒';
    }
    return '🧑';
  };

  return (
    <div className="roadmap-container">
      {/* 입력 폼 */}
      <div className="form-container">
        <h2 className="form-title">📊 내 아이 증여 플랜 만들기</h2>

        <form onSubmit={handleSubmit}>
          {/* 자동 입력된 자녀 정보 안내 */}
          {childInfo && (
            <div className="auto-filled-notice">
              <span className="notice-icon">✨</span>
              <span className="notice-text">
                {childInfo.name}이의 정보로 자동 입력되었어요 (변경하려면 프로필에서 수정해주세요)
              </span>
            </div>
          )}

          {/* 자녀 생년월일 */}
          <div className="form-group">
            <label className="form-label">
              자녀 생년월일
            </label>
            <div className="date-picker-container">
              <select
                className={`form-select date-select ${childInfo ? 'readonly' : ''}`}
                value={dateSelection.year}
                onChange={(e) => handleDateChange('year', e.target.value)}
                required
                disabled={childInfo}
              >
                <option value="">연도</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>

              <select
                className={`form-select date-select ${childInfo ? 'readonly' : ''}`}
                value={dateSelection.month}
                onChange={(e) => handleDateChange('month', e.target.value)}
                required
                disabled={childInfo}
              >
                <option value="">월</option>
                {monthOptions.map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </select>

              <select
                className={`form-select date-select ${childInfo ? 'readonly' : ''}`}
                value={dateSelection.day}
                onChange={(e) => handleDateChange('day', e.target.value)}
                required
                disabled={childInfo || (!dateSelection.year || !dateSelection.month)}
              >
                <option value="">일</option>
                {getDayOptions().map(day => (
                  <option key={day} value={day}>{day}일</option>
                ))}
              </select>
            </div>
            {!childInfo && (
              <small style={{ color: '#8B6F6F', fontSize: '0.875rem' }}>
                자녀의 생년월일을 선택해주세요
              </small>
            )}
          </div>

          {/* 관계 선택 */}
          <div className="form-group">
            <label htmlFor="relationship" className="form-label">
              자녀와의 관계
            </label>
            <select
              id="relationship"
              name="relationship"
              className={`form-select ${childInfo ? 'readonly' : ''}`}
              value={formData.relationship}
              disabled={childInfo}
              onChange={handleInputChange}
            >
              <option value="child">자녀</option>
              <option value="other">기타 친족</option>
            </select>
          </div>

          {/* 기존 증여액 */}
          <div className="form-group">
            <label htmlFor="existingGiftAmount" className="form-label">
              현재까지 증여한 금액 (원)
            </label>
            <input
              type="number"
              id="existingGiftAmount"
              name="existingGiftAmount"
              className="form-input"
              value={formData.existingGiftAmount}
              onChange={handleInputChange}
              placeholder="없으면 0을 입력하세요"
              min="0"
            />
            <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
              현재 10년 구간에서 이미 증여한 금액을 입력하세요
            </small>
          </div>

          {/* 월 적립액 */}
          <div className="form-group">
            <label htmlFor="monthlyInvestment" className="form-label">
              월 적립 희망 금액 (원)
            </label>
            <input
              type="number"
              id="monthlyInvestment"
              name="monthlyInvestment"
              className="form-input"
              value={formData.monthlyInvestment}
              onChange={handleInputChange}
              placeholder="예: 100,000"
              min="10000"
              max="1000000"
              step="10000"
              required
            />
            <small style={{ color: '#8B6F6F', fontSize: '0.875rem' }}>
              월 10만원부터 시작해도 30년 후 큰 차이가 생겨요 💛
            </small>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? '계산 중...' : '내 아이 증여 플랜 만들기'}
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
          {/* 자녀 정보 */}
          <div className="result-card">
            <h3 className="result-title">👶 자녀 정보</h3>
            <div className="result-item">
              <span className="result-label">현재 나이</span>
              <span className="result-value">{results.childInfo.currentAge}세</span>
            </div>
            <div className="result-item">
              <span className="result-label">생년월일</span>
              <span className="result-value">{results.childInfo.birthDate}</span>
            </div>
            <div className="result-item">
              <span className="result-label">관계</span>
              <span className="result-value">
                {results.childInfo.relationship === 'child' ? '자녀' : '기타 친족'}
              </span>
            </div>
          </div>

          {/* 요약 메시지 */}
          <div className="highlight-box">
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#FF8C69', fontWeight: 'bold', fontSize: '1.1rem' }}>
              🎉 30년간 총 {formatCurrency(results.planSummary.totalRecommendedGift)}을 면세로 증여할 수 있어요!
            </h3>
            <p style={{ margin: 0, color: '#8B6F6F', fontSize: '0.95rem' }}>
              절세 효과: <span className="text-success">{formatCurrency(results.planSummary.totalTaxSavings)}</span>
            </p>
          </div>

          {/* 30년 계획 요약 */}
          <div className="result-card">
            <h3 className="result-title">📋 30년 계획 요약</h3>
            <div className="result-item">
              <span className="result-label">총 추천 증여액</span>
              <span className="result-value text-success">
                {formatCurrency(results.planSummary.totalRecommendedGift)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">총 절세 효과</span>
              <span className="result-value text-success">
                {formatCurrency(results.planSummary.totalTaxSavings)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">총 면제 한도</span>
              <span className="result-value">
                {formatCurrency(results.planSummary.totalExemptionUsed)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">월 적립액</span>
              <span className="result-value">
                {formatCurrency(results.planSummary.monthlyInvestment)}
              </span>
            </div>
          </div>

          {/* 구간별 상세 계획 */}
          <div className="result-card">
            <h3 className="result-title">📅 구간별 상세 계획</h3>

            {results.roadmapPeriods.map((period, index) => (
              <div key={index} className="period-card" style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ margin: 0, color: '#3D2C2C' }}>
                    {getAgeIcon(period.ageCategory)} {period.period} ({period.ageCategory})
                  </h4>
                  <div style={{
                    background: period.exemptionUsageRate >= 80 ? '#dc3545' : '#28a745',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    면제한도 사용률: {formatPercent(period.exemptionUsageRate)}
                  </div>
                </div>

                <div className="result-item">
                  <span className="result-label">기간</span>
                  <span className="result-value">{period.startYear}년 ~ {period.endYear}년</span>
                </div>
                <div className="result-item">
                  <span className="result-label">면제 한도</span>
                  <span className="result-value">{formatCurrency(period.exemptionLimit)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">추천 증여액</span>
                  <span className="result-value text-success">
                    {formatCurrency(period.recommendedGiftAmount)}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">절세 효과</span>
                  <span className="result-value text-success">
                    {formatCurrency(period.taxSavings)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 안내 메시지 */}
          <div className="info-box">
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3D2C2C' }}>💡 안내사항</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#3D2C2C' }}>
              <li>증여세 면제 한도는 10년 단위로 적용됩니다</li>
              <li>미성년 자녀는 2,000만원, 성인 자녀는 5,000만원까지 면세</li>
              <li>조기에 증여할수록 복리 효과와 절세 혜택이 커집니다</li>
              <li>실제 증여 시에는 세무 전문가와 상담을 권합니다</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoadmapForm;