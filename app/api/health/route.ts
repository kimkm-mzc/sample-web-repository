import { NextResponse } from 'next/server';

export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-news-briefing',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apis: {
      newsApi: !!process.env.NEWS_API_KEY,
      openaiApi: !!process.env.OPENAI_API_KEY,
    },
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    }
  };

  return NextResponse.json(healthStatus);
}