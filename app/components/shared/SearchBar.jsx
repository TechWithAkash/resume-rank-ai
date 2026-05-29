// app/components/shared/SearchBar.jsx
'use client';

export default function SearchBar({ value, onChange, placeholder = 'Search candidates…' }) {
  return (
    <div className="relative">
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
      >
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-9 py-2 rounded-xl text-sm
          bg-zinc-900/60 border border-zinc-700/60 text-zinc-200
          placeholder-zinc-600
          focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
          transition-all duration-200
        "
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}