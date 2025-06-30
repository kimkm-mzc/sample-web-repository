#!/bin/bash

# 로그 파일 설정
LOG_FILE="/var/log/codedeploy-install.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Starting dependency installation at $(date)"

# Node.js 18.x 설치 (Amazon Linux 2)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    yum install -y nodejs
fi

# PM2 글로벌 설치 (프로세스 관리용)
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# 애플리케이션 디렉토리 생성
mkdir -p /var/www/html/ai-news-briefing

# 권한 설정
chown -R ec2-user:ec2-user /var/www/html/ai-news-briefing

echo "Dependency installation completed at $(date)"