// app/components/results/CandidateSidePanel.jsx
'use client';

import { Zap, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import SkillBadge from './SkillBadge';

const RANK_MEDAL_COLORS = { 1: 'text-amber-400', 2: 'text-slate-300', 3: 'text-amber-600' };
const RELEVANCE_LABEL = { high: 'High Match', medium: 'Moderate Match', low: 'Minimal Match' };
const EDU_LABEL = { strong: 'Strong Alignment', partial: 'Partial Alignment', weak: 'Weak Alignment' };

const getRecommendation = (score) => {
  if (score >= 85) return { label: 'Strong Hire', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 70) return { label: 'Hire', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 55) return { label: 'Consider', color: 'text-amber-400   bg-amber-500/10   border-amber-500/20' };
  if (score >= 40) return { label: 'Weak Match', color: 'text-orange-400  bg-orange-500/10  border-orange-500/20' };
  return { label: 'Reject', color: 'text-red-400     bg-red-500/10     border-red-500/20' };
};

export default function CandidateSidePanel({ candidate, onClose }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const score = candidate?.score ?? 0;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreStroke = (val) => {
    if (val >= 80) return 'stroke-emerald-500';
    if (val >= 60) return 'stroke-green-500';
    if (val >= 45) return 'stroke-amber-500';
    return 'stroke-red-500';
  };
  const getScoreText = (val) => {
    if (val >= 80) return 'text-emerald-400';
    if (val >= 60) return 'text-green-400';
    if (val >= 45) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className={`fixed inset-0 z-50 ${candidate ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${candidate ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />
      {/* Sliding Panel */}
      <div className={`fixed top-0 right-0 h-screen w-full md:w-[540px] bg-zinc-950 border-l border-zinc-900
        z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out
        ${candidate ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {candidate && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {candidate.candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 truncate max-w-[280px]">{candidate.candidateName}</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Rank #{candidate.rank} · {candidate.filename}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

              {/* Score ring + KPIs */}
              <div className="grid grid-cols-3 gap-4 bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 items-center">
                <div className="flex flex-col items-center justify-center border-r border-zinc-900 pr-2">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-20 h-20 -rotate-90">
                      <circle cx="40" cy="40" r={radius} className="stroke-zinc-900" strokeWidth="5" fill="transparent" />
                      <circle cx="40" cy="40" r={radius} className={`${getScoreStroke(score)} transition-all duration-1000`}
                        strokeWidth="5" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                    </svg>
                    <span className={`absolute text-base font-bold font-mono ${getScoreText(score)}`}>{score}%</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Match Index</span>
                </div>
                <div className="col-span-2 space-y-2.5 pl-2">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Recommendation</span>
                    <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase inline-block ${getRecommendation(score).color}`}>
                      {getRecommendation(score).label}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Experience</span>
                    <p className="text-xs font-semibold text-zinc-200">{RELEVANCE_LABEL[candidate.experienceRelevance] || candidate.experienceRelevance}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Education</span>
                    <p className="text-xs font-semibold text-zinc-200">{EDU_LABEL[candidate.educationAlignment] || candidate.educationAlignment}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">AI Executive Summary</p>
                <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-zinc-800 pl-3">
                  "{candidate.summary || 'No summary provided.'}"
                </p>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" /> Top Strengths
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{candidate.topStrength || 'No standout strengths documented.'}</p>
                </div>
                <div className="p-3.5 rounded-lg bg-red-500/5 border border-red-500/10 space-y-2">
                  <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" /> Critical Gap
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{candidate.criticalGap || 'No critical gaps detected.'}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Matched Skills ({candidate.matchedSkills.length})
                  </p>
                  {candidate.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.matchedSkills.map((s) => <SkillBadge key={s} skill={s} type="matched" />)}
                    </div>
                  ) : <p className="text-xs text-zinc-600">None identified</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-red-500" /> Missing Skills ({candidate.missingSkills.length})
                  </p>
                  {candidate.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.missingSkills.map((s) => <SkillBadge key={s} skill={s} type="missing" />)}
                    </div>
                  ) : <p className="text-xs text-zinc-600">No critical gaps</p>}
                </div>
              </div>

              {/* Raw preview */}
              {candidate.rawTextPreview && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Resume Text Preview</p>
                  <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-900 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[11px] text-zinc-500 leading-relaxed whitespace-pre-wrap">
                    {candidate.rawTextPreview}
                    {candidate.rawTextPreview.length >= 500 && (
                      <span className="text-zinc-700 block mt-2 text-[10px] font-sans font-semibold uppercase tracking-wider">
                        [Preview truncated — full resume was analysed]
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}