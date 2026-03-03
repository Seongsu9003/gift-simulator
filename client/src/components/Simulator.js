import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 수익률 시뮬레이터 컴포넌트
function Simulator() {
  // 폼 상태
  const [formData, setFormData] = useState({
    monthlyAmount: 100000,
    investmentYears: 30
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
      [name]: parseInt(value)
    }));
  };

  // 슬라이더 변경 처리
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      monthlyAmount: value
    }));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 백엔드 API 호출
      const response = await fetch('https://gift-simulator-production.up.railway.app/api/simulator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyAmount: formData.monthlyAmount,
          investmentYears: formData.investmentYears
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

  // 간략한 금액 포맷팅 (차트용)
  const formatCurrencyShort = (amount) => {
    if (amount >= 100000000) {
      return (amount / 100000000).toFixed(1) + '억원';
    } else if (amount >= 10000000) {
      return (amount / 10000000).toFixed(0) + '천만원';
    } else if (amount >= 10000) {
      return (amount / 10000).toFixed(0) + '만원';
    }
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{`${label}년차`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color }}>
              {`${entry.name}: ${formatCurrencyShort(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="simulator-container">
      {/* 입력 폼 */}
      <div className="form-container">
        <h2 className="form-title">투자시뮬레이션</h2>

        <form onSubmit={handleSubmit}>
          {/* 월 적립액 슬라이더 */}
          <div className="form-group">
            <label htmlFor="monthlyAmount" className="form-label">
              월 적립액: <strong>{formatCurrency(formData.monthlyAmount)}</strong>
            </label>
            <input
              type="range"
              id="monthlyAmount"
              name="monthlyAmount"
              min="10000"
              max="1000000"
              step="10000"
              value={formData.monthlyAmount}
              onChange={handleSliderChange}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: '#ddd',
                outline: 'none',
                appearance: 'none'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              color: '#6c757d',
              marginTop: '0.5rem'
            }}>
              <span>1만원</span>
              <span>100만원</span>
            </div>
          </div>

          {/* 투자 기간 선택 */}
          <div className="form-group">
            <label htmlFor="investmentYears" className="form-label">
              투자 기간
            </label>
            <select
              id="investmentYears"
              name="investmentYears"
              className="form-select"
              value={formData.investmentYears}
              onChange={handleInputChange}
            >
              <option value={5}>5년</option>
              <option value={10}>10년</option>
              <option value={20}>20년</option>
              <option value={30}>30년</option>
            </select>
          </div>

          {/* 투자 정보 미리보기 */}
          <div className="info-box">
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#3D2C2C' }}>투자 정보</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div>
                <strong>연 수익률:</strong> 10.23% (고정)
              </div>
              <div>
                <strong>총 투자 기간:</strong> {formData.investmentYears}년
              </div>
              <div>
                <strong>예상 총 납입:</strong> {formatCurrency(formData.monthlyAmount * 12 * formData.investmentYears)}
              </div>
              <div>
                <strong>총 투자 개월:</strong> {formData.investmentYears * 12}개월
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? '계산 중...' : '수익률 확인하기'}
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
          {/* 투자 요약 */}
          <div className="result-card">
            <h3 className="result-title">투자 요약</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#e7f3ff',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF8C69' }}>
                  {formatCurrency(results.summary.totalInvestment)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  총 납입액
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#e8f5e8',
                borderRadius: '8px'
              }}>
                <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {formatCurrency(results.summary.finalAssets)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  최종 예상 자산
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#fff3cd',
                borderRadius: '8px'
              }}>
                <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {formatCurrency(results.summary.totalProfit)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  총 수익
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#f8d7da',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF8C69' }}>
                  {results.summary.totalReturnMultiple}배
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  수익 배수
                </div>
              </div>
            </div>
          </div>

          {/* 수익률 차트 */}
          <div className="result-card">
            <h3 className="result-title">연도별 자산 성장 차트</h3>
            <div style={{ width: '100%', height: '400px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={results.yearlyProjection}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `${value}년`}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={formatCurrencyShort}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulativeInvestment"
                    stroke="#0066cc"
                    strokeWidth={2}
                    dot={{ fill: '#0066cc', strokeWidth: 2, r: 3 }}
                    name="납입 원금"
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedAssets"
                    stroke="#28a745"
                    strokeWidth={3}
                    dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
                    name="예상 자산"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 연도별 상세 데이터 (일부) */}
          <div className="result-card">
            <h3 className="result-title">주요 구간별 상세 정보</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>연차</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>납입액</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>예상자산</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>수익률</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyProjection
                    .filter((_, index) => index % 5 === 4 || index === results.yearlyProjection.length - 1)
                    .map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>
                        {item.year}년
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                        {formatCurrencyShort(item.cumulativeInvestment)}
                      </td>
                      <td className="text-success" style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrencyShort(item.projectedAssets)}
                      </td>
                      <td className="text-success" style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                        {item.returnRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="info-box">
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3D2C2C' }}>시뮬레이션 안내</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#3D2C2C' }}>
              <li>연 수익률 10.23%는 역사적 S&P 500 평균 기준입니다</li>
              <li>실제 투자 수익률은 시장 상황에 따라 변동될 수 있습니다</li>
              <li>복리 효과를 고려한 월 적립식 투자 기준으로 계산됩니다</li>
              <li>세금, 수수료 등은 고려되지 않았습니다</li>
            </ul>
          </div>

          {/* 면책 조항 */}
          <div className="highlight-box" style={{ textAlign: 'center' }}>
            <p style={{
              margin: 0,
              color: '#3D2C2C',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}>
              본 결과는 참고용이며 실제 투자 결과와 다를 수 있습니다
            </p>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#3D2C2C',
              fontSize: '0.875rem'
            }}>
              투자 결정 시에는 다양한 요소를 종합적으로 고려하시기 바랍니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Simulator;