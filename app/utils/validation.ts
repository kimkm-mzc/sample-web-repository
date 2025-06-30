// 입력 검증 및 보안 유틸리티 함수들

/**
 * XSS 공격 방지를 위한 위험한 패턴들
 */
export const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi
];

/**
 * SQL 인젝션 방지를 위한 패턴들
 */
export const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
  /(--|\/\*|\*\/|;)/g,
  /(\bOR\b|\bAND\b).*?(\b=\b|\b<\b|\b>\b)/gi
];

/**
 * 텍스트에서 위험한 패턴을 검사합니다
 * @param text 검사할 텍스트
 * @returns 위험한 패턴이 발견되면 true
 */
export function containsDangerousPatterns(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(text)) ||
         SQL_INJECTION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * HTML 태그를 제거하고 안전한 텍스트로 변환합니다
 * @param text 정리할 텍스트
 * @returns 정리된 텍스트
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/&lt;/g, '<')   // HTML 엔티티 디코딩
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * 검색어 유효성을 검사합니다
 * @param topic 검색어
 * @returns 검증 결과 객체
 */
export function validateSearchTopic(topic: unknown): {
  isValid: boolean;
  error?: string;
  sanitizedTopic?: string;
} {
  // 타입 검증
  if (!topic || typeof topic !== 'string') {
    return { isValid: false, error: '검색어를 입력해주세요.' };
  }

  const trimmedTopic = topic.trim();

  // 길이 검증
  if (trimmedTopic.length === 0) {
    return { isValid: false, error: '검색어를 입력해주세요.' };
  }

  if (trimmedTopic.length < 2) {
    return { isValid: false, error: '검색어는 2글자 이상 입력해주세요.' };
  }

  if (trimmedTopic.length > 100) {
    return { isValid: false, error: '검색어는 100글자 이하로 입력해주세요.' };
  }

  // 보안 검증
  if (containsDangerousPatterns(trimmedTopic)) {
    return { isValid: false, error: '안전하지 않은 문자가 포함되어 있습니다.' };
  }

  // 텍스트 정리
  const sanitizedTopic = sanitizeText(trimmedTopic);

  if (sanitizedTopic.length === 0) {
    return { isValid: false, error: '유효한 검색어를 입력해주세요.' };
  }

  return { isValid: true, sanitizedTopic };
}

/**
 * 요약 요청 데이터의 유효성을 검사합니다
 * @param data 요약 요청 데이터
 * @returns 검증 결과 객체
 */
export function validateSummarizeData(data: {
  title?: unknown;
  description?: unknown;
  content?: unknown;
}): {
  isValid: boolean;
  error?: string;
  sanitizedData?: {
    title: string;
    description: string;
    content?: string;
  };
} {
  const { title, description, content } = data;

  // 필수 필드 검증
  if (!title || typeof title !== 'string' || !description || typeof description !== 'string') {
    return { isValid: false, error: '제목과 설명이 필요합니다.' };
  }

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  // 길이 검증
  if (trimmedTitle.length === 0 || trimmedDescription.length === 0) {
    return { isValid: false, error: '제목과 설명을 입력해주세요.' };
  }

  if (trimmedTitle.length > 500) {
    return { isValid: false, error: '제목이 너무 깁니다.' };
  }

  if (trimmedDescription.length > 2000) {
    return { isValid: false, error: '설명이 너무 깁니다.' };
  }

  // 내용 검증 (선택사항)
  const trimmedContent = content && typeof content === 'string' ? content.trim() : '';
  if (trimmedContent.length > 5000) {
    return { isValid: false, error: '요약할 내용이 너무 깁니다.' };
  }

  // 보안 검증
  const textToCheck = `${trimmedTitle} ${trimmedDescription} ${trimmedContent}`;
  if (containsDangerousPatterns(textToCheck)) {
    return { isValid: false, error: '안전하지 않은 내용이 포함되어 있습니다.' };
  }

  // 텍스트 정리
  const sanitizedData = {
    title: sanitizeText(trimmedTitle),
    description: sanitizeText(trimmedDescription),
    content: trimmedContent ? sanitizeText(trimmedContent) : undefined
  };

  return { isValid: true, sanitizedData };
}

/**
 * 에러 메시지를 사용자 친화적으로 변환합니다
 * @param error 원본 에러
 * @param context 에러 발생 컨텍스트
 * @returns 사용자 친화적인 에러 메시지
 */
export function getUserFriendlyErrorMessage(error: any, context: 'search' | 'summarize'): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  // 네트워크 에러
  if (error.code === 'ECONNABORTED') {
    return '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return '서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }

  // HTTP 상태 코드별 처리
  const status = error.response?.status;
  
  if (status === 400) {
    return '요청 형식이 올바르지 않습니다.';
  }
  
  if (status === 401) {
    return context === 'search' 
      ? 'API 인증에 실패했습니다.' 
      : 'AI 서비스 인증에 실패했습니다.';
  }
  
  if (status === 403) {
    return 'API 접근이 거부되었습니다.';
  }
  
  if (status === 429) {
    return 'API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (status === 503) {
    return context === 'search' 
      ? '뉴스 서비스가 일시적으로 사용할 수 없습니다.' 
      : 'AI 서비스가 일시적으로 사용할 수 없습니다.';
  }
  
  if (status >= 500) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 기본 에러 메시지
  return context === 'search' 
    ? '뉴스를 가져오는 중 오류가 발생했습니다.' 
    : '요약 생성 중 오류가 발생했습니다.';
}