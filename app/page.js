'use client';

import { useState } from 'react';
import { Sparkles, FileText, Layers, Download, Search } from 'lucide-react';
import ResumeDropzone from './components/upload/ResumeDropzone';
import JDInputPanel from './components/upload/JDInputPanel';
import LoadingScreen from './components/shared/LoadingScreen';
import ResultsDashboard from './components/results/ResultsDashboard';
import ErrorBanner from './components/shared/ErrorBanner';

//  Step constants 
const STEP = { UPLOAD: 'upload', LOADING: 'loading', RESULTS: 'results' };

export default function Home() {
  //  State 
  const [step, setStep] = useState(STEP.UPLOAD);
  const [files, setFiles] = useState([]);
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const canSubmit =
    files.length > 0 &&
    (jdText.trim().length >= 10 || jdFile !== null) &&
    !uploading;

  // ── Step 1 → 2: Upload files, create session, start analysis ─────────────
  const handleSubmit = async () => {
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('resumes', f));
      if (jdFile) {
        formData.append('jdFile', jdFile);
      } else {
        formData.append('jd', jdText);
      }

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'Upload failed. Please try again.');
      }

      setSessionId(uploadData.sessionId);
      setTotalCount(uploadData.totalResumes);
      setStep(STEP.LOADING);
    } catch (err) {
      setError(err.message || 'Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  // ── Step 2 → 3: Analysis complete — fetch ranked results ─────────────────
  const handleAnalysisComplete = async () => {
    try {
      const res = await fetch(`/api/results/${sessionId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load results.');
      }

      setCandidates(data.candidates || []);
      setStep(STEP.RESULTS);
    } catch (err) {
      setError(err.message || 'Failed to retrieve results.');
      setStep(STEP.UPLOAD);
    }
  };

  // ── Analysis error ────────────────────────────────────────────────────────
  const handleAnalysisError = (msg) => {
    setError(msg || 'Analysis failed. Please try again.');
    setStep(STEP.UPLOAD);
  };

  // ── Reset to start ────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(STEP.UPLOAD);
    setFiles([]);
    setJdText('');
    setJdFile(null);
    setSessionId(null);
    setTotalCount(0);
    setCandidates([]);
    setError('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">

      {/* ── Background Grid Line Decor ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between">

        {/* ── Professional Recruiter Navigation Bar ────────────────────────── */}
        <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Brand logo block */}
              <button onClick={handleReset} className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity">
                <div className="w-6.5 h-6.5 rounded-lg bg-violet-600 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
                    <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-bold text-xs text-zinc-100 tracking-widest uppercase">
                  ResumeRank <span className="text-violet-400">AI</span>
                </span>
              </button>

              {/* Navigation items */}
              <div className="hidden sm:flex items-center gap-1 text-xs">
                {['Candidates', 'Analysis', 'Reports'].map(link => {
                  const isActive =
                    (link === 'Candidates' && step === STEP.RESULTS) ||
                    (link === 'Analysis' && step === STEP.LOADING) ||
                    (link === 'Candidates' && step === STEP.UPLOAD); // Candidates list active during upload
                  return (
                    <button
                      key={link}
                      disabled={step === STEP.LOADING}
                      className={`px-3.5 py-1.5 rounded-md transition-all font-bold uppercase tracking-wider text-[10px] ${isActive
                        ? 'text-zinc-100 bg-zinc-900 border border-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                    >
                      {link}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global Search Mockup & Action Buttons */}
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="text"
                  disabled
                  placeholder="Quick Search (/) "
                  className="w-44 pl-8 pr-3 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-wider bg-zinc-950 border border-zinc-900 text-zinc-600 cursor-not-allowed"
                />
              </div>

              {step !== STEP.UPLOAD && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all"
                >
                  New Screening
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* ── Main content viewport ────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex-1 w-full flex flex-col">

          {/* Error Banner System */}
          {error && (
            <div className="mb-4">
              <ErrorBanner
                message={error}
                onDismiss={() => setError('')}
                onRetry={step === STEP.UPLOAD ? handleSubmit : handleReset}
              />
            </div>
          )}

          {/* ── STEP 1: Upload (Create New Screening Page) ─────────────────── */}
          {step === STEP.UPLOAD && (
            <div className="space-y-4 flex-1 flex flex-col justify-between fade-in">
              <div className="flex items-center justify-between py-1 border-b border-zinc-900/60">
                <h1 className="text-base font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2">
                  Create New Screening
                </h1>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded">
                  Awaiting Pipeline Setup
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch flex-1">

                {/* Left Column: Resumes Area */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                      <div>
                        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Candidate Resumes</h2>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Queue raw files to parse skills, qualifications, and fit.</p>
                      </div>
                      {files.length > 0 && (
                        <button
                          onClick={() => setFiles([])}
                          className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wide"
                        >
                          Clear Queue
                        </button>
                      )}
                    </div>
                    <ResumeDropzone files={files} onChange={setFiles} />
                  </div>
                </div>

                {/* Right Column: Job Description Area */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                      <div>
                        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Job Description</h2>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Mandate candidate experience, tech stack, and certifications.</p>
                      </div>
                    </div>
                    <JDInputPanel
                      jdText={jdText}
                      jdFile={jdFile}
                      onTextChange={setJdText}
                      onFileChange={setJdFile}
                    />
                  </div>
                </div>

              </div>

              {/* Action bar and specs footer */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { text: 'A11y Compliant' },
                    { text: 'AI Rank Matrix' },
                    { text: 'High Density Workspace' },
                    { text: 'Excel Export Ready' },
                  ].map((f) => (
                    <span key={f.text} className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider px-2 py-0.5 rounded-full border border-zinc-900">
                      {f.text}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`
                    w-full sm:w-auto px-5 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider
                    flex items-center justify-center gap-2
                    transition-all duration-200
                    ${canSubmit
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md active:translate-y-0 hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800'
                    }
                  `}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading Batches…
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      Analyze Candidates {files.length > 0 ? `(${files.length})` : ''}
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* ── STEP 2: Loading / Analysis ─────────────────────────────────── */}
          {step === STEP.LOADING && (
            <div className="flex-1 flex flex-col justify-center py-10">
              <LoadingScreen
                sessionId={sessionId}
                totalCount={totalCount}
                onComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </div>
          )}

          {/* ── STEP 3: Results Workspace ──────────────────────────────────── */}
          {step === STEP.RESULTS && (
            <div className="fade-in flex-1 flex flex-col">
              <ResultsDashboard
                candidates={candidates}
                onReset={handleReset}
                sessionId={sessionId}
              />
            </div>
          )}

        </main>

        {/* ── Clean Recruiter Footer ───────────────────────────────────────── */}
        <footer className="border-t border-zinc-900 bg-zinc-950 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-600">
            <p className="text-[10px] uppercase font-bold tracking-wider">
              ResumeRank AI · Professional recruiting intelligence workspace
            </p>
            <p className="text-[10px] font-mono">
              Next.js Turbopack · Gemini 1.5 Flash evaluation
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}