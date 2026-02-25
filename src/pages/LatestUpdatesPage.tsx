import { useState } from 'react';

interface UpdateEntry {
  version: string;
  date: string;
  type: 'feature' | 'bugfix' | 'improvement';
  title: string;
  description: string;
}

const updates: UpdateEntry[] = [
  {
    version: '0.1.0',
    date: 'Feb 13, 2026',
    type: 'feature',
    title: 'Setup Reminder via Chatbot',
    description: 'You can now set reminders directly from the AI chatbot. Just click "Setup Reminder" and tell the bot what to remind you about. Supports natural language like "remind me to call John tomorrow at 3pm".',
  },
  {
    version: '0.1.0',
    date: 'Feb 13, 2026',
    type: 'feature',
    title: 'Reminder Popup Notifications',
    description: 'Gentle reminder popups now appear at 10 minutes, 5 minutes, and at the exact due time. Popups work across all screens and can be dismissed individually.',
  },
  {
    version: '0.1.0',
    date: 'Feb 13, 2026',
    type: 'feature',
    title: 'Persistent Chat History',
    description: 'Chat messages are now saved and restored when you navigate away and come back. Messages persist for up to 1 week. Use the pen icon to start a new chat.',
  },
  {
    version: '0.1.0',
    date: 'Feb 13, 2026',
    type: 'improvement',
    title: 'Timezone-Aware Reminders',
    description: 'Reminders now respect your local timezone. Whether you are in India, USA, or anywhere else, "tomorrow at 3pm" means 3pm in your timezone.',
  },
  {
    version: '0.1.0',
    date: 'Feb 13, 2026',
    type: 'feature',
    title: 'Central Users Table',
    description: 'A new centralized users table powers all user data. Profile, preferences, billing, and activity are now seamlessly linked.',
  },
  {
    version: '0.1.0',
    date: 'Feb 13, 2026',
    type: 'bugfix',
    title: 'Migration Fixes',
    description: 'Fixed SQL migration errors including missing "status" column and username NOT NULL constraint issues.',
  },
  {
    version: '0.1.0',
    date: 'Feb 12, 2026',
    type: 'feature',
    title: 'Multi-Language Support',
    description: 'AI assistant now supports 14+ languages for both input (speech-to-text) and output. Configure in Settings > Language.',
  },
  {
    version: '0.1.0',
    date: 'Feb 12, 2026',
    type: 'feature',
    title: 'Interview Mode',
    description: 'Dedicated interview mode with JD/resume context. The AI acts as a real-time interview assistant, extracting questions and generating candidate-style answers.',
  },
  {
    version: '0.1.0',
    date: 'Feb 11, 2026',
    type: 'feature',
    title: 'Screen Analysis',
    description: 'Analyze any content on your screen. The AI captures a screenshot and provides answers, summaries, or code fixes based on what it sees.',
  },
];

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  feature: { label: 'New Feature', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  bugfix: { label: 'Bug Fix', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  improvement: { label: 'Improvement', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
};

export default function LatestUpdatesPage() {
  const [filter, setFilter] = useState<'all' | 'feature' | 'bugfix' | 'improvement'>('all');

  const filtered = filter === 'all' ? updates : updates.filter(u => u.type === filter);

  // Group by date
  const grouped: Record<string, UpdateEntry[]> = {};
  for (const u of filtered) {
    if (!grouped[u.date]) grouped[u.date] = [];
    grouped[u.date].push(u);
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#000000', marginBottom: 4 }}>Latest Updates</h1>
      <p style={{ fontSize: 14, color: '#000000', marginBottom: 24 }}>See what's new in HelplyAI. New features, bug fixes, and improvements.</p>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {(['all', 'feature', 'bugfix', 'improvement'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
              border: filter === f ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: filter === f ? '#60a5fa' : '#000000',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'All' : f === 'bugfix' ? 'Bug Fixes' : f === 'feature' ? 'Features' : 'Improvements'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            {/* Date header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#3b82f6', border: '2px solid rgba(59,130,246,0.3)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#000000', letterSpacing: 0.3 }}>{date}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginLeft: 22 }}>
              {entries.map((entry, i) => {
                const tc = typeConfig[entry.type];
                return (
                  <div
                    key={i}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: tc.color, background: tc.bg,
                        padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {tc.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#000000' }}>v{entry.version}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#000000', marginBottom: 4 }}>{entry.title}</div>
                    <div style={{ fontSize: 13, color: '#000000', lineHeight: 1.6 }}>{entry.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#000000', fontSize: 14 }}>
          No updates found for this filter.
        </div>
      )}
    </div>
  );
}
