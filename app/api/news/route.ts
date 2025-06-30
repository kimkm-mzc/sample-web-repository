import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { NewsItem, NewsAPIResponse, NewsSearchResponse } from '@/types';
import { validateSearchTopic } from '@/app/utils/validation';

// 샘플 뉴스 생성 함수
function generateSampleNews(topic: string): NewsItem[] {
  const sampleNewsData: Record<string, NewsItem[]> = {
    '인공지능': [
      {
        id: '1',
        title: 'ChatGPT-4의 새로운 업데이트로 더욱 정확한 답변 제공',
        description: 'OpenAI가 ChatGPT-4의 최신 업데이트를 발표하며, 더욱 정확하고 맥락을 이해하는 AI 모델을 선보였습니다.',
        source: 'AI 뉴스',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/ai-news-1'
      },
      {
        id: '2',
        title: '구글, 새로운 AI 칩 TPU v5 공개',
        description: '구글이 머신러닝 워크로드를 위한 새로운 텐서 프로세싱 유닛 TPU v5를 공개했습니다.',
        source: '테크 리뷰',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/ai-news-2'
      }
    ],
    '암호화폐': [
      {
        id: '3',
        title: '비트코인, 새로운 최고가 경신 전망',
        description: '전문가들은 비트코인이 올해 말까지 새로운 최고가를 경신할 것으로 전망한다고 발표했습니다.',
        source: '크립토 뉴스',
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/crypto-news-1'
      }
    ],
    '기후변화': [
      {
        id: '4',
        title: '2024년 전 세계 평균 기온 역대 최고 기록',
        description: '세계기상기구(WMO)가 2024년이 관측 사상 가장 더운 해가 될 것이라고 발표했습니다.',
        source: '환경 뉴스',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/climate-news-1'
      }
    ]
  };

  // 기본 샘플 뉴스 (주제가 없는 경우)
  const defaultNews: NewsItem[] = [
    {
      id: 'default-1',
      title: `"${topic}" 관련 최신 뉴스 업데이트`,
      description: `${topic}에 대한 최신 동향과 관련 소식을 전해드립니다. 더 자세한 정보는 원문을 확인해주세요.`,
      source: '종합 뉴스',
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      url: 'https://example.com/news-1'
    },
    {
      id: 'default-2',
      title: `${topic} 분야의 새로운 발전`,
      description: `${topic} 분야에서 주목할 만한 새로운 발전과 혁신이 이루어지고 있습니다.`,
      source: '산업 뉴스',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      url: 'https://example.com/news-2'
    }
  ];

  return sampleNewsData[topic] || defaultNews;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    // 입력 검증 및 보안 (유틸리티 함수 사용)
    const validation = validateSearchTopic(topic);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const trimmedTopic = validation.sanitizedTopic!;

    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    let news: NewsItem[] = [];

    if (NEWS_API_KEY) {
      try {
        // NewsAPI 호출
        const response = await axios.get<NewsAPIResponse>(
          'https://newsapi.org/v2/everything',
          {
            params: {
              q: trimmedTopic,
              language: 'ko',
              sortBy: 'publishedAt',
              pageSize: 10,
              apiKey: NEWS_API_KEY,
            },
            timeout: 8000, // 8초 타임아웃
          }
        );

        // NewsAPI 응답을 NewsItem 형태로 변환
        news = response.data.articles.slice(0, 8).map((article, index) => ({
          id: `news-${Date.now()}-${index}`,
          title: article.title,
          description: article.description || '',
          content: article.content || undefined,
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
          summary: undefined,
        }));
      } catch (apiError: any) {
        console.error('NewsAPI 호출 실패:', apiError);
        
        // 상세한 에러 처리
        if (apiError.response?.status === 429) {
          return NextResponse.json(
            { success: false, error: 'NewsAPI 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.' },
            { status: 429 }
          );
        } else if (apiError.response?.status === 401) {
          console.error('NewsAPI 인증 실패 - 샘플 데이터 사용');
        } else if (apiError.response?.status === 400) {
          console.error('NewsAPI 잘못된 요청 - 샘플 데이터 사용');
        } else if (apiError.response?.status >= 500) {
          console.error('NewsAPI 서버 오류 - 샘플 데이터 사용');
        } else if (apiError.code === 'ECONNABORTED') {
          console.error('NewsAPI 요청 시간 초과 - 샘플 데이터 사용');
        } else if (apiError.code === 'ENOTFOUND' || apiError.code === 'ECONNREFUSED') {
          console.error('NewsAPI 연결 실패 - 샘플 데이터 사용');
        }
        
        // API 호출 실패 시 샘플 데이터 사용
        news = generateSampleNews(trimmedTopic);
      }
    } else {
      // API 키가 없으면 샘플 데이터 사용
      news = generateSampleNews(trimmedTopic);
    }

    const response: NewsSearchResponse = {
      success: true,
      news: news.slice(0, 8), // 최대 8개로 제한
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('뉴스 검색 에러:', error);
    return NextResponse.json(
      { success: false, error: '뉴스를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}