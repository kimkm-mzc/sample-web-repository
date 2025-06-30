'use client';

import { NewsItem } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface NewsCardProps {
  news: NewsItem;
  onSummarize: (id: string) => void;
  isLoading: boolean;
}

// 날짜 포맷팅 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return '1일 전';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export default function NewsCard({ news, onSummarize, isLoading }: NewsCardProps) {
  return (
    <article className="news-card">
      {/* 제목과 출처 */}
      <header className="flex flex-col xs:flex-row xs:justify-between xs:items-start mb-4 gap-2">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex-1 leading-tight min-w-0">
          {news.title}
        </h2>
        <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap self-start xs:self-auto shrink-0">
          {news.source}
        </span>
      </header>

      {/* 설명 */}
      <p className="text-gray-700 mb-4 text-sm sm:text-base lg:text-lg line-clamp-3 leading-relaxed">
        {news.description}
      </p>

      {/* AI 요약 영역 */}
      {!news.summary && !isLoading && (
        <button
          onClick={() => onSummarize(news.id)}
          className="mb-4 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 text-primary-700 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium w-full xs:w-auto touch-manipulation min-h-[44px] flex items-center justify-center"
        >
          🤖 AI 요약하기
        </button>
      )}

      {isLoading && (
        <div className="mb-4 flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <LoadingSpinner />
          <span className="text-gray-600 text-xs sm:text-sm">AI 요약 중...</span>
        </div>
      )}

      {news.summary && (
        <div className="mb-4 p-3 sm:p-4 lg:p-5 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-blue-800 mb-2">🤖 AI 요약</h3>
          <p className="text-blue-700 text-xs sm:text-sm lg:text-base leading-relaxed">
            {news.summary}
          </p>
        </div>
      )}

      {/* 하단 정보 */}
      <footer className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 text-xs sm:text-sm text-gray-500 pt-2 border-t border-gray-100">
        <time dateTime={news.publishedAt}>{formatDate(news.publishedAt)}</time>
        {news.url && (
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 active:text-primary-800 font-medium self-start xs:self-auto transition-colors duration-200 touch-manipulation"
          >
            원문 보기 →
          </a>
        )}
      </footer>
    </article>
  );
}