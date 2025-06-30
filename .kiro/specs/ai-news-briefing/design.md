# Design Document

## Overview

AI 뉴스 브리핑 웹사이트는 Next.js 14 App Router를 기반으로 한 풀스택 웹 애플리케이션입니다. 사용자가 주제를 입력하면 NewsAPI를 통해 관련 뉴스를 가져오고, OpenAI GPT-4o-mini 모델을 사용하여 선택적으로 뉴스를 요약하는 기능을 제공합니다. 반응형 디자인과 AWS 기반 CI/CD 파이프라인을 통한 자동 배포를 지원합니다.

## Architecture

### 전체 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  External APIs  │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│  NewsAPI        │
│                 │    │                 │    │  OpenAI API     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   Environment   │
│   (Tailwind)    │    │   Variables     │
└─────────────────┘    └─────────────────┘
```

### 배포 아키텍처

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───►│  CodeBuild  │───►│ CodeDeploy  │───►│    EC2      │
│ Repository  │    │   (Build)   │    │  (Deploy)   │    │  Instance   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Components and Interfaces

### 프론트엔드 컴포넌트 구조

```
app/
├── layout.tsx (루트 레이아웃)
├── page.tsx (메인 페이지)
├── globals.css (글로벌 스타일)
└── components/
    ├── SearchForm.tsx (검색 폼)
    ├── NewsCard.tsx (뉴스 카드)
    └── LoadingSpinner.tsx (로딩 스피너)
```

### API 엔드포인트 구조

```
app/api/
├── news/
│   └── route.ts (뉴스 검색 API)
└── summarize/
    └── route.ts (AI 요약 API)
```

### 주요 인터페이스

#### NewsItem Interface
```typescript
interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  publishedAt: string;
  url?: string;
  summary?: string;
}
```

#### API Request/Response Types
```typescript
// 뉴스 검색 요청
interface NewsSearchRequest {
  topic: string;
}

// 뉴스 검색 응답
interface NewsSearchResponse {
  news: NewsItem[];
  success: boolean;
  error?: string;
}

// AI 요약 요청
interface SummarizeRequest {
  title: string;
  description: string;
  content?: string;
}

// AI 요약 응답
interface SummarizeResponse {
  summary: string;
  success: boolean;
  error?: string;
}
```

## Data Models

### 뉴스 데이터 모델

뉴스 데이터는 NewsAPI 또는 샘플 데이터에서 가져와 표준화된 NewsItem 형태로 변환됩니다.

**NewsAPI 응답 매핑:**
- `title` → `title`
- `description` → `description`
- `content` → `content`
- `source.name` → `source`
- `publishedAt` → `publishedAt`
- `url` → `url`
- 고유 ID 생성 → `id`

**샘플 데이터 구조:**
주제별로 미리 정의된 샘플 뉴스 데이터를 제공하며, 실제 NewsAPI와 동일한 구조를 유지합니다.

### 상태 관리

React의 useState를 사용하여 다음 상태들을 관리합니다:

- `news: NewsItem[]` - 검색된 뉴스 목록
- `loading: boolean` - 뉴스 검색 로딩 상태
- `searchTopic: string` - 현재 검색 주제
- `summarizingIds: Set<string>` - AI 요약 진행 중인 뉴스 ID 목록

## Error Handling

### API 에러 처리

1. **NewsAPI 에러:**
   - API 키 없음: 샘플 데이터로 폴백
   - 네트워크 에러: 사용자에게 에러 메시지 표시
   - 할당량 초과: 적절한 안내 메시지

2. **OpenAI API 에러:**
   - 429 에러 (할당량 초과): "할당량 초과" 메시지
   - 네트워크 에러: "요약 실패" 메시지
   - API 키 없음: "API 키 설정 필요" 메시지

### 프론트엔드 에러 처리

- try-catch 블록을 사용한 API 호출 에러 처리
- 사용자 친화적인 에러 메시지 표시
- 로딩 상태 적절한 관리

## Testing Strategy

### 단위 테스트
- 컴포넌트별 렌더링 테스트
- API 핸들러 로직 테스트
- 유틸리티 함수 테스트

### 통합 테스트
- API 엔드포인트 통합 테스트
- 외부 API 모킹 테스트

### E2E 테스트
- 사용자 플로우 테스트 (검색 → 요약)
- 반응형 디자인 테스트

## 성능 최적화

### Next.js 최적화
- App Router 사용으로 서버 컴포넌트 활용
- 이미지 최적화 (next/image)
- 폰트 최적화 (next/font)

### 클라이언트 최적화
- 컴포넌트 메모이제이션 (React.memo)
- 불필요한 리렌더링 방지
- 로딩 상태 최적화

## 보안 고려사항

### API 키 보안
- 환경 변수를 통한 API 키 관리
- 클라이언트 사이드에서 API 키 노출 방지

### 입력 검증
- 사용자 입력 검증 및 새니타이제이션
- XSS 공격 방지

## 배포 설정

### BuildSpec 구성
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - npm install
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - echo Build completed
artifacts:
  files:
    - '**/*'
```

### AppSpec 구성
```yaml
version: 0.0
os: linux
files:
  - source: /
    destination: /var/www/html
hooks:
  BeforeInstall:
    - location: scripts/install_dependencies.sh
  ApplicationStart:
    - location: scripts/start_server.sh
  ApplicationStop:
    - location: scripts/stop_server.sh
```

## 환경 설정

### 필수 환경 변수
- `OPENAI_API_KEY`: OpenAI API 키
- `NEWS_API_KEY`: NewsAPI 키 (선택사항)
- `NODE_ENV`: 실행 환경 (development/production)

### 개발 환경 설정
- Node.js 18+ 필요
- npm 또는 yarn 패키지 매니저
- TypeScript 컴파일러 설정