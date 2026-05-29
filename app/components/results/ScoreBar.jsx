// app/components/results/ScoreBar.jsx
'use client';

import { useEffect, useState } from 'react';

function getScoreColor(score) {
  if (score >= 75) return { bar: 'from-emerald-500 to-green-400',  text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (score >= 50) return { bar: 'from-amber-500 to-yellow-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'  };
  if (score >= 25) return { bar: 'from-orange-500 to-amber-400',   text: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' };
  return              { bar: 'from-red-500 to-rose-400',           text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'    };
}

export default function ScoreBar({ score, animate = true }) {
  const [width, setWidth] = useState(animate ? 0 : score);
  const colors = getScoreColor(score);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(timer);
  }, [score, animate]);

  return (
    <div className="flex items-center gap-3">
      {/* Score badge */}
      <div className={`
        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
        ${colors.bg} border ${colors.border}
      `}>
        <span className={`text-lg font-bold font-mono ${colors.text}`}>
          {score}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 space-y-1">
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700 ease-out`}
            style={{ width: `${width}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-600">Match score out of 100</p>
      </div>
    </div>
  );
}

export { getScoreColor };