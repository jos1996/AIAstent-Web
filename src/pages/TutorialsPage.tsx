interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: null;
  comingSoon: boolean;
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started with HelplyAI',
    description: 'Learn the basics: how to open the chatbot, send messages, and use voice input for hands-free interaction.',
    duration: '5 min',
    category: 'Basics',
    thumbnail: null,
    comingSoon: true,
  },
  {
    id: '2',
    title: 'Screen Analysis Deep Dive',
    description: 'See how HelplyAI can analyze your screen content, solve problems, summarize documents, and fix code.',
    duration: '8 min',
    category: 'Features',
    thumbnail: null,
    comingSoon: true,
  },
  {
    id: '3',
    title: 'Interview Mode Masterclass',
    description: 'Set up JD and resume context, enable real-time transcription, and get instant interview answers.',
    duration: '10 min',
    category: 'Features',
    thumbnail: null,
    comingSoon: true,
  },
  {
    id: '4',
    title: 'Setting Up Reminders via Chat',
    description: 'Use natural language to create reminders. Learn how the AI parses your input and saves to the database.',
    duration: '4 min',
    category: 'Features',
    thumbnail: null,
    comingSoon: true,
  },
  {
    id: '5',
    title: 'Multi-Language Configuration',
    description: 'Configure input and output languages, enable auto-detect, and use HelplyAI in 14+ languages.',
    duration: '6 min',
    category: 'Settings',
    thumbnail: null,
    comingSoon: true,
  },
  {
    id: '6',
    title: 'Managing Your Profile & Preferences',
    description: 'Customize your profile, set a username, configure preferences, and manage your account.',
    duration: '5 min',
    category: 'Settings',
    thumbnail: null,
    comingSoon: true,
  },
  {
    id: '7',
    title: 'Keyboard Shortcuts & Power Tips',
    description: 'Master global shortcuts, quick actions, and hidden features to use HelplyAI like a pro.',
    duration: '7 min',
    category: 'Advanced',
    thumbnail: null,
    comingSoon: true,
  },
  {
    id: '8',
    title: 'Cross-Platform Setup (macOS & Windows)',
    description: 'Install and configure HelplyAI on both macOS and Windows. Covers platform-specific features and tips.',
    duration: '6 min',
    category: 'Setup',
    thumbnail: null,
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
  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f3f4f6', marginBottom: 4 }}>Tutorials</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
        Video guides to help you get the most out of HelplyAI. More tutorials coming soon!
      </p>

      {/* Video grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {tutorials.map(tutorial => {
          const catColor = categoryColors[tutorial.category] || '#6b7280';
          return (
            <div
              key={tutorial.id}
              style={{
                borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                transition: 'all 0.2s',
                cursor: tutorial.comingSoon ? 'default' : 'pointer',
                opacity: tutorial.comingSoon ? 0.75 : 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Thumbnail placeholder */}
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {tutorial.comingSoon ? (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#6b7280',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '6px 14px',
                    borderRadius: 20,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}>
                    Coming Soon
                  </span>
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(59,130,246,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
                {/* Duration badge */}
                <span style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#d1d5db',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}>
                  {tutorial.duration}
                </span>
              </div>

              {/* Info */}
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
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 6, lineHeight: 1.4 }}>
                  {tutorial.title}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
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
