import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const MAX_DAILY_QUESTIONS = 5;

interface Message {
  role: 'interviewer' | 'answer';
  text: string;
  timestamp: Date;
}

interface InterviewContext {
  target_role?: string;
  company_name?: string;
  job_description?: string;
  resume?: string;
}

// Common interview questions by category
const questionBank = {
  behavioral: [
    "Tell me about a time you had to deal with a difficult team member. How did you handle it?",
    "Describe a situation where you had to meet a tight deadline. What was your approach?",
    "Give me an example of a time you showed leadership.",
    "Tell me about a time you failed at something. What did you learn?",
    "Describe a situation where you had to adapt to a significant change at work.",
    "Tell me about a time you went above and beyond for a project.",
    "How do you handle conflict in the workplace? Give me a specific example.",
    "Describe a time when you had to persuade someone to see things your way.",
  ],
  technical: [
    "Walk me through your approach to solving a complex technical problem you've faced recently.",
    "How do you stay current with the latest developments in your field?",
    "Tell me about the most challenging project you've worked on. What made it challenging?",
    "How do you approach debugging a difficult issue in production?",
    "Explain how you would design a system to handle millions of users.",
    "What's your approach to code reviews and maintaining code quality?",
  ],
  general: [
    "Why are you interested in this role?",
    "Where do you see yourself in 5 years?",
    "What's your greatest strength and how has it helped you professionally?",
    "What motivates you in your work?",
    "How do you prioritize tasks when you have multiple deadlines?",
    "Tell me about yourself and your professional background.",
    "What makes you the best candidate for this position?",
    "How do you handle feedback and criticism?",
  ],
  hr: [
    "What are your salary expectations?",
    "Why are you leaving your current job?",
    "What do you know about our company?",
    "How would your previous manager describe you?",
    "What's your ideal work environment?",
    "Do you prefer working independently or in a team?",
  ],
};

export default function MockInterviewPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionsUsedToday, setQuestionsUsedToday] = useState(0);
  const [interviewContext, setInterviewContext] = useState<InterviewContext>({});
  const [category, setCategory] = useState<'behavioral' | 'technical' | 'general' | 'hr'>('general');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const usedQuestionsRef = useRef<Set<string>>(new Set());

  // Load daily usage count
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('helplyai_mock_interview_usage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setQuestionsUsedToday(parsed.count);
      } else {
        localStorage.setItem('helplyai_mock_interview_usage', JSON.stringify({ date: today, count: 0 }));
      }
    }
  }, []);

  // Load interview context from Supabase
  useEffect(() => {
    if (!user) return;
    const loadContext = async () => {
      const { data } = await supabase
        .from('interview_context')
        .select('target_role, company_name, job_description, resume')
        .eq('user_id', user.id)
        .single();
      if (data) setInterviewContext(data);
    };
    loadContext();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newCount = questionsUsedToday + 1;
    setQuestionsUsedToday(newCount);
    localStorage.setItem('helplyai_mock_interview_usage', JSON.stringify({ date: today, count: newCount }));
  };

  const getRandomQuestion = useCallback((): string => {
    const pool = questionBank[category];
    const available = pool.filter(q => !usedQuestionsRef.current.has(q));
    const source = available.length > 0 ? available : pool;
    const question = source[Math.floor(Math.random() * source.length)];
    usedQuestionsRef.current.add(question);
    return question;
  }, [category]);

  const speakQuestion = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Pick a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Alex') || v.name.includes('Google'));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  };

  const askNextQuestion = async () => {
    if (questionsUsedToday >= MAX_DAILY_QUESTIONS) {
      setError(`You've reached your daily limit of ${MAX_DAILY_QUESTIONS} questions. Come back tomorrow!`);
      return;
    }

    setError('');
    setIsAsking(true);
    const question = getRandomQuestion();
    setCurrentQuestion(question);

    // Add to messages
    setMessages(prev => [...prev, { role: 'interviewer', text: question, timestamp: new Date() }]);
    incrementUsage();

    // Speak the question
    await speakQuestion(question);
    setIsAsking(false);
  };

  const startInterview = async () => {
    setIsInterviewing(true);
    setMessages([]);
    usedQuestionsRef.current.clear();

    // Welcome message
    const welcome = `Welcome to your mock interview${interviewContext.target_role ? ` for the ${interviewContext.target_role} role` : ''}${interviewContext.company_name ? ` at ${interviewContext.company_name}` : ''}. I'll be your interviewer today. Let's begin with your first question.`;
    setMessages([{ role: 'interviewer', text: welcome, timestamp: new Date() }]);
    await speakQuestion(welcome);

    // Ask first question
    await askNextQuestion();
  };

  const stopInterview = () => {
    window.speechSynthesis.cancel();
    setIsInterviewing(false);
    setIsSpeaking(false);
    setIsAsking(false);
    setCurrentQuestion('');
  };

  const getAnswer = async () => {
    if (!currentQuestion) return;
    setIsGenerating(true);
    setError('');

    try {
      const contextParts: string[] = [];
      if (interviewContext.target_role) contextParts.push(`Target Role: ${interviewContext.target_role}`);
      if (interviewContext.company_name) contextParts.push(`Company: ${interviewContext.company_name}`);
      if (interviewContext.job_description) contextParts.push(`Job Description: ${interviewContext.job_description.slice(0, 500)}`);
      if (interviewContext.resume) contextParts.push(`Resume highlights: ${interviewContext.resume.slice(0, 500)}`);

      const systemPrompt = `You are an expert interview coach. Generate a strong, concise answer to the interview question below. 
${contextParts.length > 0 ? `\nCandidate Context:\n${contextParts.join('\n')}` : ''}

Rules:
- Keep the answer under 150 words
- Use STAR method for behavioral questions (Situation, Task, Action, Result)
- Be specific and professional
- Sound natural, not robotic
- Include relevant experience if context is provided`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://helplyai.co',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Interview Question: "${currentQuestion}"\n\nGenerate a strong answer:` },
          ],
          max_tokens: 250,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('AI request failed');

      // Streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      // Add placeholder answer message
      setMessages(prev => [...prev, { role: 'answer', text: '●', timestamp: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const token = json.choices?.[0]?.delta?.content || '';
              if (token) {
                fullText += token;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'answer', text: fullText, timestamp: new Date() };
                  return updated;
                });
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      }

      if (!fullText) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'answer', text: 'Could not generate answer. Please try again.', timestamp: new Date() };
          return updated;
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate answer');
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.text === '●') updated.pop();
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const remainingQuestions = MAX_DAILY_QUESTIONS - questionsUsedToday;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>
          Mock Interview
        </h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
          Practice with AI-powered interview questions. Voice asks questions, AI generates perfect answers.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        padding: '14px 20px', borderRadius: 12,
        background: '#f9fafb', border: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: remainingQuestions > 0 ? '#22c55e' : '#ef4444',
          }} />
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
            {remainingQuestions} / {MAX_DAILY_QUESTIONS} questions remaining today
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <select
          value={category}
          onChange={e => setCategory(e.target.value as any)}
          disabled={isInterviewing}
          style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 13,
            border: '1px solid #d1d5db', background: '#fff', color: '#374151',
            cursor: 'pointer', fontWeight: 500,
          }}
        >
          <option value="general">General</option>
          <option value="behavioral">Behavioral</option>
          <option value="technical">Technical</option>
          <option value="hr">HR</option>
        </select>
      </div>

      {/* Interview context card */}
      {(interviewContext.target_role || interviewContext.company_name) && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.05))',
          border: '1px solid rgba(37,99,235,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ fontSize: 13, color: '#374151' }}>
            Interviewing for <strong>{interviewContext.target_role || 'General'}</strong>
            {interviewContext.company_name && <> at <strong>{interviewContext.company_name}</strong></>}
          </span>
        </div>
      )}

      {/* Main interview area */}
      <div style={{
        border: '1px solid #e5e7eb', borderRadius: 16,
        overflow: 'hidden', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Chat window */}
        <div style={{
          height: 420, overflowY: 'auto', padding: '24px 20px',
          background: '#fafafa',
        }}>
          {messages.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000', margin: '0 0 6px' }}>
                  Ready for your interview?
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, maxWidth: 360 }}>
                  Click "Start Interview" to begin. A voice will ask you questions and you can get AI-generated answers.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: msg.role === 'answer' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '14px 18px', borderRadius: 14,
                  background: msg.role === 'interviewer' ? '#fff' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  color: msg.role === 'interviewer' ? '#000' : '#fff',
                  border: msg.role === 'interviewer' ? '1px solid #e5e7eb' : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>
                    {msg.role === 'interviewer' ? '🎙 Interviewer' : '✨ AI Answer'}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Controls bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          background: '#fff',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {!isInterviewing ? (
            <button
              onClick={startInterview}
              disabled={remainingQuestions <= 0}
              style={{
                flex: 1, padding: '14px 24px', borderRadius: 12,
                background: remainingQuestions > 0 ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#d1d5db',
                border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: remainingQuestions > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                <path d="M19 10v2a7 7 0 01-14 0v-2"/>
              </svg>
              {remainingQuestions > 0 ? 'Start Interview' : 'Daily Limit Reached'}
            </button>
          ) : (
            <>
              {/* Get Answer button */}
              <button
                onClick={getAnswer}
                disabled={isGenerating || !currentQuestion || isAsking}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 12,
                  background: isGenerating ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
                  cursor: isGenerating || !currentQuestion || isAsking ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s', opacity: isAsking ? 0.5 : 1,
                }}
              >
                {isGenerating ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                    </svg>
                    Get Answer
                  </>
                )}
              </button>

              {/* Next Question button */}
              <button
                onClick={askNextQuestion}
                disabled={isAsking || isGenerating || remainingQuestions <= 0}
                style={{
                  padding: '14px 20px', borderRadius: 12,
                  background: '#f3f4f6', border: '1px solid #e5e7eb',
                  color: '#374151', fontSize: 14, fontWeight: 600,
                  cursor: isAsking || isGenerating || remainingQuestions <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                  opacity: isAsking || isGenerating ? 0.5 : 1,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="13 17 18 12 13 7"/>
                  <polyline points="6 17 11 12 6 7"/>
                </svg>
                Next
              </button>

              {/* Stop button */}
              <button
                onClick={stopInterview}
                style={{
                  padding: '14px 20px', borderRadius: 12,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: 3, height: 16, borderRadius: 2, background: '#2563eb',
                animation: `pulse ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>Interviewer is speaking...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10,
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Tips */}
      <div style={{
        marginTop: 24, padding: '20px 24px', borderRadius: 14,
        background: '#f9fafb', border: '1px solid #e5e7eb',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#000', margin: '0 0 12px' }}>
          💡 Tips for best results
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            'Set your Target Role in Dashboard for personalized answers',
            'Use headphones so you can hear the interviewer clearly',
            'Practice answering before clicking "Get Answer"',
            'Try all categories: Behavioral, Technical, HR, General',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#2563eb', fontSize: 12, marginTop: 2 }}>•</span>
              <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
