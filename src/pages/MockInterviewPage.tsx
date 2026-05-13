import { useState, useEffect, useRef, useCallback } from 'react';

const MAX_DAILY_QUESTIONS = 5;
const TOTAL_QUESTIONS_PER_SESSION = 5;

const PRESET_ROLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UI/UX Designer',
  'Marketing Manager', 'Business Analyst', 'Sales Executive', 'HR Manager',
  'DevOps Engineer', 'Finance Analyst', 'Project Manager', 'Full Stack Developer',
];

const ROLE_QUESTIONS: Record<string, string[]> = {
  'Software Engineer': [
    "Walk me through how you would design a scalable REST API from scratch.",
    "How do you approach debugging a production issue that only happens intermittently?",
    "Explain the difference between horizontal and vertical scaling. When would you use each?",
    "How do you ensure code quality in a fast-moving team? What processes do you rely on?",
    "Describe a time you refactored a large codebase. What was your approach and what was the outcome?",
    "How do you handle technical debt in a product that needs constant new features?",
  ],
  'Product Manager': [
    "How do you decide which features to build next when you have 10 competing priorities?",
    "Walk me through how you wrote a product requirements document for a complex feature.",
    "How do you measure whether a feature you shipped was actually successful?",
    "Describe a situation where data and user feedback were contradicting each other. What did you do?",
    "How do you work with engineering when they say your proposed timeline is unrealistic?",
    "How do you handle stakeholders who keep changing requirements mid-sprint?",
  ],
  'Data Scientist': [
    "How would you approach building a churn prediction model from scratch?",
    "What steps do you take when your model performs well on training data but poorly in production?",
    "How do you explain a complex machine learning model's output to a non-technical business team?",
    "Describe how you would design an A/B test to evaluate a new recommendation algorithm.",
    "How do you handle class imbalance in a classification problem?",
    "Walk me through how you would clean and prepare a messy real-world dataset for modeling.",
  ],
  'UI/UX Designer': [
    "Walk me through your end-to-end design process for a recent project you're proud of.",
    "How do you balance business goals with user needs when they conflict?",
    "How do you conduct user research when you have limited time and budget?",
    "Describe a time your design was challenged by developers or stakeholders. How did you handle it?",
    "How do you validate that a design solution actually solves the user's problem?",
    "How do you approach designing for accessibility from the start?",
  ],
  'Marketing Manager': [
    "How do you build a go-to-market strategy for a new product launch?",
    "Walk me through a campaign you ran end-to-end. What was the goal, execution, and result?",
    "How do you measure ROI across different marketing channels?",
    "How do you decide how to allocate a limited marketing budget across channels?",
    "Describe a time a campaign didn't perform as expected. What did you do?",
    "How do you keep messaging consistent across multiple markets or audiences?",
  ],
  'Business Analyst': [
    "How do you gather and validate requirements from multiple conflicting stakeholders?",
    "Walk me through how you documented and mapped a complex business process.",
    "How do you prioritize which business problems to focus on when everything feels urgent?",
    "Describe a time your analysis directly influenced a major business decision.",
    "How do you handle a situation where stakeholders reject your recommendations?",
    "What techniques do you use to identify root causes of business performance issues?",
  ],
  'Sales Executive': [
    "Walk me through your typical process from initial outreach to closing a deal.",
    "How do you handle a prospect who is interested but keeps stalling the decision?",
    "Describe the most complex deal you closed. What made it difficult and how did you win it?",
    "How do you build trust with a new client in the first 30 days?",
    "How do you handle objections around pricing without immediately discounting?",
    "How do you manage a large pipeline and decide where to spend your time?",
  ],
  'HR Manager': [
    "How do you design a recruitment process that reduces bias and improves quality of hire?",
    "Walk me through how you handled a serious conflict between two team members or departments.",
    "How do you measure employee engagement and what do you do when it's declining?",
    "Describe a time you had to deliver difficult feedback to a senior leader.",
    "How do you build a culture of continuous feedback in an organization that resists it?",
    "How do you handle a situation where a manager is underperforming but leadership likes them?",
  ],
  'DevOps Engineer': [
    "How would you design a CI/CD pipeline for a microservices-based application?",
    "Walk me through how you would investigate and resolve a P0 production outage.",
    "How do you approach infrastructure as code and what tools do you prefer?",
    "How do you balance deployment speed with system reliability and rollback safety?",
    "Describe how you would set up monitoring and alerting for a new service.",
    "How do you manage secrets and credentials securely across environments?",
  ],
  'Finance Analyst': [
    "Walk me through how you would build a financial model to evaluate a new business opportunity.",
    "How do you identify and communicate financial risks to non-finance stakeholders?",
    "Describe a time your financial analysis led to a significant business decision.",
    "How do you approach variance analysis when actuals differ significantly from budget?",
    "How do you ensure the accuracy and integrity of financial reports under tight deadlines?",
    "How would you evaluate whether the company should build versus buy a software tool?",
  ],
  'Project Manager': [
    "How do you keep a project on track when scope, timeline, and budget are all under pressure?",
    "Walk me through how you managed a project that had multiple dependencies across teams.",
    "How do you handle a team member who is consistently missing deadlines?",
    "Describe how you communicate project status and risks to senior stakeholders.",
    "How do you manage scope creep without damaging your relationship with the client?",
    "What does your project kickoff process look like and why?",
  ],
  'Full Stack Developer': [
    "How do you decide when to optimize for backend performance versus frontend experience?",
    "Walk me through how you would architect a full stack feature from database to UI.",
    "How do you approach security vulnerabilities in a web application you maintain?",
    "Describe how you handle state management in a complex frontend application.",
    "How do you design APIs that are easy for frontend teams to consume?",
    "How do you ensure your deployments don't break existing functionality?",
  ],
};

const generateQuestionsForRole = (role: string): string[] => {
  const bank = ROLE_QUESTIONS[role];
  if (bank) {
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_QUESTIONS_PER_SESSION);
  }
  // Fallback for custom roles — role-specific generic questions
  return [
    `What does a typical day look like in your ${role} position and how do you prioritize your work?`,
    `What is the most technically challenging aspect of being a ${role} and how do you tackle it?`,
    `How do you collaborate with cross-functional teams as a ${role}?`,
    `Describe a significant problem you solved in your ${role} role. What was your approach?`,
    `How do you measure success in your ${role} position and what metrics do you track?`,
  ];
};

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

      {/* ── Step-by-step Instructions ── */}
      {!isInterviewing && (
        <div style={{ marginBottom: 28, padding: '24px', borderRadius: 16, background: '#fff', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span style={{ letterSpacing: '0.05em', textTransform: 'uppercase', color: '#374151' }}>Before you start — follow these steps</span>
          </div>

          {[
            {
              num: '1',
              icon: '💻',
              title: 'Open Helply AI App on your computer',
              desc: 'Launch the Helply AI desktop app you installed. Drag and snap it to the side of this browser window so both are visible at the same time.',
              tag: 'Setup',
              tagColor: '#6366f1',
            },
            {
              num: '2',
              icon: '🎯',
              title: 'Select your role below',
              desc: 'Pick your job role from the chips below, or type a custom role (e.g. Cloud Architect, Scrum Master). This sets the interview questions.',
              tag: 'On this page',
              tagColor: '#2563eb',
            },
            {
              num: '3',
              icon: '🎙',
              title: 'Click "Start Interview"',
              desc: 'A voice will speak your first question aloud. Listen carefully — just like a real interview!',
              tag: 'On this page',
              tagColor: '#2563eb',
            },
            {
              num: '4',
              icon: '💬',
              title: 'Click "Get Answer" in the Helply AI chatbot',
              desc: 'Switch to the Helply AI app and click "Get Answer". The AI will show you the ideal answer for the question that was just asked.',
              tag: 'In Helply AI App',
              tagColor: '#059669',
            },
            {
              num: '5',
              icon: '➡️',
              title: 'Click "Next Question" to continue',
              desc: 'Come back here and click "Next Question" when ready. The voice will ask the next question and you repeat the process.',
              tag: 'On this page',
              tagColor: '#2563eb',
            },
          ].map((step, i, arr) => (
            <div key={i}>
              {/* Step row */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Left: number + connector line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                    flexShrink: 0,
                  }}>{step.num}</div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 2, height: 32, background: 'linear-gradient(to bottom, #c7d2fe, #e5e7eb)', margin: '4px 0' }} />
                  )}
                </div>
                {/* Right: content */}
                <div style={{ paddingBottom: i < arr.length - 1 ? 4 : 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{step.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{step.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: `${step.tagColor}15`, color: step.tagColor,
                      border: `1px solid ${step.tagColor}30`,
                      whiteSpace: 'nowrap',
                    }}>{step.tag}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 0 26px', lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
              {/* Arrow between steps */}
              {i < arr.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 17, marginBottom: 4 }}>
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                    <path d="M5 0v10M1 7l4 4 4-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
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
