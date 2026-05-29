import './globals.css';

export const metadata = {
  title:       'ResumeRank AI — Professional ATS Candidate Screener',
  description: 'A premium, high-density Applicant Tracking System that parses, scores, and ranks candidates against Job Descriptions in real-time.',
  keywords:    ['resume screening', 'AI hiring', 'candidate ranking', 'ATS', 'recruitment'],
  authors:     [{ name: 'Akash Vishwakarma' }],
  openGraph: {
    title:       'ResumeRank AI',
    description: 'AI-powered resume screening and candidate ranking',
    type:        'website',
  },
};

export const viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#09090b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}