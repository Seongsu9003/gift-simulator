import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import './App.css';
import RoadmapForm from './components/RoadmapForm';
import TaxCalculator from './components/TaxCalculator';
import Simulator from './components/Simulator';
import Login from './components/Login';
import ChildSetup from './components/ChildSetup';

function App() {
  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState('roadmap');

  // 사용자 인증 상태
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [childInfo, setChildInfo] = useState(null);
  const [needsChildSetup, setNeedsChildSetup] = useState(false);

  // Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // 사용자가 로그인된 경우 Firestore에서 자녀 정보 확인
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.childName && userData.childBirthDate) {
              // 자녀 정보가 있는 경우
              setChildInfo(userData);
              setNeedsChildSetup(false);
            } else {
              // 자녀 정보가 없는 경우
              setNeedsChildSetup(true);
            }
          } else {
            // 사용자 문서가 없는 경우 (첫 로그인)
            setNeedsChildSetup(true);
          }
        } catch (error) {
          console.error('사용자 정보 로드 에러:', error);
          setNeedsChildSetup(true);
        }
      } else {
        // 로그아웃된 경우
        setChildInfo(null);
        setNeedsChildSetup(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 자녀 설정 완료 처리
  const handleChildSetupComplete = (childData) => {
    setChildInfo(childData);
    setNeedsChildSetup(false);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

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
        return <RoadmapForm childInfo={childInfo} />;
      case 'tax':
        return <TaxCalculator childInfo={childInfo} />;
      case 'simulator':
        return <Simulator />;
      default:
        return <RoadmapForm childInfo={childInfo} />;
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-icon">🌱</div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
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

        {/* 로그인 화면 */}
        <main className="main-content">
          <div className="container">
            <Login />
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

  // 자녀 정보 입력이 필요한 경우
  if (needsChildSetup) {
    return (
      <div className="app">
        <ChildSetup onComplete={handleChildSetupComplete} />
      </div>
    );
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="app-header">
        <div className="container">
          <div className="header-top">
            <h1 className="child-title">
              {childInfo?.childName}이의 증여 플랜 💛
            </h1>
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
          <p className="header-subtitle">
            지금부터 30년간 {childInfo?.childName}이를 위한 최적의 증여 전략을 세워보세요
          </p>
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
