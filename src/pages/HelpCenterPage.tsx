import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const faqs = [
  {
    q: 'How does AIAssist work?',
    a: 'AIAssist is a desktop AI assistant that can analyze your screen, answer questions, help with interviews, draft emails, and more. Use the popup overlay for quick interactions, or access settings for full account management.',
  },
  {
    q: 'How do I use Screen Analysis?',
    a: 'Click the "Analyze Screen" button in the popup. AIAssist will capture your screen (the overlay is invisible to screenshots) and provide intelligent analysis of whatever is on screen, whether it is a quiz, email, code, or document.',
  },
  {
    q: 'What is Interview mode?',
    a: 'Interview mode is designed to help you during interviews. It listens to the conversation, detects questions, and provides professional answers in real-time. Switch to Interview mode using the dropdown in the popup header.',
  },
  {
    q: 'Is AIAssist visible during screen sharing?',
    a: 'No. AIAssist uses native macOS APIs to make itself completely invisible to screen capture and screen sharing applications. Your overlay will not be seen by others.',
  },
  {
    q: 'How do I change the AI response language?',
    a: 'Go to Settings then Language. You can set both your input (transcription) language and the output language for AI responses. You can also enable auto-detect.',
  },
  {
    q: 'How is my data stored?',
    a: 'All your data is securely stored in the cloud using Supabase with Row Level Security. Only you can access your own data. You can delete your history or entire account at any time from the Profile page.',
  },
];

export default function HelpCenterPage() {
  const { user } = useAuth();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [issueType, setIssueType] = useState('bug');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSent, setIssueSent] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setContactLoading(true);
    await supabase.from('support_tickets').insert({
      user_id: user.id,
      type: 'contact',
      subject: contactSubject,
      message: contactMessage,
    });
    setContactLoading(false);
    setContactSent(true);
    setContactSubject('');
    setContactMessage('');
    setTimeout(() => setContactSent(false), 4000);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIssueLoading(true);
    await supabase.from('support_tickets').insert({
      user_id: user.id,
      type: issueType,
      subject: `Issue Report: ${issueType}`,
      message: issueDesc,
    });
    setIssueLoading(false);
    setIssueSent(true);
    setIssueDesc('');
    setTimeout(() => setIssueSent(false), 4000);
  };

  return (
    <div>
      <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Help Center</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px' }}>Find answers and get support</p>

      {/* FAQ */}
      <div style={{
        marginBottom: 24, borderRadius: 14,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>Frequently Asked Questions</h2>
        </div>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              style={{
                width: '100%', padding: '16px 24px', background: 'none', border: 'none',
                color: '#e5e7eb', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              {faq.q}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                style={{ transform: expandedIdx === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'all 0.2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {expandedIdx === idx && (
              <div style={{ padding: '0 24px 16px', color: '#9ca3af', fontSize: 13, lineHeight: 1.7 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div style={{
        marginBottom: 24, padding: 24, borderRadius: 14,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Contact Support</h2>
        {contactSent && (
          <div style={{
            padding: '10px 16px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontSize: 13,
          }}>Message sent! We will get back to you soon.</div>
        )}
        <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={contactSubject} onChange={e => setContactSubject(e.target.value)}
            placeholder="Subject" required
            style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 14, outline: 'none',
            }}
          />
          <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)}
            placeholder="Describe your issue or question..." required rows={4}
            style={{
              padding: '12px 16px', borderRadius: 10, resize: 'vertical',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button type="submit" disabled={contactLoading}
            style={{
              padding: '10px 24px', borderRadius: 10, alignSelf: 'flex-start',
              background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)',
              color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: contactLoading ? 'wait' : 'pointer',
              opacity: contactLoading ? 0.6 : 1,
            }}
          >{contactLoading ? 'Sending...' : 'Send Message'}</button>
        </form>
      </div>

      {/* Report Issue */}
      <div style={{
        padding: 24, borderRadius: 14,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Report an Issue</h2>
        {issueSent && (
          <div style={{
            padding: '10px 16px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontSize: 13,
          }}>Issue reported. Thank you for helping us improve!</div>
        )}
        <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['bug', 'feature', 'performance', 'other'].map(t => (
              <button key={t} type="button" onClick={() => setIssueType(t)}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, textTransform: 'capitalize',
                  background: issueType === t ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                  border: issueType === t ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: issueType === t ? '#60a5fa' : '#9ca3af', cursor: 'pointer',
                }}
              >{t}</button>
            ))}
          </div>
          <textarea value={issueDesc} onChange={e => setIssueDesc(e.target.value)}
            placeholder="Describe the issue in detail..." required rows={4}
            style={{
              padding: '12px 16px', borderRadius: 10, resize: 'vertical',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button type="submit" disabled={issueLoading}
            style={{
              padding: '10px 24px', borderRadius: 10, alignSelf: 'flex-start',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: 13, fontWeight: 600, cursor: issueLoading ? 'wait' : 'pointer',
              opacity: issueLoading ? 0.6 : 1,
            }}
          >{issueLoading ? 'Reporting...' : 'Report Issue'}</button>
        </form>
      </div>
    </div>
  );
}
