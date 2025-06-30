'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // 자동 제거
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'success', duration });
  }, [addToast]);

  const showError = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'error', duration });
  }, [addToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'warning', duration });
  }, [addToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'info', duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}