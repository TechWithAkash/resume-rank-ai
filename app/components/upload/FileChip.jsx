// app/components/upload/FileChip.jsx
'use client';

export default function FileChip({ file, onRemove }) {
  const ext = file.name.split('.').pop().toUpperCase();

  const extColors = {
    PDF:  { bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/20'   },
    DOC:  { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/20'  },
    DOCX: { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/20'  },
  };
  const colors = extColors[ext] || { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' };

  const sizeKB = (file.size / 1024).toFixed(0);
  const sizeMB = (file.size / 1024 / 1024).toFixed(1);
  const displaySize = file.size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`;

  // Truncate long filenames
  const displayName =
    file.name.length > 28
      ? file.name.slice(0, 12) + '…' + file.name.slice(-10)
      : file.name;

  return (
    <div
      className={`
        group flex items-center gap-2 px-3 py-1.5 rounded-lg border
        bg-zinc-900/60 border-zinc-700/50
        hover:border-zinc-600 transition-all duration-200
      `}
    >
      {/* Extension badge */}
      <span
        className={`
          text-[10px] font-bold px-1.5 py-0.5 rounded
          ${colors.bg} ${colors.text} border ${colors.border}
          font-mono tracking-wider flex-shrink-0
        `}
      >
        {ext}
      </span>

      {/* Filename */}
      <span
        className="text-sm text-zinc-300 truncate max-w-[160px]"
        title={file.name}
      >
        {displayName}
      </span>

      {/* File size */}
      <span className="text-xs text-zinc-600 flex-shrink-0">{displaySize}</span>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={() => onRemove(file)}
          className="
            ml-1 flex-shrink-0 w-4 h-4 rounded-full
            flex items-center justify-center
            text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700
            transition-all duration-150 opacity-0 group-hover:opacity-100
          "
          title="Remove file"
          aria-label={`Remove ${file.name}`}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}