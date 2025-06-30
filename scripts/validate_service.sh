#!/bin/bash

# 로그 파일 설정
LOG_FILE="/var/log/codedeploy-validate.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Starting service validation at $(date)"

# 애플리케이션 디렉토리로 이동
cd /var/www/html/ai-news-briefing

# PM2 프로세스 상태 확인
echo "Checking PM2 process status..."
pm2 status

# 애플리케이션이 실행 중인지 확인
if pm2 list | grep -q "ai-news-briefing.*online"; then
    echo "✓ PM2 process is running"
else
    echo "✗ PM2 process is not running"
    exit 1
fi

# 포트 3000에서 서비스가 응답하는지 확인
echo "Checking if service responds on port 3000..."
sleep 10  # 애플리케이션 시작 대기

# Health check
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✓ Service is responding on port 3000"
        echo "Service validation completed successfully at $(date)"
        exit 0
    fi
    echo "Attempt $i: Service not ready yet, waiting..."
    sleep 2
done

echo "✗ Service is not responding after 60 seconds"
echo "PM2 logs:"
pm2 logs ai-news-briefing --lines 20

exit 1