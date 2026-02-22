import { useState, useEffect } from 'react'

const Icon = ({ name, size = 24 }: { name: string; size?: number }) => {
  const icons: Record<string, React.ReactElement> = {
    MessageSquare: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    Check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    Star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    Sparkles: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
    Play: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    Code: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    Mic: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    Zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    Users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  }
  return icons[name] || null
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ background: '#fff', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Animated Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'gridMove 40s linear infinite',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'float 25s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'floatReverse 30s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 18, color: '#fff',
          }}>🌟</div>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#000' }}>HelplyAI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/" style={{
            color: '#000', fontSize: 14, fontWeight: 600, transition: 'color 0.2s',
          }}>Home</a>
          <a href="#features" style={{
            color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Features</a>
          <a href="#about" style={{
            color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >About Us</a>
          <a href="/settings/dashboard" style={{
            padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600,
            background: '#000',
            color: '#fff', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
          >Dashboard</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 100,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.08) 100%)',
          border: '1px solid rgba(0,0,0,0.1)',
          fontSize: 12, fontWeight: 600, color: '#000', marginBottom: 24,
        }}>
          <Icon name="Sparkles" size={14} />
          ✨ FULL CODING INTERVIEW SUPPORT
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900,
          lineHeight: 1.1, letterSpacing: '-1.5px', maxWidth: 900,
          marginBottom: 20,
          color: '#000',
        }}>
          Your Real-Time <span style={{
            background: 'linear-gradient(135deg, #000 0%, #000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>AI</span> Interview Assistant
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)', color: '#555',
          maxWidth: 720, lineHeight: 1.7, marginBottom: 32, fontWeight: 400,
        }}>
          Automatically get an answer to every interview question with ChatGPT AI activation. 
          An AI interview copilot. Real-time and private.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <a href="/settings/dashboard" style={{
            padding: '15px 36px', borderRadius: 100, fontSize: 15, fontWeight: 700,
            background: '#000',
            color: '#fff', display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            DASHBOARD →
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13, color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="Check" size={14} /> One-time payment
          </div>
          <div style={{ width: 1, height: 10, background: '#ddd' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="Check" size={14} /> Or subscription/lifetime
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', marginLeft: -8 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${i % 2 === 0 ? '#000' : '#333'}, ${i % 2 === 0 ? '#1a1a1a' : '#555'})`,
                  border: '2px solid #fff',
                  marginLeft: -8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                }}>{String.fromCharCode(65 + i)}</div>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>
              Used by <span style={{ fontWeight: 800 }}>1,534,135+</span> people
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => (
              <Icon key={i} name="Star" size={16} />
            ))}
            <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 700, color: '#000' }}>4.88</span>
            <span style={{ fontSize: 13, color: '#666' }}>/ 340,088+ reviews</span>
          </div>
        </div>

        {/* Video Demo */}
        <div style={{
          marginTop: 60, maxWidth: 1000, width: '100%',
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.12)',
          background: '#000',
          boxShadow: '0 24px 70px rgba(0,0,0,0.2)',
          transition: 'all 0.4s',
          position: 'relative',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 32px 90px rgba(0,0,0,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 24px 70px rgba(0,0,0,0.2)' }}
        >
          <div style={{
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: 14, color: '#fff', fontSize: 13, fontWeight: 600 }}>HelplyAI demo</span>
          </div>
          <div style={{ 
            padding: 50, 
            minHeight: 380, 
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '3px solid rgba(255,255,255,0.25)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)' }}
            >
              <Icon name="Play" size={36} />
            </div>
            <div style={{
              textAlign: 'center',
              color: '#fff',
              zIndex: 1,
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Watch HelplyAI in Action</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>See how it works in real interviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section style={{
        padding: '50px 24px',
        background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 28 }}>
            Used for 100,000+ Interviews
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center', alignItems: 'center' }}>
            {['Microsoft', 'Amazon', 'Google', 'Meta', 'Tesla'].map(company => (
              <div key={company} style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#000',
                letterSpacing: '-0.5px',
                opacity: 0.8,
                transition: 'opacity 0.3s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
              >{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Land Your Job Section */}
      <section style={{
        padding: '80px 24px',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
            color: '#000',
          }}>
            Land your next job <span style={{ color: '#84cc16' }}>effortlessly</span> 👍
          </h2>
          <p style={{ color: '#666', fontSize: 16, maxWidth: 680, margin: '0 auto 50px' }}>
            Works with any interview platform
          </p>

          <div style={{
            background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
            borderRadius: 20,
            padding: 50,
            color: '#000',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(132, 204, 22, 0.3)',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Works with any interview platform</h3>
              <p style={{ fontSize: 16, marginBottom: 24, opacity: 0.9 }}>
                You can use HelplyAI with any video or coding platform including Zoom, Google Meet, 
                Microsoft Teams, HackerRank, and LeetCode.
              </p>
              <button style={{
                padding: '12px 28px',
                borderRadius: 100,
                background: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <Icon name="Play" size={14} />
                Video tutorial: How to connect
              </button>
            </div>
            <div style={{
              position: 'absolute',
              right: -50,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 200,
              opacity: 0.1,
            }}>🚀</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {/* Speech Recognition */}
          <div style={{
            borderRadius: 18,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.1)',
            transition: 'all 0.4s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div style={{ padding: 36 }}>
              <div style={{
                display: 'inline-block',
                padding: '5px 14px',
                borderRadius: 100,
                background: '#84cc16',
                fontSize: 10,
                fontWeight: 800,
                color: '#000',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>SPEECH RECOGNITION</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                Blazing Fast Transcription
              </h3>
              
              <div style={{
                background: '#fafafa',
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon name="Mic" size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>Rob Stanley</div>
                    <div style={{ fontSize: 10, color: '#ccc' }}>Talking...</div>
                  </div>
                </div>
                <div style={{
                  height: 40,
                  background: 'linear-gradient(90deg, #84cc16 0%, #65a30d 50%, #84cc16 100%)',
                  borderRadius: 6,
                  backgroundSize: '200% 100%',
                  animation: 'waveform 1.5s ease-in-out infinite',
                }}/>
              </div>

              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                We use a state-of-the-art transcription model that provides a highly accurate transcription in 
                record breaking speed!
              </p>
            </div>
          </div>

          {/* AI Answers */}
          <div style={{
            borderRadius: 18,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.1)',
            transition: 'all 0.4s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div style={{ padding: 36 }}>
              <div style={{
                display: 'inline-block',
                padding: '5px 14px',
                borderRadius: 100,
                background: '#84cc16',
                fontSize: 10,
                fontWeight: 800,
                color: '#000',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>AI ANSWERS</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                100% Accurate Responses
              </h3>
              
              <div style={{
                background: '#f0fdf4',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                border: '1px solid #84cc16',
              }}>
                <div style={{ fontSize: 12, color: '#65a30d', marginBottom: 8, fontWeight: 600 }}>
                  💬 Some question placeholder goes here
                </div>
                <div style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 13,
                  color: '#333',
                  lineHeight: 1.6,
                }}>
                  tellus velit suspicing vestibulum tellus velit.
                </div>
              </div>

              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                You choose between GPT-5, GPT-4.1 and Claude 4.0 Sonnet, the best LLMs available, to 
                provide the most accurate answers.
              </p>
            </div>
          </div>

          {/* Programming */}
          <div style={{
            borderRadius: 18,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.1)',
            transition: 'all 0.4s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div style={{ padding: 36 }}>
              <div style={{
                display: 'inline-block',
                padding: '5px 14px',
                borderRadius: 100,
                background: '#06b6d4',
                fontSize: 10,
                fontWeight: 800,
                color: '#000',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>PROGRAMMING</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                Full Coding Interview Support
              </h3>
              
              <div style={{
                background: '#0a0a0a',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                fontFamily: 'monospace',
              }}>
                <div style={{ color: '#84cc16', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: '#06b6d4' }}>function</span> generatePrimes(n) {'{'}
                </div>
                <div style={{ color: '#fff', fontSize: 12, paddingLeft: 16, marginBottom: 4 }}>
                  <span style={{ color: '#999' }}>if</span> (num {'<'} <span style={{ color: '#84cc16' }}>2</span>) <span style={{ color: '#999' }}>return</span> [];
                </div>
                <div style={{ color: '#84cc16', fontSize: 12 }}>{'}'}</div>
              </div>

              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                You can use HelplyAI for coding interviews. It can both listen for coding questions and capture the 
                screen if a LeetCode-style question is being screen shared with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: '80px 24px',
        background: '#fafafa',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
              color: '#000',
            }}>
              People love HelplyAI 💬
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { name: 'Sarah Chen', role: 'Software Engineer @ Google', text: 'HelplyAI helped me ace my coding interviews! The real-time suggestions were incredibly accurate and natural.' },
              { name: 'Michael Rodriguez', role: 'Product Manager @ Meta', text: 'The screen analysis feature is a game-changer. Saved me during technical rounds.' },
              { name: 'Emily Watson', role: 'Data Scientist @ Amazon', text: 'Best AI interview helper I\'ve used. Gave me confidence during my interviews.' },
            ].map((testimonial, i) => (
              <div key={i} style={{
                padding: 28,
                borderRadius: 16,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)' }}
              >
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(j => (
                    <Icon key={j} name="Star" size={16} />
                  ))}
                </div>
                <p style={{ color: '#333', fontSize: 15, lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' }}>
                  "{testimonial.text}"
                </p>
                <div>
                  <div style={{ color: '#000', fontSize: 14, fontWeight: 700 }}>{testimonial.name}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{
        padding: '80px 24px',
        background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 20,
            color: '#000',
          }}>
            About HelplyAI
          </h2>
          <p style={{ color: '#666', fontSize: 17, lineHeight: 1.8, marginBottom: 32 }}>
            We're on a mission to democratize interview success. HelplyAI was built by engineers who understand 
            the challenges of technical interviews. Our AI-powered platform has helped over 1.5 million candidates 
            land their dream jobs at top tech companies.
          </p>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#000', marginBottom: 8 }}>1.5M+</div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>Users Worldwide</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#000', marginBottom: 8 }}>100K+</div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>Successful Interviews</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#000', marginBottom: 8 }}>4.88</div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: '#000',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 16,
          }}>
            100% Private and Invisible on Screen Share
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 36 }}>
            Get started with HelplyAI and boost your interview success today.
          </p>

          <a href="/settings/dashboard" style={{
            display: 'inline-block',
            padding: '16px 40px', borderRadius: 100, fontSize: 16, fontWeight: 700,
            background: '#fff',
            color: '#000', transition: 'all 0.3s',
            boxShadow: '0 4px 16px rgba(255,255,255,0.2)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,255,255,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.2)' }}
          >
            Go to Dashboard →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px 40px',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        background: '#fafafa',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #000, #1a1a1a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 16, color: '#fff',
              }}>🌟</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#000' }}>HelplyAI</span>
            </div>
            <p style={{ color: '#666', fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>
              Your AI-powered interview assistant. Real-time support for coding and behavioral interviews.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 60 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 16 }}>Product</div>
              <a href="#features" style={{ display: 'block', color: '#666', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#000')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >Features</a>
              <a href="/settings/dashboard" style={{ display: 'block', color: '#666', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#000')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >Dashboard</a>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 16 }}>Company</div>
              <a href="#about" style={{ display: 'block', color: '#666', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#000')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >About Us</a>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: 1100, margin: '40px auto 0', paddingTop: 24,
          borderTop: '1px solid rgba(0,0,0,0.08)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          <span style={{ color: '#999', fontSize: 13 }}>© 2026 HelplyAI. All rights reserved.</span>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(30px) rotate(-5deg); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes waveform {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      </div>
    </div>
  )
}
