// app/components/results/CandidateTable.jsx
'use client';

import { Trophy } from 'lucide-react';
import SkillBadge from './SkillBadge';

const RANK_MEDAL_COLORS = {
  1: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]',
  2: 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.3)]',
  3: 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]',
};

const RELEVANCE_COLOR = {
  high: 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10',
  medium: 'text-amber-400   bg-amber-500/5   border border-amber-500/10',
  low: 'text-red-400     bg-red-500/5     border border-red-500/10',
};
const EDU_COLOR = {
  strong: 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10',
  partial: 'text-amber-400   bg-amber-500/5   border border-amber-500/10',
  weak: 'text-red-400     bg-red-500/5     border border-red-500/10',
};
const getRecommendation = (score) => {
  if (score >= 85) return { label: 'Strong Hire', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 70) return { label: 'Hire', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 55) return { label: 'Consider', color: 'text-amber-400   bg-amber-500/10   border-amber-500/20' };
  if (score >= 40) return { label: 'Weak Match', color: 'text-orange-400  bg-orange-500/10  border-orange-500/20' };
  return { label: 'Reject', color: 'text-red-400     bg-red-500/10     border-red-500/20' };
};
const getScoreBadge = (score) => {
  if (score >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 50) return 'text-amber-400   bg-amber-500/10   border-amber-500/20';
  return 'text-red-400     bg-red-500/10     border-red-500/20';
};

export default function CandidateTable({ displayed, search, setSearch, sort, setSort, onSelectCandidate, selectedId }) {

  const toggleSort = (field) => {
    if (field === 'score') setSort((s) => s === 'score_desc' ? 'score_asc' : 'score_desc');
    if (field === 'name') setSort((s) => s === 'name_asc' ? 'name_desc' : 'name_asc');
  };

  return (
    <div className="flex flex-col">
      {/* Search & Sort bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-zinc-800">
        <div className="relative w-full sm:flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by candidate, skill, or file..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-zinc-950/50 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-all" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Sort:</span>
          <div className="flex gap-1">
            {['score', 'name'].map((f) => (
              <button key={f} onClick={() => toggleSort(f)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all
                  ${sort.startsWith(f) ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50' : 'bg-zinc-950/40 text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60">
              {['Rank', 'Candidate', 'Score', 'Experience', 'Education', 'Matched Skills', 'Missing Skills', 'Verdict'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-zinc-500 text-xs">No matching candidates.</td></tr>
            ) : displayed.map((c, i) => {
              const isSelected = selectedId === c.filename;
              const hasFailed = !c.parseSuccess || !c.scoringSuccess;
              return (
                <tr key={c.filename + i} onClick={() => onSelectCandidate(isSelected ? null : c)}
                  className={`border-b border-zinc-900 cursor-pointer transition-colors
                    ${isSelected ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/30'}`}>

                  <td className="px-4 py-3 font-mono font-bold text-xs">
                    {c.rank <= 3 && !hasFailed ? (
                      <Trophy className={`w-3.5 h-3.5 ${RANK_MEDAL_COLORS[c.rank]}`} />
                    ) : (
                      <span className="text-zinc-500">#{c.rank}</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase
                        ${hasFailed ? 'bg-zinc-800 text-zinc-600' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'}`}>
                        {c.candidateName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-100 truncate max-w-[140px]">{c.candidateName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">{c.filename}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {!hasFailed
                      ? <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${getScoreBadge(c.score)}`}>{c.score}%</span>
                      : <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">Failed</span>}
                  </td>

                  <td className="px-4 py-3">
                    {!hasFailed
                      ? <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${RELEVANCE_COLOR[c.experienceRelevance] || ''}`}>{c.experienceRelevance}</span>
                      : <span className="text-zinc-600">—</span>}
                  </td>

                  <td className="px-4 py-3">
                    {!hasFailed
                      ? <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${EDU_COLOR[c.educationAlignment] || ''}`}>{c.educationAlignment}</span>
                      : <span className="text-zinc-600">—</span>}
                  </td>

                  <td className="px-4 py-3">
                    {!hasFailed ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {c.matchedSkills.slice(0, 3).map((s) => <SkillBadge key={s} skill={s} type="matched" />)}
                        {c.matchedSkills.length > 3 && <span className="text-[9px] font-mono text-zinc-600">+{c.matchedSkills.length - 3}</span>}
                        {c.matchedSkills.length === 0 && <span className="text-[10px] text-zinc-600">None</span>}
                      </div>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>

                  <td className="px-4 py-3">
                    {!hasFailed ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {c.missingSkills.slice(0, 3).map((s) => <SkillBadge key={s} skill={s} type="missing" />)}
                        {c.missingSkills.length > 3 && <span className="text-[9px] font-mono text-zinc-600">+{c.missingSkills.length - 3}</span>}
                        {c.missingSkills.length === 0 && <span className="text-[10px] text-zinc-600">None</span>}
                      </div>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>

                  <td className="px-4 py-3">
                    {!hasFailed
                      ? <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wide uppercase whitespace-nowrap ${getRecommendation(c.score).color}`}>{getRecommendation(c.score).label}</span>
                      : <span className="text-zinc-600">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
