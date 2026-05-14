import { useState, useEffect, useRef, useCallback } from 'react';

const MAX_DAILY_QUESTIONS = 5;
const TOTAL_QUESTIONS_PER_SESSION = 5;

// ── Voice helpers — always Maya (female) ────────────────────────────────────
// Priority-ordered female voice name fragments across macOS, Windows, Chrome, Firefox
const FEMALE_VOICE_FRAGMENTS = [
  'Samantha', 'Karen', 'Victoria', 'Moira', 'Tessa', 'Fiona', 'Veena',
  'Google US English', // Chrome macOS — typically female by default
  'Microsoft Zira', 'Microsoft Eva', 'Microsoft Jenny', 'Microsoft Aria',
  'Jenny', 'Aria', 'Sonia', 'Susan', 'Linda', 'Emma', 'Amy', 'Joanna',
  'en-US-Jenny', 'en-US-Aria', 'en-GB-Sonia', 'en-AU-Natasha',
  'female', 'Female',
];

// Voices to explicitly exclude (known male)
const MALE_VOICE_FRAGMENTS = [
  'Daniel', 'Alex', 'Fred', 'Tom', 'Gordon', 'Lee', 'Reed', 'Ralph',
  'Google UK English Male', 'Microsoft David', 'Microsoft Mark', 'Microsoft Guy',
  'Guy', 'David', 'Mark', 'Ryan', 'en-US-Guy', 'male', 'Male',
];

function getFemaleVoice(): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. Explicit female match
  const explicit = voices.find(v =>
    FEMALE_VOICE_FRAGMENTS.some(f => v.name.includes(f))
  );
  if (explicit) return explicit;

  // 2. Any en-US voice that isn't explicitly male
  const enUS = voices.find(v =>
    v.lang === 'en-US' && !MALE_VOICE_FRAGMENTS.some(f => v.name.includes(f))
  );
  if (enUS) return enUS;

  // 3. Any English voice that isn't explicitly male
  const enAny = voices.find(v =>
    v.lang.startsWith('en') && !MALE_VOICE_FRAGMENTS.some(f => v.name.includes(f))
  );
  if (enAny) return enAny;

  // 4. Absolute fallback — first available voice
  return voices[0] || null;
}

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
  const [isIntro, setIsIntro] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questionsUsedToday, setQuestionsUsedToday] = useState(0);
  const aiName = 'Maya'; // Always Maya — female voice
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeRole = customRole.trim() || selectedRole;
  const remainingToday = MAX_DAILY_QUESTIONS - questionsUsedToday;

  // Pre-load voices on mount so they are ready when interview starts
  useEffect(() => {
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('helplyai_mock_interview_usage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) setQuestionsUsedToday(parsed.count);
      else localStorage.setItem('helplyai_mock_interview_usage', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  // Meeting timer
  useEffect(() => {
    if (isInterviewing && !isComplete) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isInterviewing) setElapsedSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isInterviewing, isComplete]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

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
      utterance.rate = 0.9;
      utterance.pitch = 1.2;  // Higher pitch reinforces female sound on any fallback voice
      utterance.volume = 1.0;
      const voice = getFemaleVoice();
      if (voice) utterance.voice = voice;
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
    setIsIntro(true);
    setWaitingForNext(false);
    setCurrentQuestionIndex(-1);
    setCurrentQuestion('');

    // Introduction — Maya always
    await speakText(`Hi! I'm Maya, your AI interviewer from Helply AI.`);
    await speakText(`Today, I'll be taking your mock interview for the ${activeRole} role.`);
    await speakText(`We'll go through ${TOTAL_QUESTIONS_PER_SESSION} questions. Take your time to answer each one fully. When you're done with your answer, click Next Question and I'll move on.`);
    await speakText(`Alright, let's get started!`);

    setIsIntro(false);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(qs[0]);
    incrementUsage();
    await speakText(`Question 1. ${qs[0]}`);
    setWaitingForNext(true);
  };

  const nextQuestion = async () => {
    if (isSpeaking) return;
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= questions.length) {
      setWaitingForNext(false);
      setIsComplete(true);
      await speakText(`That's a wrap! You've completed all ${TOTAL_QUESTIONS_PER_SESSION} questions. Great job! Open the Helply AI chatbot to review ideal answers for each question.`);
      return;
    }
    setWaitingForNext(false);
    setCurrentQuestionIndex(nextIdx);
    setCurrentQuestion(questions[nextIdx]);
    incrementUsage();
    await speakText(`Question ${nextIdx + 1}. ${questions[nextIdx]}`);
    setWaitingForNext(true);
  };

  const stopInterview = () => {
    window.speechSynthesis.cancel();
    setIsInterviewing(false);
    setIsSpeaking(false);
    setIsIntro(false);
    setWaitingForNext(false);
    setCurrentQuestion('');
    setCurrentQuestionIndex(-1);
    setIsComplete(false);
    setQuestions([]);
  };

  // ── ACTIVE INTERVIEW — Full-screen dark meeting room ────────────────────────
  if (isInterviewing) {
    const avatarInitial = aiName === 'Maya' ? 'M' : 'S';
    const statusLabel = isIntro
      ? `${aiName} is introducing...`
      : isComplete
        ? 'Interview Complete'
        : isSpeaking
          ? `${aiName} is speaking...`
          : 'Your turn to answer';

    return (
      <div className="mock-meeting-room" style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'linear-gradient(160deg, #0d0d0d 0%, #111827 60%, #0a0a1a 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}>
        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isComplete ? '#6b7280' : '#22c55e',
              boxShadow: isComplete ? 'none' : '0 0 8px #22c55e',
              animation: (!isComplete && !isSpeaking && waitingForNext) ? 'livePulse 2s ease-in-out infinite' : 'none',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 600 }}>
              Helply AI — Mock Interview
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'rgba(37,99,235,0.25)', color: '#93c5fd',
              border: '1px solid rgba(37,99,235,0.35)',
            }}>{activeRole}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'monospace' }}>
              {formatTime(elapsedSeconds)}
            </span>
            {!isComplete && (
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                {currentQuestionIndex >= 0 ? `Q${currentQuestionIndex + 1}/${TOTAL_QUESTIONS_PER_SESSION}` : 'Intro'}
              </span>
            )}
          </div>
        </div>

        {/* ── Main meeting area ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 24px 0',
          overflow: 'hidden',
        }}>

          {/* AI Avatar with pulse rings */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            {/* Outer pulse ring 1 */}
            <div style={{
              position: 'absolute', inset: -28, borderRadius: '50%',
              border: `2px solid ${isSpeaking ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`,
              animation: isSpeaking ? 'ring1 1.4s ease-out infinite' : 'none',
            }} />
            {/* Outer pulse ring 2 */}
            <div style={{
              position: 'absolute', inset: -14, borderRadius: '50%',
              border: `2px solid ${isSpeaking ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}`,
              animation: isSpeaking ? 'ring2 1.4s ease-out infinite 0.3s' : 'none',
            }} />
            {/* Glow bg */}
            <div style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              background: isSpeaking
                ? 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
              transition: 'all 0.4s',
            }} />
            {/* Avatar circle */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `3px solid ${isSpeaking ? 'rgba(167,139,250,0.8)' : 'rgba(99,102,241,0.4)'}`,
              boxShadow: isSpeaking
                ? '0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.3)'
                : '0 0 20px rgba(99,102,241,0.2)',
              transition: 'all 0.3s',
              position: 'relative', zIndex: 1,
            }}>
              <span style={{ fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>
                {avatarInitial}
              </span>
            </div>
          </div>

          {/* AI Name + status */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{aiName}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 14px', borderRadius: 20,
              background: isComplete
                ? 'rgba(107,114,128,0.2)'
                : isSpeaking || isIntro
                  ? 'rgba(99,102,241,0.2)'
                  : 'rgba(34,197,94,0.15)',
              border: `1px solid ${isComplete ? 'rgba(107,114,128,0.3)' : isSpeaking || isIntro ? 'rgba(99,102,241,0.4)' : 'rgba(34,197,94,0.3)'}`,
            }}>
              {(isSpeaking || isIntro) && !isComplete && (
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      width: 3, borderRadius: 3,
                      background: '#818cf8',
                      animation: `waveBar ${0.4 + (i % 4) * 0.12}s ease-in-out infinite alternate`,
                      minHeight: 4,
                    }} />
                  ))}
                </div>
              )}
              {!isSpeaking && !isIntro && !isComplete && (
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#4ade80',
                      animation: `dotBounce ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
                    }} />
                  ))}
                </div>
              )}
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: isComplete ? '#9ca3af' : isSpeaking || isIntro ? '#a5b4fc' : '#86efac',
              }}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Question card */}
          {!isIntro && !isComplete && currentQuestion && (
            <div style={{
              maxWidth: 680, width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '20px 28px',
              backdropFilter: 'blur(16px)',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: 'rgba(99,102,241,0.25)', color: '#a5b4fc',
                }}>
                  Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS_PER_SESSION}
                </span>
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.92)', fontSize: 16, fontWeight: 500,
                lineHeight: 1.75, margin: 0,
              }}>
                {currentQuestion}
              </p>
            </div>
          )}

          {/* Intro loading state */}
          {isIntro && (
            <div style={{
              maxWidth: 480, textAlign: 'center',
              color: 'rgba(255,255,255,0.5)', fontSize: 14,
            }}>
              {aiName} is introducing the interview session...
            </div>
          )}

          {/* Completion card */}
          {isComplete && (
            <div style={{
              maxWidth: 520, width: '100%', textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '32px 28px',
              backdropFilter: 'blur(16px)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                Interview Complete!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                You answered all {TOTAL_QUESTIONS_PER_SESSION} questions in {formatTime(elapsedSeconds)}.<br />
                Open the <strong style={{ color: '#a5b4fc' }}>Helply AI chatbot</strong> to review ideal answers.
              </p>
              <button
                onClick={stopInterview}
                style={{
                  padding: '12px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                }}
              >
                Back to Setup
              </button>
            </div>
          )}

          {/* Progress bar */}
          {!isIntro && !isComplete && (
            <div style={{ display: 'flex', gap: 6, maxWidth: 680, width: '100%', marginTop: 8 }}>
              {Array.from({ length: TOTAL_QUESTIONS_PER_SESSION }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 3,
                  background: i <= currentQuestionIndex
                    ? 'linear-gradient(90deg, #6366f1, #a78bfa)'
                    : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.4s',
                }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom controls ── */}
        {!isComplete && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            padding: '20px 24px 28px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
          }}>
            {/* Next Question */}
            <button
              onClick={nextQuestion}
              disabled={isSpeaking || isIntro}
              style={{
                padding: '13px 32px', borderRadius: 50, fontSize: 14, fontWeight: 700,
                background: isSpeaking || isIntro
                  ? 'rgba(255,255,255,0.08)'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                border: isSpeaking || isIntro ? '1px solid rgba(255,255,255,0.12)' : 'none',
                color: isSpeaking || isIntro ? 'rgba(255,255,255,0.35)' : '#fff',
                cursor: isSpeaking || isIntro ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: isSpeaking || isIntro ? 'none' : '0 4px 20px rgba(99,102,241,0.5)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {currentQuestionIndex >= TOTAL_QUESTIONS_PER_SESSION - 1
                ? 'Finish Interview'
                : isSpeaking || isIntro ? 'Please wait...' : 'Next Question'}
            </button>

            {/* End meeting */}
            <button
              onClick={stopInterview}
              style={{
                padding: '13px 24px', borderRadius: 50, fontSize: 14, fontWeight: 700,
                background: '#dc2626', border: 'none', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b91c1c'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#dc2626'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z"/>
              </svg>
              End Meeting
            </button>
          </div>
        )}

        {/* ── Animations ── */}
        <style>{`
          @keyframes ring1 {
            0%   { transform: scale(1);   opacity: 0.8; }
            100% { transform: scale(1.35); opacity: 0; }
          }
          @keyframes ring2 {
            0%   { transform: scale(1);   opacity: 0.6; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          @keyframes waveBar {
            from { height: 4px;  }
            to   { height: 22px; }
          }
          @keyframes dotBounce {
            from { transform: translateY(0);   opacity: 0.5; }
            to   { transform: translateY(-5px); opacity: 1;   }
          }
          @keyframes livePulse {
            0%, 100% { opacity: 1;   box-shadow: 0 0 8px #22c55e; }
            50%       { opacity: 0.4; box-shadow: 0 0 2px #22c55e; }
          }
        `}</style>
      </div>
    );
  }

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────────
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
      <div style={{ marginBottom: 28, padding: '24px', borderRadius: 16, background: '#fff', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#374151' }}>
          Before you start — follow these steps
        </div>

        {[
          {
            num: '1', title: 'Open Helply AI App on your computer',
            desc: 'Launch the Helply AI desktop app you installed. Snap it to the side so both are visible.',
            tag: 'Setup', tagColor: '#6366f1',
          },
          {
            num: '2', title: 'Select your role below',
            desc: 'Pick your job role from the chips below, or type a custom role.',
            tag: 'On this page', tagColor: '#2563eb',
          },
          {
            num: '3', title: 'Click "Start Interview"',
            desc: 'The AI will introduce itself and begin asking questions in a meeting-style screen.',
            tag: 'On this page', tagColor: '#2563eb',
          },
          {
            num: '4', title: 'Answer each question, then click "Next Question"',
            desc: 'When you finish your answer click Next Question. Optionally open HelplyAI chatbot for ideal answers.',
            tag: 'During Interview', tagColor: '#059669',
          },
        ].map((step, i, arr) => (
          <div key={i}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)', flexShrink: 0,
                }}>{step.num}</div>
                {i < arr.length - 1 && (
                  <div style={{ width: 2, height: 32, background: 'linear-gradient(to bottom, #c7d2fe, #e5e7eb)', margin: '4px 0' }} />
                )}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? 4 : 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{step.title}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: `${step.tagColor}15`, color: step.tagColor,
                    border: `1px solid ${step.tagColor}30`, whiteSpace: 'nowrap',
                  }}>{step.tag}</span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 0 0', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
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
      <div style={{ padding: '28px', borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff' }}>

        {/* AI preview chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
          padding: '8px 16px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.08))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 700,
          }}>
            {aiName === 'Maya' ? 'M' : 'S'}
          </div>
          <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>
            Your interviewer: <strong>{aiName}</strong> (AI Voice)
          </span>
        </div>

        {/* Role chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Select a role</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_ROLES.map(role => {
              const active = selectedRole === role && !customRole.trim();
              return (
                <button key={role} onClick={() => { setSelectedRole(role); setCustomRole(''); }}
                  style={{
                    padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    background: active ? '#2563eb' : '#f3f4f6',
                    border: active ? '1.5px solid #2563eb' : '1.5px solid transparent',
                    color: active ? '#fff' : '#374151',
                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >{role}</button>
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

        <input
          type="text" value={customRole}
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

        {activeRole && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
            Interviewing as: <strong style={{ color: '#2563eb' }}>{activeRole}</strong>
          </div>
        )}

        <button
          onClick={startInterview}
          disabled={!activeRole || remainingToday <= 0}
          style={{
            width: '100%', marginTop: 24, padding: '15px 0', borderRadius: 12,
            background: activeRole && remainingToday > 0 ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#e5e7eb',
            border: 'none', color: activeRole && remainingToday > 0 ? '#fff' : '#9ca3af',
            fontSize: 16, fontWeight: 700,
            cursor: activeRole && remainingToday > 0 ? 'pointer' : 'not-allowed',
            letterSpacing: '-0.01em', transition: 'opacity 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
          onMouseEnter={e => { if (activeRole && remainingToday > 0) e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {remainingToday <= 0 ? 'Daily Limit Reached' : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              Start Interview with {aiName}
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes wave { from { height: 6px; } to { height: 32px; } }
        @keyframes dot  { from { transform: translateY(0); opacity: 0.4; } to { transform: translateY(-4px); opacity: 1; } }
      `}</style>
    </div>
  );
}
