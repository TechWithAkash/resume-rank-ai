// app/components/upload/ResumeDropzone.jsx
'use client';

import { useCallback, useState } from 'react';
import { FileText, UploadCloud, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILES = 50;
const MAX_SIZE_MB = 5;

export default function ResumeDropzone({ files, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError]           = useState('');

  const addFiles = useCallback(
    (incoming) => {
      setError('');
      const newFiles = Array.from(incoming);
      const valid    = [];
      const errors   = [];

      for (const file of newFiles) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
          errors.push(`"${file.name}" — unsupported format`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          errors.push(`"${file.name}" — exceeds ${MAX_SIZE_MB}MB`);
          continue;
        }
        // Deduplicate by name + size
        const isDuplicate = files.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (isDuplicate) continue;
        valid.push(file);
      }

      const merged = [...files, ...valid].slice(0, MAX_FILES);
      if (files.length + valid.length > MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files — extra files were ignored`);
      }

      if (errors.length > 0) setError(errors.join(' · '));
      onChange(merged);
    },
    [files, onChange]
  );

  const removeFile = useCallback(
    (target) => onChange(files.filter((f) => f !== target)),
    [files, onChange]
  );

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true);  };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const onInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // allow re-selecting
  };

  return (
    <div className="space-y-4">
      {/* Drop zone area */}
      <label
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full py-6 rounded-xl border border-dashed
          cursor-pointer transition-all duration-200 group
          ${isDragging
            ? 'border-violet-500 bg-violet-500/5 scale-[1.005]'
            : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/10'
          }
        `}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={onInputChange}
          className="sr-only"
        />

        <div className="flex flex-col items-center gap-2.5 text-center pointer-events-none select-none">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-zinc-300">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-300">
              Drag & drop candidate resumes or <span className="text-violet-400 font-bold">browse</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Supports PDF, DOC, DOCX · Max 5MB per file
            </p>
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 rounded-xl bg-violet-500/5 border border-violet-500 pointer-events-none" />
        )}
      </label>

      {/* Professional File list */}
      {files.length > 0 && (
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Files to Process ({files.length})
            </span>
          </div>

          <div className="space-y-1">
            {files.map((file, i) => {
              const ext = file.name.split('.').pop().toUpperCase();
              const sizeKB = (file.size / 1024).toFixed(0);
              const displaySize = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)}MB` : `${sizeKB}KB`;
              
              return (
                <div 
                  key={`${file.name}-${i}`}
                  className="group/file flex items-center justify-between p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-xs hover:border-zinc-800 transition-all duration-150"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <div className="truncate pr-4">
                      <p className="font-medium text-zinc-300 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">
                        {ext} · {displaySize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Status indicator */}
                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFile(file);
                      }}
                      className="w-6 h-6 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation error display */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/15">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}