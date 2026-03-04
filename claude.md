# 증여 시뮬레이터 (gift_simulator) - Claude 가이드 v1.2.0

## 프로젝트 개요

- **프로젝트명**: 증여 시뮬레이터 (gift_simulator)
- **버전**: v1.2.0 (UI/UX 개선 완료)
- **목적**: 팀 모바일 앱에 정식 기능 추가 전 MVP 모델로 먼저 구현
- **형태**: 풀스택 웹 애플리케이션 (React + Node.js/Express + Firebase)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React |
| 백엔드 | Node.js / Express |
| 데이터베이스 | PostgreSQL |
| 인증 | Firebase Authentication (Google OAuth) |
| NoSQL | Firebase Firestore (사용자 및 자녀 정보) |
| 언어 | JavaScript (TypeScript 미사용) |
| 차트 | Recharts (투자시뮬레이션 시각화) |
| 폰트 | Pretendard Variable (CDN) |
| 배포 | Railway (백엔드 + 프론트엔드) |

---

## MVP 기능 범위

MVP는 핵심 3가지 기능에만 집중합니다.

### MVP에 포함 (v1.2.0 기준)

| 기능 | 설명 |
|------|------|
| 씨드머니 계획 (30년 증여 로드맵) | 자녀 정보(생년월일, 홈택스 증여신고금액, 월 적립액) 입력 → 구간별 최적 플랜 자동 생성 |
| 예상 증여세 계산 | 면제 한도(미성년 2,000만 원 / 성인 5,000만 원) 기준 세금 자동 계산 |
| 투자시뮬레이션 | 연 수익률 10.23% 고정, 월 적립식 복리 계산으로 30년 후 예상 자산 시각화 |
| Firebase Google 로그인 | Google OAuth를 통한 간편 로그인/로그아웃 기능 |
| 복수 자녀 관리 | 여러 자녀 등록 및 자녀별 맞춤 증여 플랜 생성 |
| 자녀 정보 관리 | 이름, 생년월일, 성별, 관계 정보 저장 및 수정 |
| 랜딩 페이지 배경 비디오 | MP4 자동재생 비디오로 시각적 임팩트 제공 |

### V2로 이연

- 증여 이력 관리 (날짜/금액 기록 및 추적)
- ETF 상품 비교 (VOO / QQQM 구분 시뮬레이션)
- PDF 내보내기

---

## 메뉴 구조 및 명칭 (v1.2.0)

| 탭 번호 | 메뉴명 | 설명 |
|---------|--------|------|
| 1 | 자녀 정보 | 자녀 이름, 생년월일, 관계 입력/확인 |
| 2 | 씨드머니 계획 | 30년 증여 로드맵 생성 (구 '증여 플랜') |
| 3 | 예상 증여세 계산 | 증여세 시뮬레이터 (구 '세금 계산') |
| 4 | 투자시뮬레이션 | 수익률 시뮬레이터 (구 '수익률 계산') |

---

## Firebase & Firestore 데이터 구조 (v1.1.0~)

### Firebase Authentication
- **Google OAuth** 기반 로그인/로그아웃
- 사용자 인증 상태 관리
- Firebase SDK를 통한 인증 처리

### Firestore 데이터베이스 구조
```
users (collection)
├─ {userId} (document)
   ├─ email: string
   ├─ name: string
   ├─ createdAt: timestamp
   └─ children (subcollection)
      ├─ {childId} (document)
      │  ├─ name: string           // 자녀 이름
      │  ├─ birthDate: string      // 생년월일 (YYYY-MM-DD)
      │  ├─ gender: string         // 성별 ('male' | 'female')
      │  ├─ relationship: string   // 관계 ('child' | 'grandchild')
      │  ├─ createdAt: timestamp
      │  └─ updatedAt: timestamp
      └─ {childId2} (document)
         └─ ... (같은 구조)
```

### 주요 Firestore 함수들
- `getChildren()`: 사용자의 모든 자녀 목록 조회
- `addChild(childData)`: 새 자녀 정보 추가
- `updateChild(childId, updateData)`: 자녀 정보 수정
- `deleteChild(childId)`: 자녀 정보 삭제
- `migrateOldChildData()`: 기존 단일 자녀 데이터를 복수 자녀 구조로 마이그레이션

---

## 증여세 핵심 로직 (계산 기준)

- 면제 한도는 **10년 단위** 기준
  - 미성년 자녀 (만 19세 미만): **2,000만 원**
  - 성인 자녀 (만 19세 이상): **5,000만 원**
- 면제 한도 초과 시 세율: 10% ~ 50% 누진세율 적용
- 투자시뮬레이션 연 수익률: **10.23% 고정**
- 현행 증여세법 2025년 기준 적용

---

## 사용자 플로우 (v1.2.0)

### 1. 랜딩 페이지
1. MP4 배경 비디오 자동 재생 (hero-baby.mp4, 약 4.4MB)
2. **"Google로 시작하기"** 버튼으로 로그인 유도
3. 서비스 소개 텍스트 표시

### 2. 로그인 플로우
1. Firebase Google OAuth 팝업을 통한 간편 로그인
2. 로그인 성공 시 자녀 선택/등록 화면으로 이동

### 3. 자녀 관리 플로우
1. **최초 로그인**: 자녀 정보가 없으면 자동으로 자녀 등록 화면 표시
2. **자녀 목록**: 등록된 자녀들을 카드 형태로 표시
   - 이름, 생년월일, 만 나이, 성별(M/F) 표시
   - 각 카드에 **"선택"** 버튼으로 해당 자녀의 플랜으로 이동
3. **자녀 추가**: **"+ 자녀 추가하기"** 버튼으로 새 자녀 등록
4. **자녀 전환**: 상단 헤더의 자녀 이름 버튼으로 다른 자녀 선택 가능

### 4. 씨드머니 계획 플로우 (4단계 스텝 위자드)
1. **Step 1 - 자녀 정보**: 선택된 자녀 정보 자동 연동 (이름, 생년월일, 관계)
2. **Step 2 - 씨드머니 계획**: 홈택스 증여신고금액(있어요/없어요 토글), 월 적립 희망액 입력
3. **Step 3 - 예상 증여세 계산**: 세금 시뮬레이션 결과 확인
4. **Step 4 - 투자시뮬레이션**: 수익률 시뮬레이션 결과 확인

---

## v1.2.0 변경 사항 (UI/UX 개선)

### 폰트 변경
- **Pretendard Variable** 폰트 적용 (CDN: jsdelivr)
- 모든 컴포넌트에 일관된 한국어 폰트 적용
- 폰트 스택: `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif`

### 이모지 제거
- 앱 전체에서 모든 이모지 아이콘 제거
- 성별 표시: 이모지 대신 'M' / 'F' 텍스트 사용
- 깔끔하고 전문적인 UI 지향

### UX 언어 개선
- '~이의 증여 플랜' → '~님의 씨드머니 계획' (존칭 + 친근한 용어)
- '증여 플랜' → '씨드머니 계획'
- '세금 계산' → '예상 증여세 계산'
- '수익률 계산' → '투자시뮬레이션'
- '자녀와의 관계' → '관계' (간결하게)
- '현재까지 증여한 금액' → '홈택스 증여신고금액' (구체적 안내)

### 폼 UX 개선
- 홈택스 증여신고금액 입력 시 **있어요/없어요 토글 버튼** 추가
  - '없어요' 선택 시 자동으로 0원 저장
  - '있어요' 선택 시 금액 입력 필드 표시
- 직관적이고 사용자 친화적인 입력 방식

### 랜딩 페이지 비디오
- GIF → MP4 변환 (12MB → 4.4MB, 약 63% 용량 절감)
- HTML5 `<video>` 태그 사용 (autoPlay, loop, muted, playsInline)
- 960px 해상도, CRF 20, lanczos + unsharp 필터 적용

---

## Claude의 역할

이 프로젝트에서 Claude는 **프로젝트 전반 개발 도우미** 역할을 합니다.

---

## 응답 방식 및 커뮤니케이션 규칙

1. **한국어로 대화**: 모든 설명과 대화는 한국어로 진행합니다.
2. **코드 설명을 자세히**: 코드를 작성할 때는 어떤 역할을 하는지, 왜 이렇게 작성했는지 함께 설명해 주세요.
3. **교육적 설명 포함**: 개발자가 아닌 사용자도 이해할 수 있도록, 기술 용어는 쉽게 풀어서 설명해 주세요. 가능하면 실생활 예시를 활용해 주세요.
4. **MVP 우선**: 기능은 완벽하지 않아도 되며, 빠르게 동작하는 것을 우선시합니다.

---

## 코딩 스타일

- 순수 **JavaScript**로 작성합니다. (TypeScript 사용 안 함)
- 주석은 **한국어**로 작성해 주세요.
- 별도 컨벤션 규칙 없음, 가독성 좋은 코드를 지향합니다.
- 에러 처리는 기본적인 수준으로 포함해 주세요.

---

## 참고 사항

- 이 프로젝트는 추후 팀의 모바일 앱에 통합될 예정이므로, 확장성을 고려한 구조를 권장합니다.
- 세금 계산 결과는 참고용이며, 실제 세무 신고와 다를 수 있다는 면책 문구를 UI에 포함해야 합니다.
- 증여세법 변경 시 계산 로직을 쉽게 수정할 수 있도록 세금 관련 상수는 별도 파일로 분리해 주세요.

---

## 디자인 시스템

### 톤앤매너
- 따뜻하고 친근한 느낌
- 사용자가 어렵게 느끼는 금융/세금 주제를 부드럽게 전달
- 전문적이면서도 깔끔한 UI (이모지 미사용)

### 컬러 팔레트
- 메인: 코랄/피치 계열 (#FF8C69)
- 배경: 크림 화이트 (#FFFDF9)
- 텍스트: 다크 브라운 (#3D2C2C)
- 강조(절세/긍정): 초록 계열
- 서브: 소프트 민트, 라벤더 등 파스텔
- 토글 선택 상태: 연한 코랄 배경 (#FFF5F3) + 코랄 테두리 (#FF8C69)

### 폰트
- **Pretendard Variable** (기본 폰트)
- CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`

### UI 규칙
- border-radius: 16px 이상 (둥근 모서리)
- 부드러운 그림자 적용
- 금액 표시: 항상 천 단위 콤마 + "만원" 단위로 표시
- 이모지 아이콘 사용하지 않음 (v1.2.0에서 제거)
- 성별 표시: 'M' / 'F' 텍스트 사용

### UX 언어 규칙
- 버튼/라벨은 자연스러운 한국어로 작성
- 딱딱한 용어 지양 (예: "직계비속" → "자녀", "증여 플랜" → "씨드머니 계획")
- 입력 폼에는 항상 플레이스홀더와 안내 문구 포함
- 존칭 사용 ('~님의')
- 토글 버튼(있어요/없어요)으로 사용자 부담 최소화

---

## 프로젝트 파일 구조 (주요 파일)

```
gift_simulator/
├── CLAUDE.md                    # Claude 가이드 (이 파일)
├── prd.md                       # 제품 요구사항 문서
├── client/
│   ├── public/
│   │   ├── index.html           # Pretendard 폰트 CDN 포함
│   │   └── hero-baby.mp4        # 랜딩 배경 비디오 (4.4MB)
│   └── src/
│       ├── App.js               # 메인 앱 (라우팅, 인증, 자녀 선택)
│       ├── App.css              # 전역 스타일 (비디오 배경 포함)
│       ├── index.css            # 폰트 설정
│       ├── components/
│       │   ├── Login.js         # 로그인 페이지
│       │   ├── ChildSetup.js    # 자녀 등록/선택
│       │   ├── StepWizard.js    # 4단계 스텝 위자드 (메인 UI)
│       │   ├── RoadmapForm.js   # 씨드머니 계획 폼
│       │   ├── TaxCalculator.js # 예상 증여세 계산
│       │   └── Simulator.js     # 투자시뮬레이션
│       └── utils/
│           ├── firebase.js      # Firebase 설정
│           └── firestore.js     # Firestore CRUD 함수
└── server/
    └── ...                      # Express API 서버
```