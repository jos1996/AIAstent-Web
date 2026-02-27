import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const faqs = [
  {
    q: 'How does HelplyAI work?',
    a: 'HelplyAI is a desktop AI assistant that can analyze your screen, answer questions, help with interviews, draft emails, and more. Use the popup overlay for quick interactions, or access settings for full account management. It runs natively on your Mac/Windows computer and uses AI to provide intelligent assistance.',
  },
  {
    q: 'How do I download and install HelplyAI?',
    a: 'Go to the Dashboard page and click "Download for Mac" or "Download for Windows". Download the installer, run it, and follow the installation prompts. Once installed, launch HelplyAI from your Applications folder (Mac) or Start Menu (Windows). Sign in with your account to get started.',
  },
  {
    q: 'How do I use Screen Analysis?',
    a: 'Click the "Analyze Screen" button in the popup overlay. HelplyAI will capture your screen (the overlay is invisible to screenshots) and provide intelligent analysis of whatever is on screen, whether it\'s a quiz, email, code, document, or any other content. The AI will analyze the content and provide relevant insights.',
  },
  {
    q: 'What is Chat mode and how do I use it?',
    a: 'Chat mode is the default mode for conversational interactions. Simply type or speak your question in the popup overlay, and HelplyAI will respond with helpful answers. You can ask about anything - coding help, writing assistance, general knowledge, or task guidance. Switch to Chat mode using the dropdown in the popup header.',
  },
  {
    q: 'What is Interview mode?',
    a: 'Interview mode is designed to help you during interviews. It listens to the conversation, detects questions, and provides professional answers in real-time. Switch to Interview mode using the dropdown in the popup header. The AI will analyze interview questions and suggest appropriate responses.',
  },
  {
    q: 'How do I use the Generate feature?',
    a: 'The Generate feature helps you create content like emails, documents, code, or text. Select "Generate" from the mode dropdown, describe what you want to create, and HelplyAI will generate professional content for you. You can specify the tone, length, and style of the generated content.',
  },
  {
    q: 'Is HelplyAI visible during screen sharing?',
    a: 'No. HelplyAI uses native macOS/Windows APIs to make itself completely invisible to screen capture and screen sharing applications. Your overlay will not be seen by others during Zoom, Teams, or any other screen sharing sessions.',
  },
  {
    q: 'How do I set up Reminders?',
    a: 'Go to Settings > Reminders. Click "New Reminder", enter a title, optional description, and set a due date/time. Click "Create" to save. You\'ll receive notifications when reminders are due. You can edit or delete reminders anytime from the Reminders page.',
  },
  {
    q: 'How do I change the AI response language?',
    a: 'Go to Settings > Language. You can set both your input (transcription) language and the output language for AI responses. Select from 16+ supported languages including English, Spanish, French, German, Hindi, Japanese, and more. You can also enable auto-detect to automatically detect your spoken language.',
  },
  {
    q: 'How do I view my usage history?',
    a: 'Go to Settings > History to view all your past interactions. You can search through your history, filter by type (Chat, Interview, Screen Analysis, Generated content), and delete individual items or clear all history. Your history is synced across devices.',
  },
  {
    q: 'What are the different subscription plans?',
    a: 'HelplyAI offers 4 plans: Free (7-day trial with limited daily usage), Weekly (₹540/week for short-term projects), Pro (₹1,710/month with unlimited features), and Pro Plus (₹7,200/year with maximum savings). All paid plans include unlimited chat, screen analysis, interview help, and generation features.',
  },
  {
    q: 'How do I upgrade my plan?',
    a: 'Go to Settings > Billing. Click "Subscribe" on the plan you want. You\'ll be redirected to Razorpay for secure payment. After successful payment, your plan will be upgraded immediately and you\'ll have access to all features. Your billing email will receive a confirmation.',
  },
  {
    q: 'How does billing work?',
    a: 'All payments are processed securely through Razorpay. Weekly plans renew every 7 days, Monthly plans renew every 30 days, and Yearly plans renew every 365 days. You can view your next billing date and payment history in Settings > Billing. Cancel anytime - no questions asked.',
  },
  {
    q: 'What happens when my free trial ends?',
    a: 'After your 7-day free trial ends, you\'ll need to upgrade to a paid plan to continue using HelplyAI. Your data and settings will be preserved. You can choose any plan that fits your needs - Weekly, Pro, or Pro Plus. Upgrade anytime from Settings > Billing.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel anytime. Go to Settings > Billing and downgrade to the Free plan. You\'ll retain access to paid features until the end of your current billing period. No refunds for partial periods, but you can use the service until your subscription expires.',
  },
  {
    q: 'How do I update my profile information?',
    a: 'Go to Settings > Profile. You can update your full name, display name, username, bio, phone, location, website, timezone, and profile picture. Click "Save All Changes" to update your profile. Changes sync across all your devices immediately.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Settings > Profile, scroll to the "Password & Security" section. Enter your new password (minimum 8 characters) and click "Update". Your password will be changed immediately and you\'ll need to use the new password for future logins.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All your data is securely stored in the cloud using Supabase with Row Level Security (RLS). Only you can access your own data. We use industry-standard encryption for data in transit and at rest. You can delete your history or entire account at any time from the Profile page.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings > Profile, scroll to the "Delete Account" section. Click "Delete my account", confirm the action, and your account and all associated data will be permanently deleted. This action cannot be undone, so make sure you want to proceed.',
  },
  {
    q: 'What should I do if I encounter a bug?',
    a: 'Please report bugs using the "Report an Issue" form below. Select "bug" as the issue type, describe the problem in detail (what you were doing, what happened, what you expected), and submit. Our team will investigate and fix the issue as soon as possible.',
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
    if (!user) {
      alert('Please sign in to submit a support request.');
      return;
    }
    setContactLoading(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      ticket_type: 'contact',
      subject: contactSubject,
      message: contactMessage,
      user_email: user.email || '',
      status: 'open',
      priority: 'normal',
    });
    setContactLoading(false);
    
    if (error) {
      console.error('Error submitting contact form:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Failed to send message: ${error.message || 'Unknown error'}. Please try again.`);
      return;
    }
    
    setContactSent(true);
    setContactSubject('');
    setContactMessage('');
    setTimeout(() => setContactSent(false), 4000);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a bug report.');
      return;
    }
    setIssueLoading(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      ticket_type: 'bug',
      bug_category: issueType,
      bug_description: issueDesc,
      subject: `${issueType.charAt(0).toUpperCase() + issueType.slice(1)} Report`,
      user_email: user.email || '',
      status: 'open',
      priority: issueType === 'bug' ? 'high' : 'normal',
    });
    setIssueLoading(false);
    
    if (error) {
      console.error('Error submitting bug report:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Failed to submit report: ${error.message || 'Unknown error'}. Please try again.`);
      return;
    }
    
    setIssueSent(true);
    setIssueDesc('');
    setTimeout(() => setIssueSent(false), 4000);
  };

  return (
    <div>
      <h1 style={{ color: '#000000', fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Help Center</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>Find answers and get support</p>

      {/* FAQ */}
      <div style={{
        marginBottom: 24, borderRadius: 12,
        background: '#ffffff', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ color: '#000000', fontSize: 16, fontWeight: 700, margin: 0 }}>Frequently Asked Questions</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Click on any question to see the answer</p>
        </div>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              style={{
                width: '100%', padding: '16px 24px', background: 'none', border: 'none',
                color: '#000000', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {faq.q}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                style={{ transform: expandedIdx === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'all 0.2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {expandedIdx === idx && (
              <div style={{ padding: '0 24px 20px', color: '#374151', fontSize: 13, lineHeight: 1.8, background: '#f9fafb' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div style={{
        marginBottom: 24, padding: 28, borderRadius: 12,
        background: '#ffffff', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{ color: '#000000', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Contact Support</h2>
        {contactSent && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 16,
            background: '#d1fae5', border: '1px solid #86efac',
            color: '#065f46', fontSize: 14, fontWeight: 500,
          }}>Message sent! We will get back to you soon.</div>
        )}
        <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={contactSubject} onChange={e => setContactSubject(e.target.value)}
            placeholder="Subject" required
            style={{
              padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
            }}
          />
          <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)}
            placeholder="Describe your issue or question..." required rows={4}
            style={{
              padding: '14px 16px', borderRadius: 10, resize: 'vertical',
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontFamily: 'inherit', fontWeight: 500,
            }}
          />
          <button type="submit" disabled={contactLoading}
            style={{
              padding: '12px 28px', borderRadius: 10, alignSelf: 'flex-start',
              background: '#2563eb', border: 'none',
              color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: contactLoading ? 'wait' : 'pointer',
              opacity: contactLoading ? 0.6 : 1,
            }}
          >{contactLoading ? 'Sending...' : 'Send Message'}</button>
        </form>
      </div>

      {/* Report Issue */}
      <div style={{
        padding: 28, borderRadius: 12,
        background: '#ffffff', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{ color: '#000000', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Report an Issue</h2>
        {issueSent && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 16,
            background: '#d1fae5', border: '1px solid #86efac',
            color: '#065f46', fontSize: 14, fontWeight: 500,
          }}>Issue reported. Thank you for helping us improve!</div>
        )}
        <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['bug', 'feature', 'performance', 'other'].map(t => (
              <button key={t} type="button" onClick={() => setIssueType(t)}
                style={{
                  padding: '10px 16px', borderRadius: 8, fontSize: 13, textTransform: 'capitalize',
                  background: issueType === t ? '#2563eb' : '#f3f4f6',
                  border: 'none',
                  color: issueType === t ? '#ffffff' : '#6b7280', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                }}
              >{t}</button>
            ))}
          </div>
          <textarea value={issueDesc} onChange={e => setIssueDesc(e.target.value)}
            placeholder="Describe the issue in detail..." required rows={4}
            style={{
              padding: '14px 16px', borderRadius: 10, resize: 'vertical',
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontFamily: 'inherit', fontWeight: 500,
            }}
          />
          <button type="submit" disabled={issueLoading}
            style={{
              padding: '12px 28px', borderRadius: 10, alignSelf: 'flex-start',
              background: '#fee2e2', border: '2px solid #fca5a5',
              color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: issueLoading ? 'wait' : 'pointer',
              opacity: issueLoading ? 0.6 : 1, transition: 'all 0.2s',
            }}
          >{issueLoading ? 'Reporting...' : 'Report Issue'}</button>
        </form>
      </div>
    </div>
  );
}
