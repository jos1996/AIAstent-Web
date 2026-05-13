import { useState, useEffect, useRef, useCallback } from 'react';

const MAX_DAILY_QUESTIONS = 5;
const TOTAL_QUESTIONS_PER_SESSION = 5;

const PRESET_ROLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UI/UX Designer',
  'Marketing Manager', 'Business Analyst', 'Sales Executive', 'HR Manager',
  'DevOps Engineer', 'Finance Analyst', 'Project Manager', 'Full Stack Developer',
];

const generateQuestionsForRole = (role: string): string[] => [
  `Tell me about yourself and your experience as a ${role}.`,
  `What's the most challenging situation you've faced in your ${role} career? How did you handle it?`,
  `How do you stay up to date with the latest trends and skills relevant to a ${role}?`,
  `Describe a time you worked in a team to achieve a difficult goal. What was your contribution?`,
  `Where do you see yourself in 5 years as a ${role}?`,
];

export default function MockInterviewPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questionsUsedToday, setQuestionsUsedToday] = useState(0);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeRole = customRole.trim() || selectedRole;
  const remainingToday = MAX_DAILY_QUESTIONS - questionsUsedToday;

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('helplyai_mock_interview_usage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) setQuestionsUsedToday(parsed.count);
      else localStorage.setItem('helplyai_mock_interview_usage', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const incrementUsage = useCallback(() => {
    const today = new Date().toDateString();
    setQuestionsUsedToday(prev => {
      const next = prev + 1;
      localStorage.setItem('helplyai_mock_interview_usage', JSON.stringify({ date: today, count: next }));
      return next;
    });
  }, []);

  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Google US English'));
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const startInterview = async () => {
    if (!activeRole) return;
    const qs = generateQuestionsForRole(activeRole);
    setQuestions(qs);
    setIsInterviewing(true);
    setIsComplete(false);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(qs[0]);
    incrementUsage();
    await speakText(`Let's begin your mock interview for the ${activeRole} role.`);
    await speakText(qs[0]);
    setWaitingForNext(true);
  };

  const nextQuestion = async () => {
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= questions.length) {
      setIsComplete(true);
      setWaitingForNext(false);
      await speakText("That's all! Great job completing your mock interview. Check Helply AI chatbot for the answers.");
      return;
    }
    setWaitingForNext(false);
    setCurrentQuestionIndex(nextIdx);
    setCurrentQuestion(questions[nextIdx]);
    incrementUsage();
    await speakText(questions[nextIdx]);
    setWaitingForNext(true);
  };

  const stopInterview = () => {
    window.speechSynthesis.cancel();
    setIsInterviewing(false);
    setIsSpeaking(false);
    setWaitingForNext(false);
    setCurrentQuestion('');
    setCurrentQuestionIndex(-1);
    setIsComplete(false);
    setQuestions([]);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Mock Interview
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          AI interviewer speaks questions aloud. Open the Helply AI chatbot to get ideal answers in real time.
        </p>
      </div>

      {/* ── Flowchart Instructions ── */}
      {!isInterviewing && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            How it works
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
            {[
              { icon: '🎯', title: 'Pick a Role', desc: 'Select or type your job role below' },
              { icon: '▶️', title: 'Start', desc: 'Click Start Interview' },
              { icon: '🔊', title: 'Listen', desc: 'Voice asks questions one by one' },
              { icon: '💬', title: 'Get Answer', desc: 'Use Helply AI chatbot for answers' },
              { icon: '➡️', title: 'Next', desc: 'Click Next for the next question' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
                <div style={{
                  flex: 1, padding: '14px 12px', borderRadius: 10,
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: 6,
                }}>
                  <div style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: '#d1d5db', fontSize: 16 }}>›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Daily limit badge ── */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 22,
        padding: '6px 14px', borderRadius: 20,
        background: remainingToday > 0 ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${remainingToday > 0 ? '#bbf7d0' : '#fecaca'}`,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: remainingToday > 0 ? '#22c55e' : '#ef4444' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: remainingToday > 0 ? '#16a34a' : '#dc2626' }}>
          {remainingToday} / {MAX_DAILY_QUESTIONS} questions left today
        </span>
      </div>

      {/* ── Setup Panel ── */}
      {!isInterviewing ? (
        <div style={{ padding: '28px', borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff' }}>

          {/* Role chips */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Select a role
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESET_ROLES.map(role => {
                const active = selectedRole === role && !customRole.trim();
                return (
                  <button
                    key={role}
                    onClick={() => { setSelectedRole(role); setCustomRole(''); }}
                    style={{
                      padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                      background: active ? '#2563eb' : '#f3f4f6',
                      border: active ? '1.5px solid #2563eb' : '1.5px solid transparent',
                      color: active ? '#fff' : '#374151',
                      cursor: 'pointer', transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>or type your role</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Free text input */}
          <input
            type="text"
            value={customRole}
            onChange={e => { setCustomRole(e.target.value); if (e.target.value) setSelectedRole(''); }}
            placeholder="e.g. Frontend Engineer, Scrum Master, Cloud Architect..."
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14,
              border: customRole ? '1.5px solid #2563eb' : '1.5px solid #e5e7eb',
              outline: 'none', color: '#111', background: '#fafafa',
              boxSizing: 'border-box', transition: 'border 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#fff'; }}
            onBlur={e => { if (!customRole) e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; }}
          />

          {/* Selected role preview */}
          {activeRole && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
              Interviewing as: <strong style={{ color: '#2563eb' }}>{activeRole}</strong>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={startInterview}
            disabled={!activeRole || remainingToday <= 0}
            style={{
              width: '100%', marginTop: 24, padding: '15px 0', borderRadius: 12,
              background: activeRole && remainingToday > 0 ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#e5e7eb',
              border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: activeRole && remainingToday > 0 ? 'pointer' : 'not-allowed',
              letterSpacing: '-0.01em', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { if (activeRole && remainingToday > 0) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {remainingToday <= 0 ? '🚫 Daily Limit Reached' : '🎙 Start Interview'}
          </button>
        </div>
      ) : (
        /* ── Active Interview Panel ── */
        <div style={{ padding: '28px 32px', borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff' }}>

          {/* Top row: progress text + role badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              {isComplete ? 'Interview Complete' : `Question ${currentQuestionIndex + 1} of ${TOTAL_QUESTIONS_PER_SESSION}`}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
              background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.2)',
            }}>
              {activeRole}
            </span>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {Array.from({ length: TOTAL_QUESTIONS_PER_SESSION }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 5, borderRadius: 3,
                background: i <= currentQuestionIndex ? 'linear-gradient(90deg, #2563eb, #7c3aed)' : '#e5e7eb',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>

          {/* ── Speaking / Waiting animation ── */}
          {!isComplete && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '32px 24px', marginBottom: 24, borderRadius: 14,
              background: isSpeaking ? 'rgba(37,99,235,0.04)' : '#f9fafb',
              border: `1px solid ${isSpeaking ? 'rgba(37,99,235,0.15)' : '#e5e7eb'}`,
              transition: 'all 0.3s',
            }}>
              {/* Animated waveform */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 16, height: 40 }}>
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} style={{
                    width: 4, borderRadius: 4,
                    background: isSpeaking ? '#2563eb' : '#d1d5db',
                    height: isSpeaking ? undefined : '8px',
                    animation: isSpeaking ? `wave ${0.5 + (i % 3) * 0.15}s ease-in-out infinite alternate` : 'none',
                    minHeight: 8,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: isSpeaking ? '#2563eb' : '#9ca3af', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {isSpeaking ? '🔊 Interviewer is speaking...' : '⏳ Waiting for your answer'}
              </div>
              {/* Question text */}
              <div style={{ fontSize: 16, color: '#111', fontWeight: 500, lineHeight: 1.7, textAlign: 'center', maxWidth: 560 }}>
                {currentQuestion}
              </div>
            </div>
          )}

          {/* Tip when waiting */}
          {waitingForNext && !isSpeaking && !isComplete && (
            <div style={{
              padding: '11px 16px', borderRadius: 10, marginBottom: 20,
              background: '#fffbeb', border: '1px solid #fde68a',
              fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>💡</span>
              <span>Open <strong>Helply AI chatbot</strong> and click <strong>"Get Answer"</strong> to see the ideal answer, then come back and click Next.</span>
            </div>
          )}

          {/* Completion card */}
          {isComplete && (
            <div style={{
              padding: '32px', borderRadius: 14, marginBottom: 24,
              background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.05))',
              border: '1px solid rgba(37,99,235,0.15)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Interview Complete!</h3>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                Great job! You answered all {TOTAL_QUESTIONS_PER_SESSION} questions.<br/>
                Check the Helply AI chatbot for all your AI-generated answers.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {!isComplete ? (
              <button
                onClick={nextQuestion}
                disabled={isSpeaking}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  background: isSpeaking ? '#e5e7eb' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: isSpeaking ? '#9ca3af' : '#fff',
                  cursor: isSpeaking ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isSpeaking ? (
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[1,2,3].map(i => <span key={i} style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#9ca3af', animation: `dot ${0.6 + i*0.2}s ease-in-out infinite alternate` }} />)}
                    Speaking...
                  </span>
                ) : (
                  <>
                    {currentQuestionIndex < TOTAL_QUESTIONS_PER_SESSION - 1 ? 'Next Question →' : 'Finish Interview'}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={stopInterview}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                }}
              >
                Start New Interview
              </button>
            )}
            {!isComplete && (
              <button
                onClick={stopInterview}
                style={{
                  padding: '14px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                End
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes wave {
          from { height: 6px; }
          to { height: 32px; }
        }
        @keyframes dot {
          from { transform: translateY(0); opacity: 0.4; }
          to { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
