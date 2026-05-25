import { useState, useRef, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface InterviewChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: string;
  role: string;
}

// ── Eden AI key (same as resumeTailor.ts) ─────────────────────────────────────
const EDEN_AI_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODFlMzM1NzktMDgzMS00MmIxLWIzN2UtNGU5ODIzZmRjOWNjIiwidHlwZSI6ImFwaV90b2tlbiJ9.bMugmLgEFLlnaw-1meQv4uLF_95wXj0BRkzODP0rshw';

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://api.edenai.run/v3/llm/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${EDEN_AI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`AI error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── Quick action prompts ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: '💡 Suggest Answer', prompt: 'Give me a strong, structured answer to this interview question using the STAR method where applicable.' },
  { label: '📌 Key Points', prompt: 'What are the 3–5 key points I must cover in my answer to impress the interviewer?' },
  { label: '⚡ 30-sec Answer', prompt: 'Give me a concise 30-second answer I can say right now.' },
  { label: '🎯 Follow-up Qs', prompt: 'What follow-up questions might the interviewer ask after this? How should I prepare?' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function InterviewChatBot({ isOpen, onClose, currentQuestion, role }: InterviewChatBotProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: '0',
      role: 'assistant',
      content: `👋 Hi! I'm your AI interview coach. Ask me anything about answering questions for the **${role}** role, or tap a quick action below.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // When question changes, show a context update
  const prevQuestion = useRef('');
  useEffect(() => {
    if (currentQuestion && currentQuestion !== prevQuestion.current) {
      prevQuestion.current = currentQuestion;
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎙️ **New question detected:**\n\n"${currentQuestion}"\n\nUse the quick actions or ask me how to answer it!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentQuestion]);

  const buildSystemPrompt = useCallback(() =>
    `You are an expert AI interview coach helping a candidate during a live mock interview for a "${role}" position.
The current interview question is: "${currentQuestion || 'Not yet asked'}"
Your role:
- Provide concise, high-quality interview advice
- Use STAR method for behavioral questions
- Keep answers practical and immediately usable
- Be direct, structured, and encouraging
- Format with bullet points or numbered lists when helpful
Respond in 2–4 sentences unless asked for more detail.`,
    [role, currentQuestion]
  );

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const loadingMsg: ChatMsg = {
      id: Date.now().toString() + '_loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => !m.loading)
        .map(m => ({ role: m.role, content: m.content }));

      const aiText = await callAI([
        { role: 'system', content: buildSystemPrompt() },
        ...history,
        { role: 'user', content: text.trim() },
      ]);

      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? { ...m, content: aiText, loading: false }
            : m
        )
      );
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? { ...m, content: '⚠️ Could not get a response. Please try again.', loading: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [loading, messages, buildSystemPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // Render markdown-ish content (bold, bullets)
  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      // Bold **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
      );
      return (
        <span key={i} style={{ display: 'block', marginBottom: line.trim() === '' ? 6 : 0 }}>
          {rendered}
        </span>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 20,
      bottom: 100,
      width: 380,
      height: 520,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 20,
      overflow: 'hidden',
      background: 'rgba(15, 15, 25, 0.97)',
      border: '1px solid rgba(99,102,241,0.35)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)',
      backdropFilter: 'blur(24px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      animation: 'chatSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        .chat-input-box:focus { outline: none; border-color: rgba(99,102,241,0.6) !important; }
        .msg-copy-btn { opacity: 0; transition: opacity 0.15s; }
        .msg-bubble:hover .msg-copy-btn { opacity: 1; }
        .quick-btn:hover { background: rgba(99,102,241,0.25) !important; border-color: rgba(99,102,241,0.5) !important; }
        .send-btn:hover:not(:disabled) { background: rgba(110,115,255,1) !important; }
        .close-btn:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'rgba(99,102,241,0.12)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🤖</div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>AI Interview Coach</div>
            <div style={{ color: 'rgba(165,180,252,0.8)', fontSize: 11 }}>
              {loading ? 'Thinking...' : 'Ready to help'}
            </div>
          </div>
        </div>
        <button
          className="close-btn"
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 6,
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className="msg-bubble"
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              position: 'relative',
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '10px 13px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                : 'rgba(255,255,255,0.06)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: '#f1f5f9',
              fontSize: 13,
              lineHeight: 1.55,
            }}>
              {msg.loading ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#a5b4fc',
                      animation: `typingDot 1.2s ease-in-out infinite ${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              ) : (
                renderContent(msg.content)
              )}
            </div>
            {/* Copy button for assistant messages */}
            {msg.role === 'assistant' && !msg.loading && (
              <button
                className="msg-copy-btn"
                onClick={() => copyText(msg.content)}
                title="Copy"
                style={{
                  position: 'absolute', right: 0, top: -6,
                  width: 22, height: 22, border: 'none', borderRadius: 6,
                  background: 'rgba(99,102,241,0.4)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick Actions ── */}
      <div style={{
        padding: '8px 12px 4px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 6, flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        {QUICK_ACTIONS.map(a => (
          <button
            key={a.label}
            className="quick-btn"
            onClick={() => sendMessage(a.prompt)}
            disabled={loading}
            style={{
              padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1, transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '10px 12px 14px',
        display: 'flex', gap: 8, alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          className="chat-input-box"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask how to answer this question..."
          disabled={loading}
          rows={1}
          style={{
            flex: 1, resize: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '10px 13px', fontSize: 13,
            background: 'rgba(255,255,255,0.06)', color: '#f1f5f9',
            lineHeight: 1.5, maxHeight: 80, minHeight: 40,
            overflowY: 'auto', transition: 'border-color 0.15s',
            fontFamily: 'inherit',
          }}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: 12, border: 'none',
            background: loading || !input.trim() ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.9)',
            color: '#fff', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
