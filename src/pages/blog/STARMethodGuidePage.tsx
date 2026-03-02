import SEOHead from '../../components/SEOHead';

export default function STARMethodGuidePage() {
  const containerStyle: React.CSSProperties = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

  const examples = [
    {
      question: 'Tell me about a time you had to deal with a difficult team member.',
      situation: 'During a 6-month product launch at my previous company, one of our senior developers consistently missed deadlines and was resistant to code reviews.',
      task: 'As the tech lead, I was responsible for ensuring on-time delivery while maintaining team morale and code quality standards.',
      action: 'I scheduled a private 1-on-1 meeting to understand their perspective. I discovered they were overwhelmed with legacy system maintenance alongside new features. I redistributed the legacy work, set up pair programming sessions, and created a shared sprint board for visibility.',
      result: 'The developer became our most reliable contributor within 2 sprints. We launched on time, code review participation increased by 40%, and the approach was adopted as a team-wide practice for onboarding.',
    },
    {
      question: 'Describe a project where you had to learn a new technology quickly.',
      situation: 'Our company won a contract that required building a real-time data pipeline using Apache Kafka, which nobody on our team had experience with.',
      task: 'I volunteered to lead the technical implementation and needed to become proficient in Kafka within 3 weeks before the project kickoff.',
      action: 'I completed an online course, built two proof-of-concept applications, joined the Kafka community Slack for expert advice, and documented my learnings in a team wiki. I also set up a sandbox environment for the team to experiment.',
      result: 'We delivered the data pipeline 2 weeks ahead of schedule. The pipeline processed 1M+ events daily with 99.9% uptime. My documentation became the company standard for Kafka projects.',
    },
    {
      question: 'Give an example of when you failed and what you learned.',
      situation: 'I led the migration of our monolithic application to microservices. We planned a big-bang release instead of an incremental approach.',
      task: 'As the architect, I was responsible for the migration strategy and ensuring zero downtime during the transition.',
      action: 'The big-bang release caused 4 hours of downtime due to unexpected service dependencies. I immediately coordinated a rollback, then redesigned the strategy to use the strangler fig pattern — incrementally replacing services one at a time.',
      result: 'The revised approach took 2 months longer but resulted in zero downtime. I created a migration playbook that was used for 3 subsequent projects. I learned that incremental changes are always safer for production systems.',
    },
  ];

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <SEOHead
        title="STAR Method Guide – Master Behavioral Interviews with AI | HelplyAI"
        description="Complete STAR Method guide with real examples for behavioral interviews. Learn how to structure perfect answers using Situation, Task, Action, Result. AI-powered coaching for behavioral interview preparation."
        keywords="STAR method, STAR method examples, behavioral interview questions, STAR interview technique, how to answer behavioral questions, STAR method guide, behavioral interview tips, STAR method practice, interview answer framework"
        canonical="https://www.helplyai.co/blog/star-method-guide"
        ogType="article"
      />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src="/favicon.png" alt="HelplyAI" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span style={{ fontSize: 19, fontWeight: 800, color: '#000' }}>Helply AI</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="/ai-interview-helper" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>AI Interview Helper</a>
          <a href="/settings/dashboard" style={{ padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#000', color: '#fff', textDecoration: 'none' }}>Get Started Free</a>
        </div>
      </nav>

      <article style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={containerStyle}>
          <nav style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
            <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a> → <a href="/blog/star-method-guide" style={{ color: '#555', textDecoration: 'none' }}>Blog</a> → STAR Method Guide
          </nav>

          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: '#dcfce7', fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 16 }}>Interview Guide</span>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#000', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            The STAR Method: Complete Guide to Crushing Behavioral Interviews
          </h1>
          <p style={{ fontSize: 16, color: '#888', marginBottom: 32 }}>Updated March 2025 · 15 min read</p>

          <p style={{ fontSize: 17, color: '#333', lineHeight: 1.9, marginBottom: 24 }}>
            The <strong>STAR Method</strong> is the gold standard framework for answering behavioral interview questions. 
            Used by candidates interviewing at Google, Amazon, Meta, Microsoft, and every top company, this technique helps you 
            deliver structured, compelling answers that demonstrate your skills through real experiences.
          </p>

          {/* What is STAR */}
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#000', marginTop: 48, marginBottom: 16 }}>
            What is the STAR Method?
          </h2>
          <p style={{ fontSize: 17, color: '#333', lineHeight: 1.9, marginBottom: 16 }}>
            STAR stands for <strong>Situation, Task, Action, Result</strong>. It is a structured approach to answering behavioral 
            interview questions — questions that start with "Tell me about a time when..." or "Give me an example of..."
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { letter: 'S', word: 'Situation', desc: 'Set the context. What was happening? Where were you working? What was the project?' },
              { letter: 'T', word: 'Task', desc: 'What was YOUR specific responsibility or goal in this situation?' },
              { letter: 'A', word: 'Action', desc: 'What did YOU do? Be specific about your individual contributions.' },
              { letter: 'R', word: 'Result', desc: 'What was the outcome? Use metrics and measurable impact whenever possible.' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 12, background: '#f8f9fa', border: '1px solid #eee', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#000', color: '#fff', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  {s.letter}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000', marginBottom: 6 }}>{s.word}</h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Common Questions */}
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#000', marginTop: 48, marginBottom: 16 }}>
            Top Behavioral Interview Questions (with STAR Framework)
          </h2>
          <p style={{ fontSize: 17, color: '#333', lineHeight: 1.9, marginBottom: 16 }}>
            Here are the most common behavioral questions asked at top companies. Prepare a STAR answer for each:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 32 }}>
            {[
              'Tell me about a time you faced a conflict at work.',
              'Describe a situation where you had to lead a team through a challenge.',
              'Give an example of when you failed and what you learned.',
              'Tell me about a time you had to make a difficult decision with incomplete information.',
              'Describe a project where you had to learn a new technology quickly.',
              'Tell me about a time you went above and beyond for a customer or stakeholder.',
              'Give an example of when you disagreed with your manager. How did you handle it?',
              'Describe a time when you had to prioritize multiple urgent tasks.',
              'Tell me about your most impactful project and why it mattered.',
              'Give an example of when you improved a process or system.',
            ].map((q, i) => (
              <li key={i} style={{ fontSize: 15, color: '#333', lineHeight: 1.9, marginBottom: 6 }}>{q}</li>
            ))}
          </ul>

          {/* Real Examples */}
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#000', marginTop: 48, marginBottom: 24 }}>
            STAR Method Examples: Real Interview Answers
          </h2>
          {examples.map((ex, i) => (
            <div key={i} style={{ marginBottom: 32, padding: 24, borderRadius: 12, background: '#f8f9fa', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 16 }}>Q: "{ex.question}"</h3>
              <div style={{ marginBottom: 12 }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#dbeafe', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>SITUATION</span>
                <p style={{ fontSize: 15, color: '#333', lineHeight: 1.7, margin: 0 }}>{ex.situation}</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#fef3c7', fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>TASK</span>
                <p style={{ fontSize: 15, color: '#333', lineHeight: 1.7, margin: 0 }}>{ex.task}</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#dcfce7', fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>ACTION</span>
                <p style={{ fontSize: 15, color: '#333', lineHeight: 1.7, margin: 0 }}>{ex.action}</p>
              </div>
              <div>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#fce7f3', fontSize: 12, fontWeight: 700, color: '#9d174d', marginBottom: 6 }}>RESULT</span>
                <p style={{ fontSize: 15, color: '#333', lineHeight: 1.7, margin: 0 }}>{ex.result}</p>
              </div>
            </div>
          ))}

          {/* Tips */}
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#000', marginTop: 48, marginBottom: 16 }}>
            STAR Method Pro Tips
          </h2>
          <ul style={{ paddingLeft: 24, marginBottom: 32 }}>
            <li style={{ fontSize: 16, color: '#333', lineHeight: 1.9, marginBottom: 8 }}><strong>Keep it concise</strong> — Your full STAR answer should be 1.5-2 minutes. The Situation should be brief (15-20 seconds).</li>
            <li style={{ fontSize: 16, color: '#333', lineHeight: 1.9, marginBottom: 8 }}><strong>Focus on YOUR actions</strong> — Use "I" not "we." Interviewers want to know what YOU specifically did.</li>
            <li style={{ fontSize: 16, color: '#333', lineHeight: 1.9, marginBottom: 8 }}><strong>Quantify your results</strong> — Use numbers, percentages, and metrics. "Reduced load time by 40%" is better than "made it faster."</li>
            <li style={{ fontSize: 16, color: '#333', lineHeight: 1.9, marginBottom: 8 }}><strong>Prepare 7-10 stories</strong> — Have versatile stories that can be adapted for different questions.</li>
            <li style={{ fontSize: 16, color: '#333', lineHeight: 1.9, marginBottom: 8 }}><strong>Practice with AI</strong> — Use <a href="/ai-interview-helper" style={{ color: '#2563eb' }}>HelplyAI</a> to practice STAR answers with instant AI feedback and coaching.</li>
          </ul>

          {/* CTA */}
          <div style={{ padding: 24, borderRadius: 12, background: '#000', color: '#fff', marginBottom: 32, textAlign: 'center' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Practice STAR Answers with AI Coaching</h3>
            <p style={{ fontSize: 15, opacity: 0.8, marginBottom: 16 }}>HelplyAI helps you structure perfect behavioral interview answers in real-time.</p>
            <a href="/settings/dashboard" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, background: '#fff', color: '#000', textDecoration: 'none', display: 'inline-block' }}>Get HelplyAI Free</a>
          </div>

          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000', marginBottom: 16 }}>Related Articles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <a href="/blog/how-to-crack-interview" style={{ padding: 20, borderRadius: 12, border: '1px solid #eee', textDecoration: 'none', display: 'block' }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 6 }}>How to Crack Any Interview</h4>
                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Complete interview preparation guide.</p>
              </a>
              <a href="/blog/ai-interview-tips" style={{ padding: 20, borderRadius: 12, border: '1px solid #eee', textDecoration: 'none', display: 'block' }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 6 }}>AI Interview Tips 2025</h4>
                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Use AI to ace your interviews.</p>
              </a>
            </div>
          </div>
        </div>
      </article>

      <footer style={{ padding: '32px 0', borderTop: '1px solid #eee', background: '#fafafa', textAlign: 'center' }}>
        <div style={containerStyle}>
          <p style={{ fontSize: 12, color: '#999' }}>© 2025 HelplyAI. The #1 AI Interview Helper to Crack Any Job Interview.</p>
        </div>
      </footer>
    </div>
  );
}
