import { useState } from 'react';
import SEOHead from '../components/SEOHead';

export default function AIInterviewHelperPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const features = [
    { title: 'Real-Time Interview Assistance', desc: 'Get instant AI-powered suggestions and answers during live interviews. HelplyAI listens, analyzes, and provides real-time coaching so you never get stuck on a tough question.', icon: '⚡' },
    { title: 'AI Mock Interview Practice', desc: 'Practice unlimited mock interviews with AI. Get scored on your answers, improve your delivery, and build confidence before the real interview.', icon: '🎯' },
    { title: 'Screen Analysis & Code Help', desc: 'HelplyAI can analyze your screen in real-time during coding interviews, helping you debug code, suggest optimizations, and explain complex algorithms.', icon: '💻' },
    { title: 'Behavioral Interview Coaching', desc: 'Master the STAR method with AI coaching. Get perfectly structured answers for behavioral questions like "Tell me about a time when..." scenarios.', icon: '🧠' },
    { title: 'Smart Reminders & Follow-ups', desc: 'Never miss an interview again. Set smart reminders for upcoming interviews, follow-up emails, and preparation schedules.', icon: '🔔' },
    { title: 'Multi-Language Support', desc: 'Prepare for interviews in multiple languages. HelplyAI supports interview coaching in English, Hindi, Spanish, and more.', icon: '🌍' },
  ];

  const comparisons = [
    { name: 'HelplyAI', realTime: true, mockInterview: true, screenAnalysis: true, codingHelp: true, price: 'Free + Premium', platforms: 'macOS, Windows' },
    { name: 'Final Round AI', realTime: true, mockInterview: true, screenAnalysis: false, codingHelp: false, price: '$99/month', platforms: 'Web only' },
    { name: 'LockedIn AI', realTime: true, mockInterview: false, screenAnalysis: false, codingHelp: false, price: '$49/month', platforms: 'Web only' },
    { name: 'Parakeet AI', realTime: true, mockInterview: false, screenAnalysis: false, codingHelp: false, price: '$39/month', platforms: 'Web only' },
  ];

  const faqs = [
    { q: 'What is an AI interview helper?', a: 'An AI interview helper is a software tool that uses artificial intelligence to assist job seekers during interview preparation and live interviews. It can provide real-time answer suggestions, mock interview practice, and coaching on how to answer technical, behavioral, and HR interview questions. HelplyAI is the leading AI interview helper that offers all these features in one desktop application.' },
    { q: 'How does HelplyAI help me crack interviews?', a: 'HelplyAI helps you crack interviews in multiple ways: (1) Real-time AI assistance during live video interviews with instant answer suggestions, (2) Unlimited AI mock interview practice with scoring and feedback, (3) Screen analysis for coding interviews to help debug and optimize code, (4) STAR method coaching for behavioral interviews, and (5) Smart interview preparation with personalized question banks.' },
    { q: 'Is HelplyAI detectable during interviews?', a: 'HelplyAI runs as a lightweight desktop application on your computer. It operates discreetly and does not interfere with your video call or screen sharing applications. The app is designed to be a personal coaching tool that helps you prepare and perform better in interviews.' },
    { q: 'What types of interviews does HelplyAI support?', a: 'HelplyAI supports all types of job interviews including: Technical coding interviews (Python, JavaScript, Java, C++, etc.), System design interviews, Behavioral interviews (STAR method), HR screening interviews, Case study interviews, and Panel interviews. It works for FAANG, startups, and enterprise companies.' },
    { q: 'How is HelplyAI different from Final Round AI?', a: 'HelplyAI offers several advantages over Final Round AI: (1) Desktop app for both macOS and Windows (not just web), (2) Real-time screen analysis for coding interviews, (3) More affordable pricing with a free tier, (4) Smart reminders and interview scheduling, and (5) Multi-language support. HelplyAI is designed to be the all-in-one interview assistant.' },
    { q: 'Is HelplyAI free?', a: 'Yes, HelplyAI offers a free plan that includes basic mock interview practice and interview preparation features. Premium plans unlock advanced features like real-time interview assistance, unlimited screen analysis, and priority AI responses. Check our pricing page for the latest plans.' },
    { q: 'What platforms does HelplyAI support?', a: 'HelplyAI is available as a native desktop application for macOS (Apple Silicon and Intel) and Windows (64-bit). The settings dashboard is accessible via any web browser at helplyai.co. We are working on mobile apps for iOS and Android.' },
    { q: 'Can HelplyAI help with coding interviews?', a: 'Absolutely! HelplyAI excels at coding interview assistance. It can analyze your screen during live coding sessions, suggest optimizations, help debug errors, explain algorithms, and provide hints for data structure and algorithm problems. It supports all major programming languages including Python, JavaScript, Java, C++, Go, and more.' },
  ];

  const keywords = [
    'AI interview helper', 'crack interview with AI', 'AI mock interview', 'real-time interview assistant',
    'best AI interview tool', 'interview preparation AI', 'AI career coach', 'coding interview AI',
    'behavioral interview AI', 'FAANG interview prep', 'technical interview AI', 'AI interview copilot',
    'job interview tips', 'how to crack interview', 'AI interview practice', 'interview answer generator',
  ];

  const containerStyle: React.CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' };

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    padding: '0 40px', height: 70,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <SEOHead
        title="AI Interview Helper – Crack Any Job Interview with Real-Time AI | HelplyAI"
        description="HelplyAI is the #1 AI interview helper. Get real-time AI assistance during live interviews, practice mock interviews, and crack technical, HR, and behavioral interviews. Free AI interview tool for freshers and experienced professionals. Best alternative to Final Round AI & LockedIn AI."
        keywords="AI interview helper, AI interview assistant, crack interview with AI, real-time interview assistant, AI mock interview, best AI interview tool 2025, interview preparation AI, AI career coach, coding interview AI, behavioral interview AI, Final Round AI alternative, LockedIn AI alternative, FAANG interview prep, how to crack interview, AI interview copilot, job interview tips, interview answer generator AI"
        canonical="https://www.helplyai.co/ai-interview-helper"
      />

      {/* Navigation */}
      <nav style={navStyle}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src="/favicon.png" alt="HelplyAI - AI Interview Helper" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span style={{ fontSize: 19, fontWeight: 800, color: '#000' }}>Helply AI</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="/" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Home</a>
          <a href="/blog/how-to-crack-interview" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Blog</a>
          <a href="/settings/dashboard" style={{ padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#000', color: '#fff', textDecoration: 'none' }}>Get Started Free</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', background: 'linear-gradient(180deg, #f8f9fa 0%, #fff 100%)' }}>
        <div style={containerStyle}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: '#f0f0f0', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 24 }}>
            #1 AI Interview Helper — Trusted by 100K+ Job Seekers
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#000', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
            Crack Any Job Interview with<br />
            <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real-Time AI Assistance</span>
          </h1>
          <h2 style={{ fontSize: 20, fontWeight: 400, color: '#555', maxWidth: 700, margin: '0 auto 40px', lineHeight: 1.6 }}>
            HelplyAI is the best AI interview helper for technical, HR, and behavioral interviews. 
            Practice mock interviews, get instant AI-powered answers, and land your dream job.
          </h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/settings/dashboard" style={{ padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: '#000', color: '#fff', textDecoration: 'none', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              Start Practicing Free
            </a>
            <a href="#features" style={{ padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: '#fff', color: '#000', textDecoration: 'none', border: '2px solid #000', transition: 'all 0.3s' }}>
              See Features
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: '#888' }}>No credit card required. Works on macOS and Windows.</p>
        </div>
      </header>

      {/* Keywords Cloud for SEO */}
      <section style={{ padding: '40px 0', background: '#f8f9fa', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {keywords.map((kw, i) => (
              <span key={i} style={{ padding: '6px 14px', borderRadius: 100, background: '#fff', border: '1px solid #e0e0e0', fontSize: 12, color: '#555', fontWeight: 500 }}>{kw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* What is AI Interview Helper */}
      <section style={{ padding: '80px 0' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 16 }}>
            What is an AI Interview Helper?
          </h2>
          <p style={{ fontSize: 17, color: '#444', lineHeight: 1.8, maxWidth: 800, margin: '0 auto 24px', textAlign: 'center' }}>
            An <strong>AI interview helper</strong> is a software tool powered by artificial intelligence that assists job seekers 
            throughout their interview journey. From preparation to the actual interview, an AI interview assistant provides 
            real-time coaching, answer suggestions, and mock interview practice to help you perform at your best.
          </p>
          <p style={{ fontSize: 17, color: '#444', lineHeight: 1.8, maxWidth: 800, margin: '0 auto 24px', textAlign: 'center' }}>
            <strong>HelplyAI</strong> is the leading AI interview helper that combines real-time interview assistance, 
            screen analysis for coding interviews, and intelligent mock interview practice into one powerful desktop application. 
            Whether you are a fresher preparing for your first job or an experienced professional targeting FAANG companies, 
            HelplyAI helps you <strong>crack any interview</strong> with confidence.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 12 }}>
            Why HelplyAI is the Best AI Interview Tool
          </h2>
          <p style={{ fontSize: 17, color: '#555', textAlign: 'center', marginBottom: 48 }}>
            Everything you need to crack technical, behavioral, and HR interviews
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <article key={i} style={{ padding: 32, borderRadius: 16, background: '#fff', border: '1px solid #eee', transition: 'all 0.3s' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 48 }}>
            How to Crack Any Interview with HelplyAI
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {[
              { step: '1', title: 'Download HelplyAI', desc: 'Get the free desktop app for macOS or Windows. Setup takes less than 2 minutes.' },
              { step: '2', title: 'Practice Mock Interviews', desc: 'Use AI-powered mock interviews to practice answering technical, behavioral, and HR questions.' },
              { step: '3', title: 'Join Your Real Interview', desc: 'When it is time for the real interview, HelplyAI provides real-time AI assistance in the background.' },
              { step: '4', title: 'Get the Job Offer', desc: 'With AI-powered confidence and preparation, you will nail the interview and land your dream job.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#000', color: '#fff', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 12 }}>
            HelplyAI vs Competitors
          </h2>
          <p style={{ fontSize: 17, color: '#555', textAlign: 'center', marginBottom: 40 }}>
            See how HelplyAI compares to Final Round AI, LockedIn AI, and Parakeet AI
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <thead>
                <tr style={{ background: '#000', color: '#fff' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Feature</th>
                  {comparisons.map((c, i) => (
                    <th key={i} style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Real-Time Assistance', 'Mock Interviews', 'Screen Analysis', 'Coding Help', 'Price', 'Platforms'].map((feature, fi) => (
                  <tr key={fi} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#333' }}>{feature}</td>
                    {comparisons.map((c, ci) => {
                      const values = [c.realTime, c.mockInterview, c.screenAnalysis, c.codingHelp, c.price, c.platforms];
                      const val = values[fi];
                      return (
                        <td key={ci} style={{ padding: '12px 20px', textAlign: 'center', fontSize: 14, color: typeof val === 'boolean' ? (val ? '#22c55e' : '#ef4444') : '#333' }}>
                          {typeof val === 'boolean' ? (val ? '✅' : '❌') : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a href="/vs/final-round-ai" style={{ color: '#2563eb', fontSize: 14, fontWeight: 600, marginRight: 24 }}>HelplyAI vs Final Round AI →</a>
            <a href="/vs/lockedin-ai" style={{ color: '#2563eb', fontSize: 14, fontWeight: 600, marginRight: 24 }}>HelplyAI vs LockedIn AI →</a>
            <a href="/vs/parakeet-ai" style={{ color: '#2563eb', fontSize: 14, fontWeight: 600 }}>HelplyAI vs Parakeet AI →</a>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ padding: '80px 0' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 48 }}>
            Who Uses HelplyAI?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { title: 'Software Engineers', desc: 'Crack coding interviews at FAANG, startups, and tech companies. Get help with algorithms, system design, and live coding challenges.', keywords: 'coding interview AI, FAANG interview prep, technical interview AI' },
              { title: 'Freshers & Graduates', desc: 'Land your first job with confidence. Practice common interview questions and get AI coaching on how to present your skills and projects.', keywords: 'interview tips for freshers, how to get first job, AI interview practice for freshers' },
              { title: 'Product Managers', desc: 'Nail product sense, estimation, and behavioral interview questions. HelplyAI helps you structure your answers using proven frameworks.', keywords: 'PM interview prep, product manager interview AI, product sense interview' },
              { title: 'Data Scientists', desc: 'Prepare for ML system design, statistics questions, and coding challenges in Python and SQL with real-time AI assistance.', keywords: 'data science interview AI, ML interview prep, statistics interview questions' },
              { title: 'Career Changers', desc: 'Transitioning to a new field? HelplyAI helps you frame your experience, answer tough questions about career changes, and build confidence.', keywords: 'career change interview tips, switching careers interview, AI career coach' },
              { title: 'Non-Native English Speakers', desc: 'Practice interviews in English with AI coaching. HelplyAI helps improve your fluency, vocabulary, and confidence in English interviews.', keywords: 'English interview practice, interview in English AI, non-native English interview help' },
            ].map((uc, i) => (
              <article key={i} style={{ padding: 28, borderRadius: 16, border: '1px solid #eee', background: '#fff' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 10 }}>{uc.title}</h3>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 8 }}>{uc.desc}</p>
                <p style={{ fontSize: 11, color: '#999' }}>{uc.keywords}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div style={{ ...containerStyle, maxWidth: 800 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 48 }}>
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <div key={i} style={{ marginBottom: 12, borderRadius: 12, background: '#fff', border: '1px solid #eee', overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                style={{ width: '100%', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>{faq.q}</h3>
                <span style={{ fontSize: 20, color: '#555', transform: expandedFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {expandedFaq === i && (
                <div style={{ padding: '0 24px 18px' }}>
                  <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#000', marginBottom: 16 }}>
            Ready to Crack Your Next Interview?
          </h2>
          <p style={{ fontSize: 18, color: '#555', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            Join 100,000+ job seekers who have used HelplyAI to land their dream jobs. 
            Start practicing for free today.
          </p>
          <a href="/settings/dashboard" style={{ padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 700, background: '#000', color: '#fff', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            Get HelplyAI Free
          </a>
        </div>
      </section>

      {/* Footer with SEO Links */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid #eee', background: '#fafafa' }}>
        <div style={{ ...containerStyle, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 12 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/ai-interview-helper" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>AI Interview Helper</a>
              <a href="/mock-interview" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>AI Mock Interview</a>
              <a href="/coding-interview" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Coding Interview AI</a>
              <a href="/settings/billing" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Pricing</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 12 }}>Compare</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/vs/final-round-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs Final Round AI</a>
              <a href="/vs/lockedin-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs LockedIn AI</a>
              <a href="/vs/hirin-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs Hirin AI</a>
              <a href="/vs/parakeet-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs Parakeet AI</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 12 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/blog/how-to-crack-interview" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>How to Crack an Interview</a>
              <a href="/blog/ai-interview-tips" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>AI Interview Tips 2025</a>
              <a href="/blog/star-method-guide" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>STAR Method Guide</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 12 }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/privacy" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</a>
              <a href="/refund" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Refund Policy</a>
              <a href="/about" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>About Us</a>
            </div>
          </div>
        </div>
        <div style={{ ...containerStyle, textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: 13, color: '#888' }}>© 2025 HelplyAI. The #1 AI Interview Helper to Crack Any Job Interview.</p>
        </div>
      </footer>
    </div>
  );
}
