# AI 뉴스 브리핑

AI가 요약해주는 최신 뉴스 브리핑 서비스입니다. 관심 있는 주제를 입력하면 최신 뉴스를 검색하고, OpenAI GPT-4o-mini를 사용하여 뉴스를 간결하게 요약해드립니다.

## 🚀 주요 기능

- **뉴스 검색**: 관심 있는 주제로 최신 뉴스 검색
- **인기 주제**: 원클릭으로 인기 주제 뉴스 확인 (인공지능, 암호화폐, 기후변화 등)
- **AI 요약**: OpenAI GPT-4o-mini를 활용한 뉴스 요약
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **실시간 데이터**: NewsAPI를 통한 실시간 뉴스 데이터

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **API**: NewsAPI, OpenAI API
- **Deployment**: AWS CodeBuild, CodeDeploy, EC2
- **Process Management**: PM2
- **Containerization**: Docker

## 📋 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- OpenAI API 키 (선택사항)
- NewsAPI 키 (선택사항)

## 🔧 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd ai-news-briefing
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 API 키를 설정하세요:

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 API 키를 입력하세요:

```env
# OpenAI API 키 (AI 요약 기능용)
OPENAI_API_KEY=your_openai_api_key_here

# NewsAPI 키 (실제 뉴스 데이터용, 선택사항)
NEWS_API_KEY=your_news_api_key_here
```

**참고**: API 키가 없어도 애플리케이션은 정상 작동합니다. 샘플 데이터를 사용합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 🔑 API 키 설정 가이드

### OpenAI API 키 발급

1. [OpenAI 플랫폼](https://platform.openai.com/)에 가입
2. API Keys 섹션에서 새 API 키 생성
3. `.env.local` 파일의 `OPENAI_API_KEY`에 입력

### NewsAPI 키 발급

1. [NewsAPI](https://newsapi.org/)에 가입
2. 무료 플랜으로 API 키 발급
3. `.env.local` 파일의 `NEWS_API_KEY`에 입력

## 🐳 Docker 실행

### Docker Compose 사용

```bash
# 환경 변수 설정
cp .env.example .env.local

# 컨테이너 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build
```

### Docker 단독 사용

```bash
# 이미지 빌드
docker build -t ai-news-briefing .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local ai-news-briefing
```

## 📁 프로젝트 구조

```
ai-news-briefing/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── health/        # 헬스체크 엔드포인트
│   │   ├── news/          # 뉴스 검색 API
│   │   └── summarize/     # AI 요약 API
│   ├── components/        # React 컴포넌트
│   │   ├── LoadingSpinner.tsx
│   │   ├── NewsCard.tsx
│   │   └── SearchForm.tsx
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── scripts/               # 배포 스크립트
├── types/                 # TypeScript 타입 정의
├── .env.example           # 환경 변수 예시
├── buildspec.yml          # AWS CodeBuild 설정
├── appspec.yml            # AWS CodeDeploy 설정
├── ecosystem.config.js    # PM2 설정
├── docker-compose.yaml    # Docker Compose 설정
└── Dockerfile             # Docker 이미지 설정
```

## 🚀 AWS 배포

이 프로젝트는 AWS CodeBuild와 CodeDeploy를 통한 자동 배포를 지원합니다.

### 배포 프로세스

1. **CodeBuild**: `buildspec.yml`을 사용하여 애플리케이션 빌드
2. **CodeDeploy**: `appspec.yml`을 사용하여 EC2 인스턴스에 배포
3. **PM2**: 프로덕션 환경에서 프로세스 관리

### 배포 설정

1. AWS CodeBuild 프로젝트 생성
2. AWS CodeDeploy 애플리케이션 및 배포 그룹 설정
3. EC2 인스턴스에 CodeDeploy 에이전트 설치
4. 환경 변수를 EC2 인스턴스의 `.env.local` 파일에 설정

## 🎯 사용 방법

1. **주제 검색**: 검색창에 관심 있는 주제를 입력하고 검색
2. **인기 주제**: 미리 설정된 인기 주제 버튼 클릭
3. **AI 요약**: 뉴스 카드의 "🤖 AI 요약하기" 버튼 클릭
4. **원문 보기**: 뉴스 카드의 "원문 보기" 링크로 전체 기사 확인

## 🔧 개발 가이드

### 스크립트 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

### 환경별 설정

- **개발 환경**: `.env.local` 사용
- **프로덕션 환경**: 환경 변수 또는 `.env.local` 사용

## 🐛 문제 해결

### 일반적인 문제

1. **API 키 오류**: `.env.local` 파일의 API 키 확인
2. **포트 충돌**: 3000번 포트가 사용 중인지 확인
3. **빌드 오류**: `node_modules` 삭제 후 재설치

### 로그 확인

```bash
# PM2 로그 확인 (프로덕션)
pm2 logs ai-news-briefing

# Docker 로그 확인
docker-compose logs -f
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성해 주세요.