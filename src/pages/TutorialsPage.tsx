interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  youtubeId?: string;
  comingSoon: boolean;
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'How Interview Mode Works',
    description: 'See Interview Mode in action — real-time transcription, AI answers during live interviews, and how to set up your JD and resume context.',
    duration: 'Watch',
    category: 'Features',
    youtubeId: 'ZxO1OHEdxw4',
    comingSoon: false,
  },
  {
    id: '2',
    title: 'How General Mode Works',
    description: 'Explore General Mode — use HelplyAI for everyday tasks like writing, coding help, screen analysis, and AI chat beyond interviews.',
    duration: 'Watch',
    category: 'Features',
    youtubeId: 'FgKdax1TnM0',
    comingSoon: false,
  },
  {
    id: '3',
    title: 'Windows Setup Guide',
    description: 'Step-by-step guide to install and configure HelplyAI on Windows. Covers download, installation, and first launch.',
    duration: 'Watch',
    category: 'Setup',
    youtubeId: 'DvdSQMR_hsY',
    comingSoon: false,
  },
  {
    id: '4',
    title: 'Job Search Feature Walkthrough',
    description: 'Learn how to use the built-in job search to find roles, save jobs, track applications, and match your resume to listings.',
    duration: 'Watch',
    category: 'Features',
    youtubeId: 'dhEGDlpOUbg',
    comingSoon: false,
  },
  {
    id: '5',
    title: 'Dashboard Overview',
    description: 'A full tour of the HelplyAI dashboard — navigate features, manage settings, download the app, and get started quickly.',
    duration: 'Watch',
    category: 'Basics',
    youtubeId: 'qnJ7UpRNR40',
    comingSoon: false,
  },
  {
    id: '6',
    title: 'Setting Up Reminders via Chat',
    description: 'Use natural language to create reminders. Learn how the AI parses your input and saves to the database.',
    duration: '4 min',
    category: 'Features',
    comingSoon: true,
  },
  {
    id: '7',
    title: 'Multi-Language Configuration',
    description: 'Configure input and output languages, enable auto-detect, and use HelplyAI in 14+ languages.',
    duration: '6 min',
    category: 'Settings',
    comingSoon: true,
  },
  {
    id: '8',
    title: 'Managing Your Profile & Preferences',
    description: 'Customize your profile, set a username, configure preferences, and manage your account.',
    duration: '5 min',
    category: 'Settings',
    comingSoon: true,
  },
  {
    id: '9',
    title: 'Screen Analysis Deep Dive',
    description: 'See how HelplyAI can analyze your screen content, solve problems, summarize documents, and fix code.',
    duration: '8 min',
    category: 'Features',
    comingSoon: true,
  },
  {
    id: '10',
    title: 'Keyboard Shortcuts & Power Tips',
    description: 'Master global shortcuts, quick actions, and hidden features to use HelplyAI like a pro.',
    duration: '7 min',
    category: 'Advanced',
    comingSoon: true,
  },
];

const categoryColors: Record<string, string> = {
  Basics: '#3b82f6',
  Features: '#8b5cf6',
  Settings: '#22c55e',
  Advanced: '#f59e0b',
  Setup: '#06b6d4',
};

export default function TutorialsPage() {
  const live = tutorials.filter(t => !t.comingSoon);
  const coming = tutorials.filter(t => t.comingSoon);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#000', marginBottom: 4 }}>Tutorials</h1>
      <p style={{ fontSize: 14, color: '#555', marginBottom: 32 }}>
        Video guides to help you get the most out of HelplyAI. More tutorials coming soon!
      </p>

      {/* Live Videos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 40,
      }}>
        {live.map(tutorial => {
          const catColor = categoryColors[tutorial.category] || '#6b7280';
          return (
            <div
              key={tutorial.id}
              style={{
                borderRadius: 14,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
              }}
            >
              {/* YouTube embed */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${tutorial.youtubeId}?rel=0&modestbranding=1`}
                  title={tutorial.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: catColor,
                    background: `${catColor}18`, padding: '3px 8px', borderRadius: 4,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {tutorial.category}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6, lineHeight: 1.4 }}>
                  {tutorial.title}
                </div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                  {tutorial.description}
                </div>
                <a
                  href={`https://youtu.be/${tutorial.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginTop: 12, fontSize: 12, fontWeight: 600, color: '#ff0000',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  Watch on YouTube
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 16 }}>Coming Soon</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {coming.map(tutorial => {
          const catColor = categoryColors[tutorial.category] || '#6b7280';
          return (
            <div
              key={tutorial.id}
              style={{
                borderRadius: 14,
                background: '#fafafa',
                border: '1px solid rgba(0,0,0,0.06)',
                overflow: 'hidden',
                opacity: 0.75,
              }}
            >
              {/* Placeholder thumbnail */}
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  background: 'rgba(0,0,0,0.35)', padding: '5px 12px',
                  borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Coming Soon
                </span>
                <span style={{
                  position: 'absolute', bottom: 8, right: 8,
                  fontSize: 11, fontWeight: 600, color: '#fff',
                  background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4,
                }}>
                  {tutorial.duration}
                </span>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: catColor,
                    background: `${catColor}18`, padding: '2px 8px', borderRadius: 4,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {tutorial.category}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6, lineHeight: 1.4 }}>
                  {tutorial.title}
                </div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                  {tutorial.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
