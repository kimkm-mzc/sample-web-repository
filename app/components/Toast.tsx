'use client';

import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 완료 후 제거
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 transform";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      case 'info':
        return `${baseStyles} border-blue-500`;
      default:
        return `${baseStyles} border-gray-500`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div 
      className={getToastStyles()}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg" aria-hidden="true">{getIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
            aria-label="알림 닫기"
            type="button"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}