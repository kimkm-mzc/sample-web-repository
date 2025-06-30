#!/bin/bash

# 로그 파일 설정
LOG_FILE="/var/log/codedeploy-start.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Starting server at $(date)"

# 애플리케이션 디렉토리로 이동
cd /var/www/html/ai-news-briefing

# 환경 변수 파일이 있는지 확인
if [ ! -f .env.local ]; then
    echo "Warning: .env.local file not found. Creating from .env.example..."
    cp .env.example .env.local
fi

# 의존성이 이미 빌드 단계에서 설치되었으므로 스킵
echo "Dependencies already installed during build phase"

# PM2 로그 디렉토리 생성
mkdir -p /var/log/pm2
chown -R ec2-user:ec2-user /var/log/pm2

# PM2로 애플리케이션 시작
echo "Starting application with PM2..."
pm2 delete ai-news-briefing 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Server started successfully at $(date)"