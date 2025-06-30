module.exports = {
  apps: [{
    name: 'ai-news-briefing',
    script: 'npm',
    args: 'start',
    cwd: '/home/ec2-user/ai-news-briefing',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/ai-news-briefing-error.log',
    out_file: '/var/log/pm2/ai-news-briefing-out.log',
    log_file: '/var/log/pm2/ai-news-briefing-combined.log',
    time: true
  }]
};