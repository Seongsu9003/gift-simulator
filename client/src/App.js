import React, { useState } from 'react';
import './App.css';
import RoadmapForm from './components/RoadmapForm';
import TaxCalculator from './components/TaxCalculator';
import Simulator from './components/Simulator';

function App() {
  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState('roadmap');

  // 탭 정보
  const tabs = [
    { id: 'roadmap', name: '증여 플랜', icon: '📊' },
    { id: 'tax', name: '세금 계산', icon: '💰' },
    { id: 'simulator', name: '수익률 계산', icon: '📈' }
  ];

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'roadmap':
        return <RoadmapForm />;
      case 'tax':
        return <TaxCalculator />;
      case 'simulator':
        return <Simulator />;
      default:
        return <RoadmapForm />;
    }
  };

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="app-header">
        <div className="container">
          <div className="hero-content">
            <div className="hero-icon">👶💛🧑‍💼</div>
            <h1 className="app-title">우리 아이가 서른 살이 된다면? 🌱</h1>
            <p className="app-subtitle">지금 시작하는 증여 한 번이 아이의 30년을 바꿉니다</p>

            <div className="hero-badges">
              <div className="badge">
                <span className="badge-icon">📊</span>
                <span className="badge-text">10년 단위 면세 한도 활용</span>
              </div>
              <div className="badge">
                <span className="badge-icon">📈</span>
                <span className="badge-text">복리 효과로 자산 증식</span>
              </div>
              <div className="badge">
                <span className="badge-icon">🎯</span>
                <span className="badge-text">30년 증여 플랜 자동 생성</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="tab-nav">
        <div className="container">
          <div className="tab-list">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        <div className="container">
          {renderTabContent()}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="app-footer">
        <div className="container">
          <p className="footer-disclaimer">
            ⚠️ 본 시뮬레이션 결과는 참고용이며, 실제 세무 신고 및 투자 결과와 다를 수 있습니다.
          </p>
          <p className="footer-copyright">
            © 2026 증여 시뮬레이터. Made with ❤️ for financial planning.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
