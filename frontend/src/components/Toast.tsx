import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persist until manually closed
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    borderColor: string;
    bgColor: string;
    titleColor: string;
    progressColor: string;
    barStyle: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/95',
    titleColor: 'text-emerald-300',
    progressColor: 'bg-emerald-400',
    barStyle: 'shadow-[0_0_8px_rgba(52,211,153,0.5)]',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-950/95',
    titleColor: 'text-rose-300',
    progressColor: 'bg-rose-400',
    barStyle: 'shadow-[0_0_8px_rgba(251,113,133,0.5)]',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-950/95',
    titleColor: 'text-amber-300',
    progressColor: 'bg-amber-400',
    barStyle: 'shadow-[0_0_8px_rgba(251,191,36,0.5)]',
  },
  info: {
    icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-950/95',
    titleColor: 'text-cyan-300',
    progressColor: 'bg-cyan-400',
    barStyle: 'shadow-[0_0_8px_rgba(34,211,238,0.5)]',
  },
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const duration = toast.duration ?? 4500;
  const cfg = TOAST_CONFIG[toast.type];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (duration === 0) return;
    const t = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(t);
  }, [duration]);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 400);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 pr-10 rounded-2xl border shadow-2xl backdrop-blur-md
        min-w-[320px] max-w-[420px]
        ${cfg.bgColor} ${cfg.borderColor}
        transition-all duration-400 ease-in-out
        ${visible && !leaving ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="mt-0.5 shrink-0">{cfg.icon}</div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${cfg.titleColor}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">{toast.message}</p>
        )}
      </div>

      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl overflow-hidden bg-white/5">
          <div
            className={`h-full ${cfg.progressColor} ${cfg.barStyle}`}
            style={{ animation: `toastProgress ${duration}ms linear forwards` }}
          />
        </div>
      )}
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
