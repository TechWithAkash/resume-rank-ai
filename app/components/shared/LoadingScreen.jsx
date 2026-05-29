// app/components/shared/LoadingScreen.jsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Circle, FileText, Check } from 'lucide-react';

export default function LoadingScreen({ sessionId, totalCount, onComplete, onError }) {
  const [processed, setProcessed] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [dots, setDots]               = useState('');
  const [stage, setStage]             = useState('connecting'); // 'connecting' | 'analyzing' | 'ranking'

  // Ellipsis animation
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(id);
  }, []);

  // SSE: connect to analyze endpoint and stream progress
  useEffect(() => {
    if (!sessionId) return;

    let source;

    const run = async () => {
      try {
        setStage('connecting');

        const response = await fetch('/api/analyze', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const data = await response.json();
          onError(data.message || 'Analysis failed to start.');
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        setStage('analyzing');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // keep incomplete chunk

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'progress') {
                setProcessed(event.processed);
                setCurrentFile(event.filename || '');
              } else if (event.type === 'complete') {
                setStage('ranking');
                setTimeout(() => onComplete(), 800);
              } else if (event.type === 'error') {
                onError(event.message || 'Analysis error.');
              }
            } catch {
              // Malformed SSE chunk — skip
            }
          }
        }
      } catch (err) {
        onError(err.message || 'Connection failed.');
      }
    };

    run();
    return () => { if (source) source.close(); };
  }, [sessionId]);

  const pct = totalCount > 0 ? Math.round((processed / totalCount) * 100) : 0;

  // Define recruitment pipeline steps
  const steps = [
    {
      id: 1,
      title: 'Parsing Resumes',
      desc: 'Extracting clean text buffers from PDF/Word formats.',
      status: 'completed', // Handled pre-analysis in upload
    },
    {
      id: 2,
      title: 'Extracting Skills',
      desc: 'Identifying candidate keywords, hard tools, and domain skills.',
      status: stage === 'connecting' ? 'pending' : (processed > 0 || stage === 'ranking' ? 'completed' : 'active'),
    },
    {
      id: 3,
      title: 'Analyzing JD Requirements',
      desc: 'Evaluating candidate core years and degree alignment.',
      status: stage === 'connecting' ? 'pending' : (processed > 0 || stage === 'ranking' ? 'completed' : 'active'),
    },
    {
      id: 4,
      title: 'Scoring Candidates',
      desc: `Scoring candidates under 4 evaluation layers (processed ${processed}/${totalCount}).`,
      status: stage === 'ranking' ? 'completed' : (stage === 'analyzing' ? 'active' : 'pending'),
    },
    {
      id: 5,
      title: 'Ranking Results',
      desc: 'Sorting match scores and structuring the executive spreadsheet report.',
      status: stage === 'ranking' ? 'active' : 'pending',
    },
  ];

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-8 fade-in">
      {/* Top compact indicator */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-200">AI Recruiter Pipeline</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Processing {totalCount} candidate resume{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/5 border border-violet-500/10 px-2 py-1 rounded">
            {stage === 'ranking' ? 'Ranking' : `${pct}%`}
          </span>
        </div>
      </div>

      {/* Vertical Steps */}
      <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800">
        {steps.map((s) => {
          const isCompleted = s.status === 'completed';
          const isActive = s.status === 'active';
          
          return (
            <div key={s.id} className="flex items-start gap-4 relative transition-opacity duration-300">
              {/* Left timeline icon */}
              <div className="flex-shrink-0 z-10">
                {isCompleted ? (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : isActive ? (
                  <div className="w-9 h-9 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                    <Circle className="w-3 h-3 fill-zinc-900" />
                  </div>
                )}
              </div>

              {/* Text metadata */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold ${isCompleted ? 'text-zinc-400' : isActive ? 'text-violet-300' : 'text-zinc-600'}`}>
                    {s.title}
                  </h3>
                  {isActive && dots && (
                    <span className="text-xs text-violet-400 font-bold">{dots}</span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isCompleted ? 'text-zinc-500' : isActive ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {s.desc}
                </p>
                {isActive && currentFile && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate border-l border-zinc-800 pl-2">
                    Active: {currentFile}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global progress indicator bar */}
      <div className="space-y-2 pt-4 border-t border-zinc-900">
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stage === 'ranking' ? 100 : pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
          <span>{stage === 'ranking' ? 'Finalizing...' : 'Scoring in progress'}</span>
          <span>{processed}/{totalCount} processed</span>
        </div>
      </div>
    </div>
  );
}