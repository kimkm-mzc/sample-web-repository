// 뉴스 아이템 인터페이스
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  publishedAt: string;
  url?: string;
  summary?: string;
}

// 뉴스 검색 요청
export interface NewsSearchRequest {
  topic: string;
}

// 뉴스 검색 응답
export interface NewsSearchResponse {
  news: NewsItem[];
  success: boolean;
  error?: string;
}

// AI 요약 요청
export interface SummarizeRequest {
  title: string;
  description: string;
  content?: string;
}

// AI 요약 응답
export interface SummarizeResponse {
  summary: string;
  success: boolean;
  error?: string;
}

// NewsAPI 응답 타입
export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}