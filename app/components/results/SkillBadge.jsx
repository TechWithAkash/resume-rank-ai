// app/components/results/SkillBadge.jsx
'use client';

export default function SkillBadge({ skill, type = 'matched' }) {
  const styles = {
    matched: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    missing: 'bg-red-500/10    text-red-400    border-red-500/20',
  };

  const icons = {
    matched: (
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="2 6 5 9 10 3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    missing: (
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="2" y1="2" x2="10" y2="10" strokeLinecap="round"/>
        <line x1="10" y1="2" x2="2"  y2="10" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-md
      text-[11px] font-medium border
      ${styles[type]}
    `}>
      {icons[type]}
      {skill}
    </span>
  );
}