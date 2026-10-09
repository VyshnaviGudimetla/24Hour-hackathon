import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

let nextId = 1;

export interface UseToast {
  toasts: ToastMessage[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

export function useToast(): UseToast {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `toast-${nextId++}`;
      const toast: ToastMessage = { id, type, title, message, duration };
      setToasts((prev) => [...prev.slice(-4), toast]); // keep at most 5 at once
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast('error', title, message, 6000),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message, 5000),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    [showToast]
  );

  return { toasts, showToast, success, error, warning, info, dismiss };
}
