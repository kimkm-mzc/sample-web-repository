'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (topic: string) => void;
  loading: boolean;
}

const popularTopics = [
  '인공지능',
  '암호화폐',
  '기후변화',
  '우주탐사',
  '전기차',
  '메타버스',
  '바이오테크',
  '반도체'
];

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    
    // 입력 검증 및 보안 강화
    if (trimmedTopic) {
      // XSS 방지를 위한 기본적인 HTML 태그 제거
      const sanitizedTopic = trimmedTopic.replace(/<[^>]*>/g, '');
      onSearch(sanitizedTopic);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + K로 검색창 포커스
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const input = e.currentTarget as HTMLInputElement;
      input.focus();
      input.select();
    }
  };

  const handleTopicClick = (selectedTopic: string) => {
    if (!loading) {
      setTopic(selectedTopic);
      onSearch(selectedTopic);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-responsive">
      <form onSubmit={handleSubmit} className="mb-responsive">
        <div className="flex-responsive">
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              // 실시간 입력 검증 및 보안 강화
              const value = e.target.value;
              // 특수 문자 및 스크립트 태그 필터링
              const sanitizedValue = value.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]*>/g, '');
              setTopic(sanitizedValue);
            }}
            placeholder="관심 있는 주제를 입력하세요... (예: 인공지능, 암호화폐)"
            className="search-input flex-1 min-w-0"
            disabled={loading}
            maxLength={100}
            autoComplete="off"
            spellCheck="false"
            pattern="[^<>]*"
            title="HTML 태그는 사용할 수 없습니다"
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap sm:min-w-[120px]"
          >
            뉴스 검색
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-3 sm:mb-4">인기 주제</h3>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {popularTopics.map((popularTopic) => (
            <button
              key={popularTopic}
              onClick={() => handleTopicClick(popularTopic)}
              disabled={loading}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] flex items-center justify-center"
            >
              {popularTopic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}