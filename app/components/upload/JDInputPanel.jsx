// app/components/upload/JDInputPanel.jsx
'use client';

import { useState, useRef, useMemo } from 'react';
import { PenTool, FileUp, FileText, X } from 'lucide-react';

const MAX_JD_CHARS = 10000;

const KNOWN_SKILLS = [
  'React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 
  'AWS', 'Docker', 'Kubernetes', 'Go', 'Rust', 'Java', 'PostgreSQL', 
  'SQL', 'MongoDB', 'GraphQL', 'Tailwind', 'Vue', 'Angular', 'C++', 
  'Figma', 'Django', 'Flask', 'FastAPI', 'Ruby', 'Rails', 'Redis'
];

export default function JDInputPanel({ jdText, jdFile, onTextChange, onFileChange }) {
  const [mode, setMode]       = useState('text'); // 'text' | 'file'
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef            = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    if (!allowed.includes(ext)) {
      alert('JD file must be PDF, DOC, DOCX, or TXT');
      return;
    }
    onFileChange(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const charCount  = jdText.length;
  const isOverLimit = charCount > MAX_JD_CHARS;
  const pct        = Math.min(100, (charCount / MAX_JD_CHARS) * 100);

  // Real-time keyword skills parser
  const detectedSkills = useMemo(() => {
    if (!jdText) return [];
    const lower = jdText.toLowerCase();
    return KNOWN_SKILLS.filter(skill => {
      // Create a regex to match the skill as a whole word or with standard punctuation
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(lower);
    });
  }, [jdText]);

  // Real-time experience requirement parser
  const detectedExperience = useMemo(() => {
    if (!jdText) return '';
    const match = jdText.match(/\b(\d+\+?\s*(?:years?|yrs?))\b/i);
    return match ? match[1] : '';
  }, [jdText]);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-900 w-fit">
        {['text', 'file'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`
              px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-150
              ${mode === m
                ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
              }
            `}
          >
            {m === 'text' ? (
              <span className="flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5" />
                Type JD
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <FileUp className="w-3.5 h-3.5" />
                Upload JD
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Text mode */}
      {mode === 'text' && (
        <div className="relative">
          <textarea
            value={jdText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={`Paste the job description here…\n\nInclude:\n• Required skills and technologies (React, Next.js, Node.js, AWS)\n• Experience expectations (2+ Years)\n• Core responsibilities`}
            rows={7}
            maxLength={MAX_JD_CHARS + 100}
            className={`
              w-full px-3 py-2.5 rounded-xl
              bg-zinc-950/40 border text-xs text-zinc-200
              placeholder-zinc-600 resize-none
              focus:outline-none focus:ring-0 transition-all duration-150
              font-mono leading-relaxed custom-scrollbar
              ${isOverLimit
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-zinc-900 focus:border-zinc-800'
              }
            `}
          />

          {/* Character counter */}
          <div className="flex items-center justify-between mt-1 px-1">
            <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden mr-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverLimit ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-violet-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono ${isOverLimit ? 'text-red-400' : 'text-zinc-600'}`}>
              {charCount.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
            </span>
          </div>

          {isOverLimit && (
            <p className="text-[10px] text-red-400 mt-1 px-1">
              JD is too long. Please trim to {MAX_JD_CHARS.toLocaleString()} characters.
            </p>
          )}
        </div>
      )}

      {/* File mode */}
      {mode === 'file' && (
        <div>
          {!jdFile ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true);  }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={onDrop}
              className={`
                flex flex-col items-center justify-center gap-2.5
                w-full h-32 rounded-xl border border-dashed
                cursor-pointer transition-all duration-200
                ${dragOver
                  ? 'border-violet-500 bg-violet-500/5'
                  : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/10'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                className="sr-only"
              />
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${dragOver ? 'bg-violet-500/20' : 'bg-zinc-900'}`}>
                <FileUp className={`w-4 h-4 ${dragOver ? 'text-violet-400' : 'text-zinc-500'}`} />
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-400 font-semibold">Drop JD document or <span className="text-violet-400 font-bold">browse</span></p>
                <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">PDF, DOC, DOCX, or TXT</p>
              </div>
            </label>
          ) : (
            /* File selected */
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-900 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-violet-400" />
                </div>
                <div className="truncate pr-4">
                  <p className="font-semibold text-zinc-200 truncate">{jdFile.name}</p>
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                    {(jdFile.size / 1024).toFixed(0)} KB · JD Document
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); onFileChange(null); }}
                className="w-6 h-6 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-all"
                title="Remove File"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Real-time Requirement Extractor Display */}
      <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-3 mt-2">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          <span>Job Context Intel (Realtime)</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Skills Detected:</p>
            <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto custom-scrollbar">
              {detectedSkills.length > 0 ? (
                detectedSkills.map(skill => (
                  <span key={skill} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-wide">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[9px] font-mono text-zinc-600">Awaiting input...</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Experience Required:</p>
            <p className="text-xs font-bold text-zinc-300 mt-1">
              {detectedExperience || '2+ Years (Default)'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}