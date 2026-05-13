import { useState, useEffect, useRef } from 'react';

const MAX_DAILY_QUESTIONS = 5;
const TOTAL_QUESTIONS_PER_SESSION = 5;

// Role-based question sets — first question is always "Tell me about yourself"
const roleQuestions: Record<string, string[]> = {
  'Software Engineer': [
    "Tell me about yourself and your experience as a software engineer.",
    "What's the most complex technical problem you've solved? Walk me through your approach.",
    "How do you ensure code quality in your projects?",
    "Describe a time when you had to work under a tight deadline. How did you manage it?",
    "Where do you see yourself in 5 years as a software engineer?",
  ],
  'Product Manager': [
    "Tell me about yourself and your product management experience.",
    "How do you prioritize features when you have limited resources?",
    "Describe a product you launched from scratch. What was your process?",
    "How do you handle disagreements between engineering and design teams?",
    "Give me an example of a data-driven decision you made for a product.",
  ],
  'Data Scientist': [
    "Tell me about yourself and your data science background.",
    "Walk me through a machine learning project you've worked on end-to-end.",
    "How do you handle missing or messy data in a real-world dataset?",
    "Explain a complex analysis you did to a non-technical stakeholder.",
    "What metrics would you use to evaluate the success of a recommendation system?",
  ],
  'Designer': [
    "Tell me about yourself and your design experience.",
    "Walk me through your design process for a recent project.",
    "How do you handle feedback that contradicts your design decisions?",
    "Describe a time when user research changed the direction of your design.",
    "How do you balance business goals with user needs in your designs?",
  ],
  'Marketing Manager': [
    "Tell me about yourself and your marketing background.",
    "Describe a campaign you led that exceeded its goals. What made it successful?",
    "How do you measure ROI on marketing initiatives?",
    "Tell me about a time you had to pivot your marketing strategy quickly.",
    "How do you stay ahead of trends in the marketing industry?",
  ],
  'Business Analyst': [
    "Tell me about yourself and your experience as a business analyst.",
    "How do you gather and prioritize requirements from multiple stakeholders?",
    "Describe a situation where your analysis led to a significant business decision.",
    "How do you handle conflicting requirements from different departments?",
    "Walk me through how you would approach analyzing a new business process.",
  ],
  'Sales Executive': [
    "Tell me about yourself and your sales experience.",
    "Describe your approach to building relationships with new clients.",
    "Tell me about a deal you closed that seemed impossible at first.",
    "How do you handle rejection in sales?",
    "What's your strategy for meeting quarterly targets consistently?",
  ],
  'HR Manager': [
    "Tell me about yourself and your HR experience.",
    "How do you handle conflicts between employees?",
    "Describe a time you improved employee retention at your company.",
    "What's your approach to building a positive company culture?",
    "How do you ensure fairness and compliance in the hiring process?",
  ],
};

export default function MockInterviewPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questionsUsedToday, setQuestionsUsedToday] = useState(0);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newCount = questionsUsedToday + 1;
    setQuestionsUsedToday(newCount);
    localStorage.setItem('helplyai_mock_interview_usage', JSON.stringify({ date: today, count: newCount }));
  };

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Google')
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  };

  const startInterview = async () => {
    if (!selectedRole) return;
    setIsInterviewing(true);
    setIsComplete(false);
    setCurrentQuestionIndex(0);

    // Speak intro
    await speakText(`Let's begin your mock interview for the ${selectedRole} role. Here is your first question.`);

    // Ask first question
    const questions = roleQuestions[selectedRole];
    const q = questions[0];
    setCurrentQuestion(q);
    setCurrentQuestionIndex(0);
    incrementUsage();
    await speakText(q);
    setWaitingForAnswer(true);
  };

  const nextQuestion = async () => {
    const questions = roleQuestions[selectedRole];
    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= questions.length) {
      setIsComplete(true);
      setWaitingForAnswer(false);
      await speakText("That concludes your mock interview. Great job! You can review your answers in the Helply AI chatbot.");
      return;
    }

    setWaitingForAnswer(false);
    setCurrentQuestionIndex(nextIdx);
    const q = questions[nextIdx];
    setCurrentQuestion(q);
    incrementUsage();
    await speakText(q);
    setWaitingForAnswer(true);
  };

  const stopInterview = () => {
    window.speechSynthesis.cancel();
    setIsInterviewing(false);
    setIsSpeaking(false);
    setWaitingForAnswer(false);
    setCurrentQuestion('');
    setCurrentQuestionIndex(0);
    setIsComplete(false);
  };

  const remainingToday = MAX_DAILY_QUESTIONS - questionsUsedToday;
  const roles = Object.keys(roleQuestions);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Title */}
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#000', margin: '0 0 6px' }}>
        Mock Interview
      </h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px' }}>
        AI interviewer asks questions via voice. Use the Helply AI chatbot to get answers.
      </p>

      {/* Instructions Card */}
      <div style={{
        padding: '20px 24px', borderRadius: 14, marginBottom: 28,
        background: '#f0f9ff', border: '1px solid #bae6fd',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0369a1', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
          How it works
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { step: '1', text: 'Select your role below and click "Start Interview"' },
            { step: '2', text: 'Open the Helply AI desktop chatbot and drag it next to this window' },
            { step: '3', text: 'A voice will ask you interview questions one by one (5 questions total)' },
            { step: '4', text: 'After each question, click "Get Answer" in the Helply AI chatbot to see the ideal answer' },
            { step: '5', text: 'Click "Next Question" here when you\'re ready for the next one' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: '#2563eb', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>{item.step}</div>
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, paddingTop: 2 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily limit */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24,
        padding: '10px 16px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: remainingToday > 0 ? '#22c55e' : '#ef4444',
        }} />
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
          {remainingToday} / {MAX_DAILY_QUESTIONS} questions remaining today
        </span>
      </div>

      {/* Interview Panel */}
      {!isInterviewing ? (
        /* ── Setup: Role selection + Start ── */
        <div style={{
          padding: '32px', borderRadius: 16,
          border: '1px solid #e5e7eb', background: '#fff',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#000', margin: '0 0 6px' }}>
            Select Your Role
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
            Choose the role you're interviewing for. 5 questions will be asked based on your selection.
          </p>

          {/* Role grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
            marginBottom: 28, textAlign: 'left',
          }}>
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: selectedRole === role ? 'rgba(37,99,235,0.08)' : '#f9fafb',
                  border: selectedRole === role ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  color: selectedRole === role ? '#2563eb' : '#374151',
                  fontSize: 14, fontWeight: selectedRole === role ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Start button */}
          <button
            onClick={startInterview}
            disabled={!selectedRole || remainingToday <= 0}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 12,
              background: selectedRole && remainingToday > 0
                ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#e5e7eb',
              border: 'none', color: '#fff', fontSize: 16, fontWeight: 600,
              cursor: selectedRole && remainingToday > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {remainingToday <= 0 ? 'Daily Limit Reached' : 'Start Interview'}
          </button>
        </div>
      ) : (
        /* ── Active Interview ── */
        <div style={{
          padding: '28px 32px', borderRadius: 16,
          border: '1px solid #e5e7eb', background: '#fff',
        }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS_PER_SESSION}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
              background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
            }}>
              {selectedRole}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 2, background: '#e5e7eb', marginBottom: 28 }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
              width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS_PER_SESSION) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Current question display */}
          {!isComplete && (
            <div style={{
              padding: '20px 24px', borderRadius: 12, marginBottom: 24,
              background: '#f9fafb', border: '1px solid #e5e7eb',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Current Question
              </div>
              <div style={{ fontSize: 16, color: '#000', fontWeight: 500, lineHeight: 1.6 }}>
                {currentQuestion}
              </div>
            </div>
          )}

          {/* Audio indicator */}
          {isSpeaking && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)',
            }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{
                    width: 3, height: 14 + Math.random() * 6, borderRadius: 2, background: '#2563eb',
                    animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>Speaking...</span>
            </div>
          )}

          {/* Completed message */}
          {isComplete && (
            <div style={{
              padding: '24px', borderRadius: 12, marginBottom: 24,
              background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#16a34a', margin: '0 0 6px' }}>Interview Complete!</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                Great job! You've completed all 5 questions. Check your Helply AI chatbot for answers.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {!isComplete && (
              <button
                onClick={nextQuestion}
                disabled={isSpeaking}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 12,
                  background: isSpeaking ? '#e5e7eb' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
                  cursor: isSpeaking ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {currentQuestionIndex === 0 && !waitingForAnswer ? 'Start' : 'Next Question'}
              </button>
            )}
            <button
              onClick={stopInterview}
              style={{
                padding: '14px 20px', borderRadius: 12,
                background: isComplete ? '#2563eb' : '#fef2f2',
                border: isComplete ? 'none' : '1px solid #fecaca',
                color: isComplete ? '#fff' : '#dc2626',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isComplete ? 'Done' : 'End Interview'}
            </button>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
