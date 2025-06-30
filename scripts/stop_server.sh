#!/bin/bash

# 로그 파일 설정
LOG_FILE="/var/log/codedeploy-stop.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Stopping server at $(date)"

# PM2 프로세스 상태 확인
if command -v pm2 &> /dev/null; then
    echo "Current PM2 processes:"
    pm2 list
    
    echo "Stopping PM2 processes..."
    pm2 stop ai-news-briefing 2>/dev/null || true
    pm2 delete ai-news-briefing 2>/dev/null || true
    
    echo "PM2 processes after cleanup:"
    pm2 list
fi

# 포트 3000에서 실행 중인 프로세스 확인 및 종료
echo "Checking processes on port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Found processes on port 3000, terminating..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # 재확인
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo "WARNING: Some processes on port 3000 may still be running"
        lsof -i:3000
    else
        echo "Port 3000 is now free"
    fi
else
    echo "No processes found on port 3000"
fi

# Next.js 관련 프로세스 정리
echo "Cleaning up any remaining Node.js processes..."
pkill -f "next" 2>/dev/null || true
pkill -f "ai-news-briefing" 2>/dev/null || true

echo "Server stopped successfully at $(date)"