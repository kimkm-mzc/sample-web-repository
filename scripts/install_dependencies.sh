#!/bin/bash

# 로그 파일 설정
LOG_FILE="/var/log/codedeploy-install.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Starting dependency installation at $(date)"

# 시스템 업데이트
echo "Updating system packages..."
yum update -y

# Node.js 20.x 설치 (buildspec과 동일한 버전)
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | cut -d'v' -f2) -lt 20 ]]; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
fi

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# PM2 글로벌 설치 (프로세스 관리용)
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2@latest
fi

echo "PM2 version: $(pm2 -v)"

# 애플리케이션 디렉토리 생성
echo "Creating application directory..."
mkdir -p /var/www/html/ai-news-briefing
mkdir -p /var/log/pm2

# 권한 설정
echo "Setting permissions..."
chown -R ec2-user:ec2-user /var/www/html/ai-news-briefing
chown -R ec2-user:ec2-user /var/log/pm2

# 기존 애플리케이션 정리
echo "Cleaning up existing application..."
pm2 stop ai-news-briefing 2>/dev/null || true
pm2 delete ai-news-briefing 2>/dev/null || true

echo "Dependency installation completed at $(date)"