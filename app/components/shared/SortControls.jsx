// app/components/shared/SortControls.jsx
'use client';

const OPTIONS = [
  { value: 'score_desc',  label: 'Score ↓' },
  { value: 'score_asc',   label: 'Score ↑' },
  { value: 'name_asc',    label: 'Name A–Z' },
  { value: 'name_desc',   label: 'Name Z–A' },
];

export default function SortControls({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
            ${value === opt.value
              ? 'bg-violet-600 text-white'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}