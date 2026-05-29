// app/components/results/ExportButton.jsx
'use client';

import { useState } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';

export default function ExportButton({ candidates }) {
  const [open, setOpen] = useState(false);

  const buildRows = () =>
    candidates.map((c) => ({
      Rank:                 c.rank,
      'Candidate Name':     c.candidateName,
      'Filename':           c.filename,
      'Match Score':        c.score,
      'Experience Relevance': c.experienceRelevance,
      'Education Alignment':  c.educationAlignment,
      'Matched Skills':     c.matchedSkills.join(', '),
      'Missing Skills':     c.missingSkills.join(', '),
      'Top Strength':       c.topStrength,
      'Critical Gap':       c.criticalGap,
      'Summary':            c.summary,
    }));

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows  = buildRows();
    const keys  = Object.keys(rows[0]);
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv   = [keys.map(escape).join(','), ...rows.map((r) => keys.map((k) => escape(r[k])).join(','))].join('\n');
    download('resumerank-results.csv', 'text/csv', csv);
    setOpen(false);
  };

  // ── Excel export ──────────────────────────────────────────────────────────
  const exportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const rows  = buildRows();
      const ws    = XLSX.utils.json_to_sheet(rows);
      const wb    = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
      XLSX.writeFile(wb, 'resumerank-results.xlsx');
      setOpen(false);
    } catch (err) {
      alert('Excel export failed: ' + err.message);
    }
  };

  const download = (filename, mime, content) => {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          bg-zinc-900 border border-zinc-700 text-zinc-300
          hover:border-zinc-600 hover:text-zinc-100
          transition-all duration-200
        "
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-20 w-44 rounded-xl border border-zinc-700
            bg-zinc-900 shadow-xl shadow-black/40 overflow-hidden">
            <button onClick={exportCSV}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-300
                hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
              <FileText className="w-4 h-4 text-zinc-400" /> Export CSV
            </button>
            <div className="border-t border-zinc-800" />
            <button onClick={exportExcel}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-300
                hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" /> Export Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}