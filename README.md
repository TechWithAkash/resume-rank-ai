<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

<br /><br />

<h1>ResumeRank AI</h1>

<p><strong>A production-grade, AI-powered resume screening and candidate ranking platform.<br/>Built as a full-stack internship assignment for <a href="#">chitralai</a>.</strong></p>

<br />

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-resume--rank--ai--zeta.vercel.app-7C3AED?style=for-the-badge)](https://resume-rank-ai-zeta.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-TechWithAkash%2Fresume--rank--ai-181717?style=for-the-badge&logo=github)](https://github.com/TechWithAkash/resume-rank-ai)

<br />

![ResumeRank AI Screenshot](https://img.shields.io/badge/Status-Production_Ready-22c55e?style=flat-square)
![Assignment](https://img.shields.io/badge/Assignment-Completed-7C3AED?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

</div>

---

## 📌 Overview

**ResumeRank AI** automates the most time-consuming step in any hiring pipeline — initial resume screening. HR teams and recruiters upload a batch of resumes alongside a Job Description, and the system:

- **Parses** every resume (PDF, DOC, DOCX) and extracts structured text
- **Scores** each candidate 0–100 using Google Gemini AI across 4 evaluation dimensions
- **Ranks** all candidates from highest to lowest fit
- **Surfaces** matched skills, missing skills, experience relevance, and a one-line AI hiring summary per candidate
- **Exports** the full ranked list as CSV or Excel for downstream use

The entire pipeline — upload → parse → score → rank → display — completes in under 30 seconds for a batch of 10 resumes, with live SSE progress streaming so the recruiter sees results as they arrive.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📂 **Batch Resume Upload** | Drag-and-drop or browse. Supports PDF, DOC, DOCX. Up to 50 files, 5MB each |
| 📝 **Flexible JD Input** | Type a job description directly or upload a JD file |
| 🤖 **AI Scoring Engine** | Google Gemini 2.0 Flash scores each resume with structured JSON output |
| 🏆 **Intelligent Ranking** | Tie-aware ranking with medal indicators for top 3 candidates |
| 📊 **Dual View Modes** | Three-panel Workspace view + compact Database/Table view |
| 🔍 **Live Skill Detection** | JD panel auto-detects required skills and experience as you type |
| 💡 **Hiring Recommendations** | Strong Hire / Hire / Consider / Reject verdict per candidate |
| 📤 **Export Results** | One-click export to CSV or Excel (`.xlsx`) with all scoring data |
| 🔄 **Heuristic Fallback** | If Gemini API is unavailable, a local keyword-based fallback scores resumes |
| ⚡ **SSE Live Progress** | Real-time streaming progress bar — no polling, no blank waiting screens |
| 🛡️ **Input Validation** | MIME-type validation, file size limits, deduplication, path traversal protection |

---

## 🖥️ Application Screenshots

### Upload & Job Description Input
> Two-column layout with real-time JD skill detection and file queue management

### AI Analysis Pipeline
> Live step-by-step progress with phase indicators: Parsing → Scoring → Ranking

### Workspace View (3-Panel)
> Candidate list sidebar · Full profile detail · AI hiring evaluation panel

### Database View
> Sortable, searchable table with score badges, skill tags, and verdict labels

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                                                          │
│  Upload UI → JD Input → Loading Screen → Results        │
│  (React 19 · Next.js App Router · Tailwind CSS v4)      │
└─────────────────┬───────────────────────────────────────┘
                  │  HTTPS / REST + SSE
                  ▼
┌─────────────────────────────────────────────────────────┐
│               NEXT.JS API ROUTES (Node.js)               │
│                                                          │
│  POST /api/upload   → validate files → store in session  │
│  POST /api/analyze  → parse → score → rank (SSE stream)  │
│  GET  /api/results  → return ranked candidate list       │
└─────────────────┬───────────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌─────────────┐    ┌──────────────────────┐
│  In-Memory  │    │   Google Gemini API   │
│  Session    │    │   (gemini-2.0-flash)  │
│  Store (Map)│    │   Structured JSON out │
└─────────────┘    └──────────────────────┘
```

### Request Lifecycle

```
1.  User uploads resumes + JD  →  POST /api/upload
                                   • Validates files (MIME, size, count)
                                   • Stores raw buffers in session
                                   • Returns sessionId instantly (<1s)

2.  LoadingScreen connects SSE →  POST /api/analyze (streaming)
                                   • Phase 1: Parse each file (pdf-parse / mammoth)
                                   • Phase 2: Score each resume via Gemini
                                   • Phase 3: Rank and finalise candidates
                                   • Streams progress events throughout

3.  Analysis complete          →  GET /api/results/:sessionId
                                   • Returns full ranked candidate list
                                   • ResultsDashboard renders workspace
```

---

## 🧠 AI Scoring Methodology

Each resume is scored independently against the Job Description by **Gemini 2.0 Flash** across four weighted dimensions:

| Dimension | Weight | Description |
|---|---|---|
| Skills Match | **35%** | Technical and domain skills present in resume vs. required in JD |
| Experience Relevance | **30%** | Years, depth, and type of relevant work experience |
| Keyword Similarity | **20%** | Presence of important JD keywords and phrases in resume |
| Education Alignment | **15%** | Degree, field, and level vs. JD expectations |

**Gemini is prompted to return strictly structured JSON:**

```json
{
  "candidateName": "Akash Vishwakarma",
  "score": 92,
  "matchedSkills": ["React.js", "Next.js", "Node.js", "MongoDB", "REST APIs"],
  "missingSkills": ["PostgreSQL", "Docker"],
  "experienceRelevance": "high",
  "educationAlignment": "strong",
  "summary": "Strong MERN stack profile with production deployment experience and hackathon achievements.",
  "topStrength": "Production-deployed full-stack applications with real users",
  "criticalGap": "No PostgreSQL or containerisation experience mentioned"
}
```

The `responseParser` validates all fields and applies safe defaults — malformed responses never crash the pipeline. A **model fallback chain** (`gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-2.5-flash-preview`) with exponential backoff retry ensures maximum reliability.

---

## 🗂️ Project Structure

```
my-app/
│
├── app/
│   ├── api/                              ← All backend logic (Next.js Route Handlers)
│   │   ├── upload/
│   │   │   └── route.js                 ← POST: validate, buffer files, create session
│   │   ├── analyze/
│   │   │   └── route.js                 ← POST: parse + score + rank via SSE stream
│   │   └── results/
│   │       └── [sessionId]/
│   │           └── route.js             ← GET: return ranked candidate results
│   │
│   ├── components/
│   │   ├── upload/
│   │   │   ├── ResumeDropzone.jsx       ← Drag-and-drop multi-file upload
│   │   │   └── JDInputPanel.jsx         ← JD text/file input + real-time skill detection
│   │   │
│   │   ├── results/
│   │   │   ├── ResultsDashboard.jsx     ← Main results container (workspace + table views)
│   │   │   ├── CandidateTable.jsx       ← Sortable/searchable database table view
│   │   │   ├── CandidateSidePanel.jsx   ← Sliding detail panel with full candidate profile
│   │   │   ├── ExportButton.jsx         ← CSV + Excel export
│   │   │   ├── ScoreBar.jsx             ← Animated score progress bar
│   │   │   └── SkillBadge.jsx           ← Matched/missing skill pill components
│   │   │
│   │   └── shared/
│   │       ├── LoadingScreen.jsx        ← SSE-connected pipeline progress UI
│   │       ├── ErrorBanner.jsx          ← Dismissible error display
│   │       ├── SearchBar.jsx            ← Candidate filter input
│   │       └── SortControls.jsx         ← Sort by score/name controls
│   │
│   ├── lib/                             ← Core business logic (pure JS modules)
│   │   ├── sessionStore.js              ← Global in-memory Map, TTL, auto-cleanup
│   │   ├── fileValidator.js             ← MIME type + size + batch validation
│   │   ├── fileParser.js                ← PDF (pdf-parse) + DOCX (mammoth) extraction
│   │   ├── promptBuilder.js             ← Structured, grounded Gemini prompt
│   │   ├── responseParser.js            ← JSON parse + field validation + safe defaults
│   │   ├── scoringService.js            ← Gemini API + model fallback + retry logic
│   │   └── rankingService.js            ← Sort by score, assign ranks, merge metadata
│   │
│   ├── globals.css                      ← Tailwind v4 + custom animations + scrollbar
│   ├── layout.js                        ← Root layout + metadata
│   └── page.js                          ← Main state machine: Upload → Loading → Results
│
├── .env.local.example                   ← Environment variable template
├── next.config.mjs                      ← serverExternalPackages for pdf-parse/mammoth
├── postcss.config.mjs                   ← Tailwind v4 PostCSS config
├── jsconfig.json                        ← @ path alias
└── package.json
```

---

## ⚙️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router, SSR + API Routes) | 16.2.6 |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS | v4 |
| **Icons** | Lucide React | 0.470.0 |
| **Animation** | Framer Motion | 11.x |
| **AI / LLM** | Google Gemini (via `@google/generative-ai`) | 0.24.x |
| **PDF Parsing** | pdf-parse | 2.4.x |
| **DOCX Parsing** | mammoth | 1.12.x |
| **Session Store** | In-memory Map (server singleton) | — |
| **Export** | SheetJS (xlsx) | 0.18.x |
| **ID Generation** | uuid | 14.x |
| **Deployment** | Vercel | — |
| **Runtime** | Node.js | 20 LTS |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v20 LTS** (v25+ not supported — use `nvm use 20`)
- A free Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/TechWithAkash/resume-rank-ai.git
cd resume-rank-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get a free API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 4. Remove the pdf-parse test bloat (speeds up first compile from 2min → 10s)

```bash
rm -rf node_modules/pdf-parse/test
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏭 Production Build

```bash
npm run build
npm run start
```

---

## ☁️ Deploy to Vercel

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import from GitHub
3. Add environment variable: `GEMINI_API_KEY = your_key`
4. Click **Deploy** — Vercel auto-detects Next.js

**Live deployment:** [https://resume-rank-ai-zeta.vercel.app](https://resume-rank-ai-zeta.vercel.app)

---

## 🔌 API Reference

### `POST /api/upload`

Accepts `multipart/form-data`. Validates and buffers all files. Returns a `sessionId`.

| Field | Type | Required | Description |
|---|---|---|---|
| `resumes` | `File[]` | Yes | 1–50 resume files (PDF/DOC/DOCX, max 5MB each) |
| `jd` | `string` | Conditional | Job description as plain text |
| `jdFile` | `File` | Conditional | Job description as file |

**Response `200`:**
```json
{
  "sessionId": "uuid-v4",
  "status": "ready",
  "totalResumes": 4,
  "files": [{ "filename": "akash.pdf", "sizeBytes": 245000 }]
}
```

---

### `POST /api/analyze`

Accepts `{ sessionId }`. Parses and scores all resumes. Returns a **Server-Sent Events stream**.

**SSE Event types:**

| Event | Payload | Description |
|---|---|---|
| `start` | `{ total }` | Analysis pipeline initiated |
| `parsing` | `{ index, total, filename }` | File being parsed |
| `parsing_complete` | `{ total }` | All files parsed |
| `scoring` | `{ index, total, filename }` | Resume being scored by Gemini |
| `progress` | `{ processed, total, filename, score, name }` | One resume scored |
| `ranking` | — | Final ranking in progress |
| `complete` | `{ sessionId, total }` | All candidates ranked |
| `error` | `{ message }` | Pipeline error |

---

### `GET /api/results/:sessionId`

Returns the complete ranked candidate list.

**Response `200`:**
```json
{
  "status": "complete",
  "sessionId": "uuid-v4",
  "totalCount": 4,
  "candidates": [
    {
      "rank": 1,
      "candidateName": "Akash Vishwakarma",
      "filename": "AKASH_VISHWAKARMA.pdf",
      "score": 92,
      "matchedSkills": ["React.js", "Next.js", "Node.js"],
      "missingSkills": ["PostgreSQL"],
      "experienceRelevance": "high",
      "educationAlignment": "strong",
      "summary": "Strong MERN stack profile with production deployment experience.",
      "topStrength": "Production-deployed full-stack applications",
      "criticalGap": "No PostgreSQL experience",
      "rawTextPreview": "AKASH VISHWAKARMA\n+91 869..."
    }
  ]
}
```

---

## 🛡️ Security & Edge Case Handling

- **MIME-type validation** — files validated by true content type, not just extension
- **Path traversal protection** — all filenames sanitised before any disk operations
- **File size limits** — 5MB per file, 25MB total per batch
- **Prompt injection prevention** — resume text isolated in clearly demarcated prompt section
- **Malformed JSON handling** — `responseParser` strips markdown fences, applies field defaults, clamps score 0–100
- **Gemini retry logic** — exponential backoff (1.5s → 3s → 6s) × 3 attempts per model
- **Model fallback chain** — `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-2.5-flash-preview`
- **Session TTL** — sessions auto-expire after 2 hours with automatic cleanup
- **Partial failure tolerance** — if 1 of 10 resumes fails to parse, the other 9 still score correctly
- **Scanned PDF detection** — image-only PDFs detected and flagged with a clear error message

---

## 📐 Assumptions

- Scanned PDFs (image-only, no text layer) cannot be parsed and display a `parse failed` status
- Resume text is truncated to **8,000 characters** before Gemini prompt construction — sufficient for all standard resumes while keeping token costs low
- Session data is stored **in-memory** (no database required). Sessions persist for 2 hours and are suitable for this assignment scope. MongoDB/PostgreSQL persistence can be added in `sessionStore.js` without changing any other file
- Gemini free tier supports ~60 RPM. Sequential scoring with 300ms gaps between calls keeps well within limits for batches up to 50 resumes

---

## 👨‍💻 Author

<div align="center">

**Akash Vishwakarma**

Full Stack Developer · SIES Graduate School of Technology, Navi Mumbai

[![GitHub](https://img.shields.io/badge/GitHub-TechWithAkash-181717?style=flat-square&logo=github)](https://github.com/TechWithAkash)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Akash_Vishwakarma-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/akash-vishwakarma)
[![Live App](https://img.shields.io/badge/Live_App-resume--rank--ai--zeta.vercel.app-7C3AED?style=flat-square)](https://resume-rank-ai-zeta.vercel.app/)

</div>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ for the **chitralai Full Stack Developer Internship Assignment** · May 2026

</div>
