// app/components/shared/ErrorBanner.jsx
'use client';

export default function ErrorBanner({ message, onDismiss, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" className="text-red-400">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-300">Something went wrong</p>
        <p className="text-xs text-red-400/80 mt-0.5 leading-relaxed">{message}</p>
        {onRetry && (
          <button onClick={onRetry}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">
            Try again
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss}
          className="text-red-600 hover:text-red-400 transition-colors flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}