#!/bin/bash

# 로그 파일 설정
LOG_FILE="/var/log/codedeploy-start.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Starting server at $(date)"

# 애플리케이션 디렉토리로 이동
cd /var/www/html/ai-news-briefing

# 환경 변수 파일 설정
echo "Setting up environment variables..."
if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "Please update .env.local with your actual API keys"
fi

# 프로덕션 환경 변수 설정 (CodeDeploy 환경에서)
if [ -f .env.prd ]; then
    echo "Using production environment variables..."
    cp .env.prd .env.local
fi

# 파일 권한 확인
echo "Checking file permissions..."
ls -la
chown -R ec2-user:ec2-user /var/www/html/ai-news-briefing

# Node.js 애플리케이션 의존성 확인
echo "Verifying dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing production dependencies..."
    npm ci --omit=dev
fi

# Next.js 빌드 확인
if [ ! -d ".next" ]; then
    echo "ERROR: .next directory not found. Build may have failed."
    exit 1
fi

echo "Application structure:"
ls -la .next/

# PM2 로그 디렉토리 생성
mkdir -p /var/log/pm2
chown -R ec2-user:ec2-user /var/log/pm2

# 기존 프로세스 정리
echo "Cleaning up existing processes..."
pm2 stop ai-news-briefing 2>/dev/null || true
pm2 delete ai-news-briefing 2>/dev/null || true

# 포트 확인 및 정리
echo "Checking port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# PM2로 애플리케이션 시작
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# PM2 설정 저장
pm2 save

# 시스템 부팅 시 자동 시작 설정
pm2 startup systemd -u ec2-user --hp /home/ec2-user

# 애플리케이션 상태 확인
sleep 5
pm2 status
pm2 logs ai-news-briefing --lines 10

echo "Server started successfully at $(date)"
echo "Application should be available at http://localhost:3000"