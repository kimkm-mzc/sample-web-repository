'use client';

import { useState } from 'react';
import axios from 'axios';
import { NewsItem, NewsSearchResponse, SummarizeResponse } from '@/types';
import SearchForm from './components/SearchForm';
import NewsCard from './components/NewsCard';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import { validateSearchTopic, getUserFriendlyErrorMessage } from './utils/validation';

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTopic, setSearchTopic] = useState('');
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const { toasts, removeToast, clearAllToasts, showSuccess, showError, showWarning, showInfo } = useToast();

  // 뉴스 검색 함수 (재시도 로직 포함)
  const handleSearch = async (topic: string, isRetry: boolean = false) => {
    // 입력 검증 (유틸리티 함수 사용)
    const validation = validateSearchTopic(topic);
    if (!validation.isValid) {
      showWarning(validation.error!);
      return;
    }

    const trimmedTopic = validation.sanitizedTopic!;

    // 이전 토스트 메시지 정리 (새 검색 시)
    if (!isRetry) {
      clearAllToasts();
      setRetryCount(prev => ({ ...prev, search: 0 }));
    }

    setLoading(true);
    setSearchTopic(trimmedTopic);
    
    try {
      const response = await axios.post<NewsSearchResponse>('/api/news', {
        topic: trimmedTopic,
      }, {
        timeout: 12000, // 12초 타임아웃 (약간 증가)
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setNews(response.data.news);
        setRetryCount(prev => ({ ...prev, search: 0 })); // 성공 시 재시도 카운트 리셋
        
        if (response.data.news.length > 0) {
          showSuccess(`"${trimmedTopic}" 관련 뉴스 ${response.data.news.length}개를 찾았습니다.`);
        } else {
          showInfo(`"${trimmedTopic}"에 대한 뉴스를 찾을 수 없습니다. 다른 키워드로 검색해보세요.`);
        }
      } else {
        console.error('뉴스 검색 실패:', response.data.error);
        showError(response.data.error || '뉴스를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('뉴스 검색 에러:', error);
      
      const currentRetryCount = retryCount.search || 0;
      const canRetry = currentRetryCount < 2 && !isRetry;
      
      // 사용자 친화적인 에러 메시지 생성
      const baseErrorMessage = getUserFriendlyErrorMessage(error, 'search');
      
      // 재시도 가능한 에러인지 확인
      const retryableErrors = ['ECONNABORTED', 'ENOTFOUND', 'ECONNREFUSED'];
      const retryableStatuses = [503, 500, 502, 504];
      const isRetryable = retryableErrors.includes(error.code) || 
                         retryableStatuses.includes(error.response?.status) ||
                         !navigator.onLine;
      
      const shouldShowRetry = canRetry && isRetryable;
      
      if (shouldShowRetry) {
        showError(`${baseErrorMessage} 자동으로 다시 시도합니다... (${currentRetryCount + 1}/3)`);
        setRetryCount(prev => ({ ...prev, search: currentRetryCount + 1 }));
        
        // 3초 후 자동 재시도
        setTimeout(() => {
          handleSearch(trimmedTopic, true);
        }, 3000);
      } else {
        showError(baseErrorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // AI 요약 함수 (재시도 로직 포함)
  const handleSummarize = async (newsId: string, isRetry: boolean = false) => {
    const newsItem = news.find(item => item.id === newsId);
    if (!newsItem) {
      showError('뉴스 정보를 찾을 수 없습니다.');
      return;
    }

    // 이미 요약이 있는 경우
    if (newsItem.summary) {
      showInfo('이미 요약이 완료된 뉴스입니다.');
      return;
    }

    // 이미 요약 중인 경우
    if (summarizingIds.has(newsId)) {
      showWarning('이미 요약을 진행 중입니다.');
      return;
    }

    // 입력 데이터 검증
    if (!newsItem.title?.trim() || !newsItem.description?.trim()) {
      showError('요약할 수 있는 충분한 내용이 없습니다.');
      return;
    }

    // 요약 중인 뉴스 ID 추가
    setSummarizingIds(prev => new Set(Array.from(prev).concat(newsId)));

    if (!isRetry) {
      setRetryCount(prev => ({ ...prev, [newsId]: 0 }));
    }

    try {
      const response = await axios.post<SummarizeResponse>('/api/summarize', {
        title: newsItem.title,
        description: newsItem.description,
        content: newsItem.content,
      }, {
        timeout: 35000, // 35초 타임아웃 (AI 요약은 시간이 더 걸릴 수 있음)
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        // 뉴스 목록에서 해당 뉴스의 요약 업데이트
        setNews(prevNews =>
          prevNews.map(item =>
            item.id === newsId
              ? { ...item, summary: response.data.summary }
              : item
          )
        );
        setRetryCount(prev => ({ ...prev, [newsId]: 0 })); // 성공 시 재시도 카운트 리셋
        showSuccess('AI 요약이 완료되었습니다!');
      } else {
        console.error('요약 실패:', response.data.error);
        showError(response.data.error || '요약 생성 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('요약 에러:', error);
      
      const currentRetryCount = retryCount[newsId] || 0;
      const canRetry = currentRetryCount < 2 && !isRetry;
      
      // 사용자 친화적인 에러 메시지 생성
      const baseErrorMessage = getUserFriendlyErrorMessage(error, 'summarize');
      
      // 재시도 가능한 에러인지 확인
      const retryableErrors = ['ECONNABORTED', 'ENOTFOUND', 'ECONNREFUSED'];
      const retryableStatuses = [503, 500, 502, 504];
      const isRetryable = retryableErrors.includes(error.code) || 
                         retryableStatuses.includes(error.response?.status) ||
                         !navigator.onLine;
      
      const shouldShowRetry = canRetry && isRetryable;
      
      if (shouldShowRetry) {
        showError(`${baseErrorMessage} 자동으로 다시 시도합니다... (${currentRetryCount + 1}/3)`);
        setRetryCount(prev => ({ ...prev, [newsId]: currentRetryCount + 1 }));
        
        // 5초 후 자동 재시도 (AI 요약은 더 긴 대기 시간)
        setTimeout(() => {
          handleSummarize(newsId, true);
        }, 5000);
      } else {
        showError(baseErrorMessage);
      }
    } finally {
      // 요약 중인 뉴스 ID 제거
      setSummarizingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    }
  };

  return (
    <>
      {/* Toast 알림 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="container mx-auto container-responsive py-6 sm:py-8 lg:py-12 max-w-4xl min-h-screen">
      {/* 헤더 */}
      <header className="text-center mb-responsive">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
          🤖 AI 뉴스 브리핑
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-2 max-w-2xl mx-auto leading-relaxed">
          관심 있는 주제의 최신 뉴스를 검색하고 AI가 요약해드립니다
        </p>
      </header>

      {/* 검색 폼 */}
      <section className="mb-responsive">
        <SearchForm onSearch={handleSearch} loading={loading} />
      </section>

      {/* 로딩 상태 */}
      {loading && (
        <section className="text-center py-8 sm:py-12 lg:py-16">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 text-sm sm:text-base lg:text-lg px-4 max-w-md mx-auto">
            "{searchTopic}" 관련 뉴스를 검색하고 있습니다...
          </p>
        </section>
      )}

      {/* 뉴스 결과 */}
      {!loading && news.length > 0 && (
        <main>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 px-2">
            "{searchTopic}" 검색 결과 ({news.length}개)
          </h2>
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {news.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                onSummarize={handleSummarize}
                isLoading={summarizingIds.has(newsItem.id)}
              />
            ))}
          </div>
        </main>
      )}

      {/* 검색 결과 없음 */}
      {!loading && searchTopic && news.length === 0 && (
        <section className="text-center py-8 sm:py-12 lg:py-16">
          <div className="max-w-md mx-auto px-4">
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 opacity-50">📰</div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              "{searchTopic}"에 대한 뉴스를 찾을 수 없습니다.
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              다른 키워드로 검색해보세요.
            </p>
          </div>
        </section>
      )}

      {/* 초기 상태 */}
      {!loading && !searchTopic && (
        <section className="text-center py-8 sm:py-12 lg:py-16">
          <div className="max-w-md mx-auto px-4">
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 opacity-50">🔍</div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              관심 있는 주제를 검색해보세요!
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              인기 주제 버튼을 클릭하거나 직접 입력해보세요.
            </p>
          </div>
        </section>
      )}
      </div>
    </>
  );
}