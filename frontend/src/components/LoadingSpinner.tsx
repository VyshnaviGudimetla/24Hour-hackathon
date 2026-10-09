import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  label?: string;
}

const sizeMap = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

/**
 * Spinning ring loader for inline use inside buttons, cards, etc.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'sm',
  color = 'border-current',
  className = '',
  label,
}) => (
  <div className="inline-flex items-center gap-2">
    <span
      className={`
        inline-block rounded-full animate-spin
        border-t-transparent
        ${sizeMap[size]} ${color} ${className}
      `}
      aria-hidden="true"
      role="status"
    />
    {label && <span className="text-xs font-mono text-slate-400">{label}</span>}
  </div>
);

export interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  spinnerColor?: string;
}

/**
 * Wraps button content with a spinner when loading=true.
 * Use inside a <button> element alongside disabled={loading}.
 */
export const ButtonLoader: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  text,
  size = 'sm',
  icon,
  spinnerColor = 'border-current',
}) => (
  <>
    {loading ? (
      <span className="inline-flex items-center gap-1.5">
        <Spinner size={size} color={spinnerColor} />
        <span>{text ?? 'Processing…'}</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {children}
      </span>
    )}
  </>
);

export interface SkeletonProps {
  className?: string;
  lines?: number;
}

/**
 * Animated skeleton shimmer block for page/card loading states.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 rounded-md bg-slate-800 animate-pulse"
        style={{ width: i === lines - 1 && lines > 1 ? '65%' : '100%' }}
      />
    ))}
  </div>
);

export interface PageLoaderProps {
  message?: string;
}

/**
 * Full-card centered loader with a spinner and optional message.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading data…' }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
    <Spinner size="lg" color="border-cyan-400" className="border-t-transparent" />
    <p className="text-sm font-mono">{message}</p>
  </div>
);
