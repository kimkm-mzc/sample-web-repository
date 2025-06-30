#!/bin/bash

# 로그 파일 설정
LOG_FILE="/var/log/codedeploy-stop.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Stopping server at $(date)"

# PM2로 실행 중인 애플리케이션 중지
if command -v pm2 &> /dev/null; then
    echo "Stopping PM2 processes..."
    pm2 stop ai-news-briefing 2>/dev/null || true
    pm2 delete ai-news-briefing 2>/dev/null || true
fi

# 포트 3000에서 실행 중인 프로세스 종료
echo "Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "Server stopped successfully at $(date)"