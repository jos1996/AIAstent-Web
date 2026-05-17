import { useState, useEffect, useRef, useCallback } from 'react';
import { speakWithElevenLabs, ELEVENLABS_VOICES, isElevenLabsAvailable } from '../lib/elevenLabsTTS';

const MAX_DAILY_QUESTIONS = 15;
const TOTAL_QUESTIONS_PER_SESSION = 12; // ask up to 12, drawn from shuffled bank

// ── Voice helpers — Browser TTS fallback ───────────────────────────────────
// Used when ElevenLabs is unavailable
const MALE_VOICE_FRAGMENTS = [
  'Daniel',            // macOS — clear British male
  'Google UK English Male',
  'Microsoft David',
  'Microsoft Mark',
  'Microsoft Guy',
  'Alex',              // macOS English male
  'Fred',
  'Tom',
  'Gordon',
  'Reed',
  'en-US-GuyNeural',
  'en-GB-RyanNeural',
];

const FEMALE_VOICE_FRAGMENTS = [
  'Samantha', 'Karen', 'Victoria', 'Moira', 'Tessa', 'Fiona', 'Veena',
  'Google US English', 'Microsoft Zira', 'Microsoft Eva', 'Microsoft Jenny',
  'Microsoft Aria', 'Jenny', 'Aria', 'Sonia', 'Susan', 'Linda', 'Emma',
  'Amy', 'Joanna', 'en-US-Jenny', 'en-US-Aria', 'en-GB-Sonia',
];

function getMaleVoice(): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const explicit = voices.find(v =>
    MALE_VOICE_FRAGMENTS.some(f => v.name.includes(f))
  );
  if (explicit) return explicit;

  const enGB = voices.find(v =>
    v.lang === 'en-GB' && !FEMALE_VOICE_FRAGMENTS.some(f => v.name.includes(f))
  );
  if (enGB) return enGB;

  const enAny = voices.find(v =>
    v.lang.startsWith('en') && !FEMALE_VOICE_FRAGMENTS.some(f => v.name.includes(f))
  );
  if (enAny) return enAny;

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
    "How do you decide between building something custom versus using a third-party library?",
    "Walk me through how you would conduct a thorough code review for a critical feature.",
    "How do you approach writing tests for legacy code that has none?",
    "Describe your process for estimating the complexity and time needed for a new feature.",
    "How do you handle disagreements with a senior engineer on a technical decision?",
    "What does good documentation look like to you and how do you enforce it in a team?",
  ],
  'Product Manager': [
    "How do you decide which features to build next when you have 10 competing priorities?",
    "Walk me through how you wrote a product requirements document for a complex feature.",
    "How do you measure whether a feature you shipped was actually successful?",
    "Describe a situation where data and user feedback were contradicting each other. What did you do?",
    "How do you work with engineering when they say your proposed timeline is unrealistic?",
    "How do you handle stakeholders who keep changing requirements mid-sprint?",
    "What does your discovery process look like before you write a single line of spec?",
    "How do you say no to a feature request from a senior executive without damaging the relationship?",
    "Describe a product launch that did not go as planned. What did you learn?",
    "How do you align a cross-functional team around a single product vision?",
    "How do you approach pricing decisions for a new product or feature?",
    "Walk me through how you define and track your north star metric.",
  ],
  'Data Scientist': [
    "How would you approach building a churn prediction model from scratch?",
    "What steps do you take when your model performs well on training data but poorly in production?",
    "How do you explain a complex machine learning model's output to a non-technical business team?",
    "Describe how you would design an A/B test to evaluate a new recommendation algorithm.",
    "How do you handle class imbalance in a classification problem?",
    "Walk me through how you would clean and prepare a messy real-world dataset for modeling.",
    "How do you decide which features to include or exclude when building a model?",
    "Describe a time your analysis challenged an assumption leadership strongly believed.",
    "How do you detect and handle data drift in a production machine learning model?",
    "What is your approach to model explainability for regulated industries?",
    "How would you build a recommendation system for a platform with limited historical data?",
    "How do you communicate uncertainty in your predictions to business stakeholders?",
  ],
  'UI/UX Designer': [
    "Walk me through your end-to-end design process for a recent project you're proud of.",
    "How do you balance business goals with user needs when they conflict?",
    "How do you conduct user research when you have limited time and budget?",
    "Describe a time your design was challenged by developers or stakeholders. How did you handle it?",
    "How do you validate that a design solution actually solves the user's problem?",
    "How do you approach designing for accessibility from the start?",
    "How do you design for multiple platforms while keeping a consistent experience?",
    "Describe a time you had to redesign something due to poor usability data. What changed?",
    "How do you present your design rationale to stakeholders who are not designers?",
    "What is your approach to building and maintaining a design system?",
    "How do you handle situations where engineering says a design is too complex to implement?",
    "How do you incorporate feedback from usability testing without losing the design vision?",
  ],
  'Marketing Manager': [
    "How do you build a go-to-market strategy for a new product launch?",
    "Walk me through a campaign you ran end-to-end. What was the goal, execution, and result?",
    "How do you measure ROI across different marketing channels?",
    "How do you decide how to allocate a limited marketing budget across channels?",
    "Describe a time a campaign didn't perform as expected. What did you do?",
    "How do you keep messaging consistent across multiple markets or audiences?",
    "How do you use data to make decisions about content strategy?",
    "Describe how you would build a brand from scratch with a limited budget.",
    "How do you align marketing goals with overall business objectives?",
    "How do you evaluate whether an influencer or partnership opportunity is worth pursuing?",
    "Describe a time you had to pivot a campaign strategy mid-execution.",
    "How do you approach marketing to multiple buyer personas within the same product?",
  ],
  'Business Analyst': [
    "How do you gather and validate requirements from multiple conflicting stakeholders?",
    "Walk me through how you documented and mapped a complex business process.",
    "How do you prioritize which business problems to focus on when everything feels urgent?",
    "Describe a time your analysis directly influenced a major business decision.",
    "How do you handle a situation where stakeholders reject your recommendations?",
    "What techniques do you use to identify root causes of business performance issues?",
    "How do you ensure your requirements documentation stays current as a project evolves?",
    "Describe how you would facilitate a requirements workshop with 15 stakeholders.",
    "How do you bridge the gap between what business stakeholders want and what is technically feasible?",
    "What is your approach to defining acceptance criteria for complex user stories?",
    "How do you handle ambiguity when key information is missing at the start of a project?",
    "Describe a time you uncovered a hidden business requirement that changed the project scope.",
  ],
  'Sales Executive': [
    "Walk me through your typical process from initial outreach to closing a deal.",
    "How do you handle a prospect who is interested but keeps stalling the decision?",
    "Describe the most complex deal you closed. What made it difficult and how did you win it?",
    "How do you build trust with a new client in the first 30 days?",
    "How do you handle objections around pricing without immediately discounting?",
    "How do you manage a large pipeline and decide where to spend your time?",
    "How do you research a prospect before a first meeting?",
    "Describe a time you lost a deal. What did you learn from it?",
    "How do you maintain long-term relationships with clients after the deal is closed?",
    "How do you approach upselling or cross-selling to an existing account?",
    "How do you stay motivated during a quarter where results are not coming in?",
    "Describe how you would build a territory plan if you were starting from scratch.",
  ],
  'HR Manager': [
    "How do you design a recruitment process that reduces bias and improves quality of hire?",
    "Walk me through how you handled a serious conflict between two team members or departments.",
    "How do you measure employee engagement and what do you do when it's declining?",
    "Describe a time you had to deliver difficult feedback to a senior leader.",
    "How do you build a culture of continuous feedback in an organization that resists it?",
    "How do you handle a situation where a manager is underperforming but leadership likes them?",
    "How do you design a compensation structure that is competitive and internally equitable?",
    "Describe how you approach building a DEI strategy that goes beyond box-checking.",
    "How do you handle an employee who is at risk of leaving due to a competing offer?",
    "What does a strong onboarding program look like to you and how do you measure its success?",
    "How do you support managers in having career development conversations with their teams?",
    "Describe a time you had to manage a large-scale organizational change. How did you handle it?",
  ],
  'DevOps Engineer': [
    "How would you design a CI/CD pipeline for a microservices-based application?",
    "Walk me through how you would investigate and resolve a P0 production outage.",
    "How do you approach infrastructure as code and what tools do you prefer?",
    "How do you balance deployment speed with system reliability and rollback safety?",
    "Describe how you would set up monitoring and alerting for a new service.",
    "How do you manage secrets and credentials securely across environments?",
    "How would you approach migrating a monolithic application to containers?",
    "Describe how you have handled capacity planning for a high-traffic event.",
    "How do you manage configuration drift across many servers or environments?",
    "Walk me through your approach to disaster recovery planning and testing.",
    "How do you evaluate and introduce new tools into an existing DevOps stack?",
    "Describe a post-mortem process you followed after a significant incident.",
  ],
  'Finance Analyst': [
    "Walk me through how you would build a financial model to evaluate a new business opportunity.",
    "How do you identify and communicate financial risks to non-finance stakeholders?",
    "Describe a time your financial analysis led to a significant business decision.",
    "How do you approach variance analysis when actuals differ significantly from budget?",
    "How do you ensure the accuracy and integrity of financial reports under tight deadlines?",
    "How would you evaluate whether the company should build versus buy a software tool?",
    "How do you approach sensitivity analysis and scenario planning in your models?",
    "Describe a time you identified a cost reduction opportunity that leadership hadn't seen.",
    "How do you make financial data meaningful to non-finance audiences?",
    "Walk me through how you would run the annual budgeting process from start to finish.",
    "How do you handle pressure from business units to hit a number that isn't achievable?",
    "Describe your approach to forecasting when historical data is limited or unreliable.",
  ],
  'Project Manager': [
    "How do you keep a project on track when scope, timeline, and budget are all under pressure?",
    "Walk me through how you managed a project that had multiple dependencies across teams.",
    "How do you handle a team member who is consistently missing deadlines?",
    "Describe how you communicate project status and risks to senior stakeholders.",
    "How do you manage scope creep without damaging your relationship with the client?",
    "What does your project kickoff process look like and why?",
    "How do you build alignment among stakeholders who have conflicting priorities?",
    "Describe a time a project failed. What happened and what did you do differently after?",
    "How do you motivate a team that is burned out in the middle of a long project?",
    "How do you manage risk on a project with a lot of unknowns at the start?",
    "Describe your approach to lessons learned and how you apply them to future projects.",
    "How do you handle a situation where the project sponsor becomes unresponsive?",
  ],
  'Full Stack Developer': [
    "How do you decide when to optimize for backend performance versus frontend experience?",
    "Walk me through how you would architect a full stack feature from database to UI.",
    "How do you approach security vulnerabilities in a web application you maintain?",
    "Describe how you handle state management in a complex frontend application.",
    "How do you design APIs that are easy for frontend teams to consume?",
    "How do you ensure your deployments don't break existing functionality?",
    "How do you approach database schema design for a feature that may scale significantly?",
    "Describe how you handle authentication and authorization in a web application.",
    "How do you approach performance optimization when a page is loading too slowly?",
    "Walk me through how you would debug a memory leak in a Node.js application.",
    "How do you handle versioning of APIs that are consumed by multiple clients?",
    "Describe how you approach testing strategy across the full stack.",
  ],
};

// Shuffle helper — Fisher-Yates
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const generateQuestionsForRole = (role: string): string[] => {
  const bank = ROLE_QUESTIONS[role];
  if (bank) {
    // Always shuffle so repeat sessions get different order
    return shuffle(bank).slice(0, TOTAL_QUESTIONS_PER_SESSION);
  }
  // Fallback for custom roles — generic questions, always shuffled
  return shuffle([
    `What does a typical day look like in your ${role} position and how do you prioritize your work?`,
    `What is the most technically challenging aspect of being a ${role} and how do you tackle it?`,
    `How do you collaborate with cross-functional teams as a ${role}?`,
    `Describe a significant problem you solved in your ${role} role. What was your approach?`,
    `How do you measure success in your ${role} position and what metrics do you track?`,
    `How do you stay updated with industry trends relevant to your ${role} responsibilities?`,
    `Tell me about a time you had to influence a decision without direct authority as a ${role}.`,
    `How do you handle pressure and tight deadlines in the ${role} role?`,
    `Describe a project where you had to quickly learn something new to succeed as a ${role}.`,
    `How do you approach building relationships with key stakeholders in your ${role}?`,
  ]).slice(0, TOTAL_QUESTIONS_PER_SESSION);
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
  const aiName = 'Smith'; // Always Smith — male voice
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [elevenLabsReady, setElevenLabsReady] = useState<boolean | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeRole = customRole.trim() || selectedRole;
  const remainingToday = MAX_DAILY_QUESTIONS - questionsUsedToday;

  // Pre-load voices and check ElevenLabs availability on mount
  useEffect(() => {
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
    // Check if ElevenLabs is available
    isElevenLabsAvailable().then((available) => {
      console.log('[ElevenLabs] Available:', available);
      setElevenLabsReady(available);
    });
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

  // Small helper: pause for ms milliseconds
  const pause = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  // Primary: ElevenLabs AI voice (with fallback chain), Fallback: Browser TTS
  const speakText = useCallback(async (text: string): Promise<void> => {
    // Try ElevenLabs first if available
    if (elevenLabsReady) {
      // Try custom SMITH voice first
      try {
        console.log('[ElevenLabs] Trying SMITH voice for:', text.substring(0, 50) + '...');
        await speakWithElevenLabs(text, {
          voiceId: ELEVENLABS_VOICES.SMITH,
          onStart: () => {
            console.log('[ElevenLabs SMITH] Playing audio...');
            setIsSpeaking(true);
          },
          onEnd: () => {
            console.log('[ElevenLabs SMITH] Audio finished');
            setIsSpeaking(false);
          },
        });
        return;
      } catch (err) {
        console.error('[ElevenLabs SMITH] Failed:', err);
        console.warn('[ElevenLabs] Falling back to ADAM voice...');
      }
      
      // Fallback to ADAM voice (reliable on free tier)
      try {
        console.log('[ElevenLabs] Trying ADAM voice for:', text.substring(0, 50) + '...');
        await speakWithElevenLabs(text, {
          voiceId: ELEVENLABS_VOICES.ADAM,
          onStart: () => {
            console.log('[ElevenLabs ADAM] Playing audio...');
            setIsSpeaking(true);
          },
          onEnd: () => {
            console.log('[ElevenLabs ADAM] Audio finished');
            setIsSpeaking(false);
          },
        });
        return;
      } catch (err) {
        console.error('[ElevenLabs ADAM] Failed:', err);
        console.warn('Falling back to browser TTS');
      }
    }

    // Fallback to browser speech synthesis
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82;
      utterance.pitch = 0.95;
      utterance.volume = 1.0;
      const voice = getMaleVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [elevenLabsReady]);

  // Speak with a natural pause between sentences
  const speakWithPause = useCallback(async (text: string, afterMs = 600) => {
    await speakText(text);
    await pause(afterMs);
  }, [speakText]);

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

    // Introduction — Smith (male)
    await speakWithPause(`Hi there. I'm Smith, your AI interviewer from Helply AI.`, 500);
    await speakWithPause(`Today I'll be conducting your mock interview for the ${activeRole} role.`, 400);
    await speakWithPause(`I'll be asking you a series of questions. Take your time, answer as fully as you can, and when you're done just click Next Question.`, 500);
    await speakWithPause(`Alright, let's begin.`, 900);

    setIsIntro(false);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(qs[0]);
    incrementUsage();
    await speakWithPause(`Here's your first question.`, 450);
    await speakText(qs[0]);
    setWaitingForNext(true);
  };

  const nextQuestion = async () => {
    if (isSpeaking) return;
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= questions.length) {
      setWaitingForNext(false);
      setIsComplete(true);
      await speakWithPause(`And that brings us to the end of the interview.`, 600);
      await speakText(`You've done a great job working through all the questions. Open the Helply AI chatbot to review ideal answers and feedback for each one. Well done!`);
      return;
    }
    setWaitingForNext(false);
    setCurrentQuestionIndex(nextIdx);
    setCurrentQuestion(questions[nextIdx]);
    incrementUsage();
    // Conversational transitions — rotated so they don't repeat
    const transitions = [
      "That's a great answer. Here's the next one.",
      "Good. Let's keep going.",
      "Great response. Moving on.",
      "Excellent. Here's your next question.",
      "Nice. Let's continue.",
      "Thank you for that. Here's the next question.",
      "Alright, next one.",
      "Very good. Moving forward.",
    ];
    const transition = transitions[nextIdx % transitions.length];
    await speakWithPause(transition, 450);
    await speakText(questions[nextIdx]);
    setWaitingForNext(true);
  };

  const stopInterview = () => {
    console.log('[MockInterview] stopInterview called - resetting all states');
    window.speechSynthesis.cancel();
    // Stop any playing ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsInterviewing(false);
    setIsSpeaking(false);
    setIsIntro(false);
    setWaitingForNext(false);
    setCurrentQuestion('');
    setCurrentQuestionIndex(-1);
    setIsComplete(false);
    setQuestions([]);
    setElapsedSeconds(0);
    console.log('[MockInterview] Interview stopped, returning to setup');
  };

  // ── ACTIVE INTERVIEW — Full-screen dark meeting room ────────────────────────
  if (isInterviewing) {
    const statusLabel = isIntro
      ? `${aiName} is introducing...`
      : isComplete
        ? 'Interview Complete'
        : isSpeaking
          ? `${aiName} is speaking...`
          : 'I am listening... answer now';

    return (
      <div className="mock-meeting-room" style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'linear-gradient(180deg, #0c0c14 0%, #0f1729 55%, #0c0c14 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}>
        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 28px',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 20,
              background: isComplete ? 'rgba(107,114,128,0.15)' : 'rgba(34,197,94,0.12)',
              border: `1px solid ${isComplete ? 'rgba(107,114,128,0.2)' : 'rgba(34,197,94,0.25)'}`,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isComplete ? '#6b7280' : '#22c55e',
                boxShadow: isComplete ? 'none' : '0 0 6px #22c55e',
                animation: (!isComplete) ? 'livePulse 2s ease-in-out infinite' : 'none',
              }} />
              <span style={{ color: isComplete ? '#6b7280' : '#4ade80', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                {isComplete ? 'ENDED' : 'LIVE'}
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600 }}>
              Helply AI — Mock Interview
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>{activeRole}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {!isComplete && (
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}>
                {currentQuestionIndex >= 0 ? `Question ${currentQuestionIndex + 1} of ${TOTAL_QUESTIONS_PER_SESSION}` : 'Introduction'}
              </span>
            )}
            <span style={{
              color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'monospace', fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 8,
            }}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* ── Main meeting area ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 32px 0',
          overflow: 'hidden', gap: 0,
        }}>

          {/* AI Avatar with pulse rings */}
          <div style={{ position: 'relative', marginBottom: 24, flexShrink: 0 }}>
            {/* Outermost ambient glow — always present, brighter when speaking */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 220, height: 220, borderRadius: '50%',
              background: isSpeaking || isIntro
                ? 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
              transition: 'background 0.5s',
              pointerEvents: 'none',
            }} />
            {/* Pulse ring 1 */}
            <div style={{
              position: 'absolute', inset: -30, borderRadius: '50%',
              border: `1.5px solid rgba(99,102,241,${isSpeaking || isIntro ? '0.55' : '0.12'})`,
              animation: isSpeaking || isIntro ? 'ring1 1.8s ease-out infinite' : 'none',
            }} />
            {/* Pulse ring 2 */}
            <div style={{
              position: 'absolute', inset: -16, borderRadius: '50%',
              border: `1.5px solid rgba(99,102,241,${isSpeaking || isIntro ? '0.4' : '0.1'})`,
              animation: isSpeaking || isIntro ? 'ring2 1.8s ease-out infinite 0.4s' : 'none',
            }} />
            {/* Listening ripple rings — only when waiting for user answer */}
            {!isSpeaking && !isIntro && !isComplete && (<>
              <div style={{
                position: 'absolute', inset: -45, borderRadius: '50%',
                border: '1.5px solid rgba(34,197,94,0.25)',
                animation: 'listenRing1 2.2s ease-out infinite',
              }} />
              <div style={{
                position: 'absolute', inset: -60, borderRadius: '50%',
                border: '1px solid rgba(34,197,94,0.15)',
                animation: 'listenRing2 2.2s ease-out infinite 0.55s',
              }} />
              <div style={{
                position: 'absolute', inset: -75, borderRadius: '50%',
                border: '1px solid rgba(34,197,94,0.08)',
                animation: 'listenRing3 2.2s ease-out infinite 1.1s',
              }} />
            </>)}

            {/* Avatar circle with Helply AI icon */}
            <div style={{
              width: 150, height: 150, borderRadius: '50%',
              background: isSpeaking || isIntro
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)'
                : !isComplete
                  ? 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)' // emerald when listening
                  : 'linear-gradient(135deg, #374151, #4b5563)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `4px solid ${
                isSpeaking || isIntro
                  ? 'rgba(167,139,250,0.9)'
                  : !isComplete
                    ? 'rgba(52,211,153,0.6)'
                    : 'rgba(107,114,128,0.3)'
              }`,
              boxShadow: isSpeaking || isIntro
                ? '0 0 60px rgba(99,102,241,0.8), 0 0 120px rgba(99,102,241,0.4), inset 0 0 30px rgba(255,255,255,0.1)'
                : !isComplete
                  ? '0 0 50px rgba(52,211,153,0.5), 0 0 100px rgba(52,211,153,0.2), inset 0 0 30px rgba(255,255,255,0.1)'
                  : '0 8px 32px rgba(0,0,0,0.4)',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative', zIndex: 1, flexShrink: 0,
              overflow: 'hidden',
            }}>
              {/* Inner glow effect */}
              <div style={{
                position: 'absolute', inset: 0,
                background: isSpeaking || isIntro
                  ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 50%)'
                  : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                pointerEvents: 'none',
              }} />
              {/* Helply AI Icon */}
              <img 
                src="/favicon.png" 
                alt="Helply AI"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  position: 'relative',
                  zIndex: 2,
                }}
              />
            </div>
          </div>

          {/* AI Name + status */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.5px' }}>Smith</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              AI Interviewer · Helply AI
              {elevenLabsReady && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  background: 'rgba(99,102,241,0.25)', color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.35)',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>
                  AI Voice
                </span>
              )}
            </div>
            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 18px', borderRadius: 24,
              background: isComplete
                ? 'rgba(107,114,128,0.15)'
                : isSpeaking || isIntro
                  ? 'rgba(99,102,241,0.18)'
                  : 'rgba(34,197,94,0.12)',
              border: `1px solid ${isComplete ? 'rgba(107,114,128,0.25)' : isSpeaking || isIntro ? 'rgba(99,102,241,0.35)' : 'rgba(34,197,94,0.25)'}`,
              transition: 'all 0.3s',
            }}>
              {(isSpeaking || isIntro) && !isComplete && (
                <div style={{ display: 'flex', gap: 2.5, alignItems: 'center', height: 18 }}>
                  {[0.38, 0.52, 0.44, 0.6, 0.48, 0.56, 0.42, 0.5].map((dur, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 3,
                      background: 'linear-gradient(to top, #818cf8, #c4b5fd)',
                      animation: `waveBar ${dur}s ease-in-out infinite alternate`,
                      minHeight: 4,
                    }} />
                  ))}
                </div>
              )}
              {!isSpeaking && !isIntro && !isComplete && (
                <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 18 }}>
                  {[0.35, 0.5, 0.42, 0.58, 0.38, 0.52].map((dur, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 3,
                      background: 'linear-gradient(to top, #34d399, #6ee7b7)',
                      animation: `listenBar ${dur}s ease-in-out infinite alternate`,
                      minHeight: 4,
                    }} />
                  ))}
                </div>
              )}
              {isComplete && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              )}
              <span style={{
                fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
                color: isComplete ? '#9ca3af' : isSpeaking || isIntro ? '#c4b5fd' : '#6ee7b7',
              }}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Question card */}
          {!isIntro && !isComplete && currentQuestion && (
            <div style={{
              maxWidth: 720, width: '100%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: isSpeaking 
                ? '1px solid rgba(99,102,241,0.4)' 
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24, 
              padding: '28px 36px',
              backdropFilter: 'blur(24px)',
              marginBottom: 24,
              boxShadow: isSpeaking
                ? '0 12px 48px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{
                  padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 800,
                  background: isSpeaking 
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(79,70,229,0.2) 100%)' 
                    : 'rgba(255,255,255,0.08)', 
                  color: isSpeaking ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                  border: isSpeaking ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.15)',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px',
                }}>
                  Interview Question
                </span>
                {isSpeaking && (
                  <span style={{ 
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: '#c4b5fd', fontWeight: 500,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#6366f1',
                      boxShadow: '0 0 8px #6366f1',
                      animation: 'livePulse 1.5s ease-in-out infinite',
                    }} />
                    Smith is speaking
                  </span>
                )}
              </div>
              <p style={{
                color: '#ffffff', fontSize: 18, fontWeight: 500,
                lineHeight: 1.85, margin: 0, letterSpacing: '0.01em',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}>
                {currentQuestion}
              </p>
            </div>
          )}

          {/* Intro loading state */}
          {isIntro && (
            <div style={{
              maxWidth: 520, textAlign: 'center', padding: '28px 32px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(79,70,229,0.05) 100%)', 
              borderRadius: 20,
              border: '1px solid rgba(99,102,241,0.2)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', 
                  background: '#6366f1',
                  boxShadow: '0 0 10px #6366f1',
                  animation: 'livePulse 1.5s ease-in-out infinite',
                }} />
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: 0, fontWeight: 500 }}>
                  Smith is introducing the session...
                </p>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                Listen carefully — your first question will follow shortly.
              </p>
            </div>
          )}

          {/* Completion card */}
          {isComplete && (
            <div style={{
              maxWidth: 560, width: '100%', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 24, padding: '36px 32px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 16px 56px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                Interview Complete!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, margin: '0 0 28px', lineHeight: 1.7 }}>
                Great job! You've answered all the questions.<br />
                Open the <strong style={{ color: '#c4b5fd' }}>Helply AI chatbot</strong> to review ideal answers.
              </p>
              <button
                onClick={stopInterview}
                style={{
                  padding: '14px 36px', borderRadius: 14, fontSize: 15, fontWeight: 700,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(99,102,241,0.5)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 32px rgba(99,102,241,0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)';
                }}
              >
                Back to Setup
              </button>
            </div>
          )}

          {/* No progress bar — questions are open-ended, no count shown */}
        </div>

        {/* ── Bottom controls ── */}
        {!isComplete && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            padding: '18px 32px 32px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
            backdropFilter: 'blur(24px)',
            flexShrink: 0,
            position: 'relative',
            zIndex: 50,
          }}>
            {/* Hint text */}
            <span style={{
              position: 'absolute',
              fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic',
              bottom: 8, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap',
              letterSpacing: '0.3px',
            }}>
              {isSpeaking || isIntro ? 'Smith is speaking — please wait' : 'Click "Next Question" when you finish answering'}
            </span>

            {/* Next Question */}
            <button
              onClick={nextQuestion}
              disabled={isSpeaking || isIntro}
              style={{
                padding: '14px 36px', borderRadius: 50, fontSize: 14, fontWeight: 700,
                background: isSpeaking || isIntro
                  ? 'rgba(255,255,255,0.07)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: isSpeaking || isIntro ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                color: isSpeaking || isIntro ? 'rgba(255,255,255,0.3)' : '#fff',
                cursor: isSpeaking || isIntro ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 9,
                boxShadow: isSpeaking || isIntro ? 'none' : '0 4px 24px rgba(99,102,241,0.55)',
                transition: 'all 0.25s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { if (!isSpeaking && !isIntro) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isSpeaking || isIntro ? (
                <>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: `dotBounce ${0.4 + i * 0.15}s ease-in-out infinite alternate` }} />
                    ))}
                  </div>
                  Please wait...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  {currentQuestionIndex >= TOTAL_QUESTIONS_PER_SESSION - 1 ? 'Finish Interview' : 'Next Question'}
                </>
              )}
            </button>

            {/* End Interview - Fixed click handler */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('[MockInterview] End Interview clicked - calling stopInterview');
                stopInterview();
              }}
              style={{
                padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                border: '2px solid rgba(239,68,68,0.6)',
                color: '#fff',
                cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 28px rgba(220,38,38,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                transition: 'all 0.2s ease',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 100,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M3 5h18M9 3v2.5a2.5 2.5 0 005 0V3M12 12v9"/>
              </svg>
              <span style={{ whiteSpace: 'nowrap' }}>End Interview</span>
            </button>
          </div>
        )}

        {/* ── Animations ── */}
        <style>{`
          @keyframes ring1 {
            0%   { transform: scale(1);    opacity: 0.7; }
            100% { transform: scale(1.45); opacity: 0; }
          }
          @keyframes ring2 {
            0%   { transform: scale(1);    opacity: 0.5; }
            100% { transform: scale(1.25); opacity: 0; }
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
          @keyframes listenBar {
            from { height: 4px;  opacity: 0.7; }
            to   { height: 20px; opacity: 1;   }
          }
          @keyframes listenRing1 {
            0%   { transform: scale(1);    opacity: 0.6; }
            100% { transform: scale(1.5);  opacity: 0; }
          }
          @keyframes listenRing2 {
            0%   { transform: scale(1);    opacity: 0.4; }
            100% { transform: scale(1.4);  opacity: 0; }
          }
          @keyframes listenRing3 {
            0%   { transform: scale(1);    opacity: 0.2; }
            100% { transform: scale(1.35); opacity: 0; }
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
          {remainingToday > 0 ? 'Questions available today' : 'Daily limit reached'}
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
          <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            Your interviewer: <strong>{aiName}</strong>
            {elevenLabsReady ? (
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                background: 'rgba(99,102,241,0.12)', color: '#4f46e5',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>ElevenLabs AI</span>
            ) : (
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                background: '#f3f4f6', color: '#6b7280',
                border: '1px solid #e5e7eb',
              }}>Browser Voice</span>
            )}
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
