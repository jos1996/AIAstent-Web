import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

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
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'windows' | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDownloadClick = (platform: 'ios' | 'windows') => {
    setSelectedPlatform(platform)
    setShowDownloadModal(true)
  }

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
          <img src="/favicon.png" alt="Helply AI" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span style={{ fontSize: 19, fontWeight: 800, color: '#000', letterSpacing: '-0.02em' }}>Helply AI</span>
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
            color: '#fff', transition: 'all 0.3s', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
          >{user ? 'Dashboard' : 'Sign In'}</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px', textAlign: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
        position: 'relative',
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
          fontSize: 'clamp(29px, 5vw, 54px)', fontWeight: 900,
          lineHeight: 1.1, letterSpacing: '-1.2px', maxWidth: 900,
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

        {/* Download Buttons */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <button onClick={() => handleDownloadClick('ios')} style={{
            padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600,
            background: '#000', color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
            border: 'none', cursor: 'pointer',
            transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; e.currentTarget.style.background = '#1a1a1a' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; e.currentTarget.style.background = '#000' }}
          >
            <svg width="20" height="20" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            <span>Download for iOS</span>
          </button>
          <button onClick={() => handleDownloadClick('windows')} style={{
            padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600,
            background: '#000', color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
            border: 'none', cursor: 'pointer',
            transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; e.currentTarget.style.background = '#1a1a1a' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; e.currentTarget.style.background = '#000' }}
          >
            <svg width="20" height="20" viewBox="0 0 88 88" fill="currentColor">
              <path d="M0 12.402l35.687-4.8602.0156 34.423-35.67.20313zm35.67 33.529.0277 34.453-35.67-4.9041-.002-29.78zm4.3261-39.025l47.318-6.906v41.527l-47.318.37565zm47.329 39.349-.0111 41.34-47.318-6.6784-.0663-34.739z"/>
            </svg>
            <span>Download for Windows</span>
          </button>
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

      {/* Success Statistics Banner */}
      <section style={{
        padding: '40px 24px',
        background: '#000',
        color: '#fff',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>100K+</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Successful Interviews</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>90%</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Success Rate</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>1.5M+</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Active Users</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>4.88</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Company Logos */}
      <section style={{
        padding: '80px 24px',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
            color: '#000',
          }}>
            Cracked Interviews at Top Companies
          </h2>
          <p style={{ color: '#666', fontSize: 16, marginBottom: 50, maxWidth: 700, margin: '0 auto 50px' }}>
            Join thousands of successful candidates who landed their dream jobs at these leading companies
          </p>
          
          <style>{`
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .logo-scroll {
              animation: scroll-left 40s linear infinite;
            }
            .logo-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Row 1 */}
          <div style={{ overflow: 'hidden', marginBottom: 24 }}>
            <div className="logo-scroll" style={{ display: 'flex', gap: 32, width: 'max-content' }}>
              {[
                { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
                { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
                { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
                { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
                { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
                { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
                { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
                { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
                { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
                { name: 'Spotify', logo: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png' },
                { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg' },
                { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
                { name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
                { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
                { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg' },
                { name: 'NVIDIA', logo: 'https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg' },
                { name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
                { name: 'LinkedIn', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
                { name: 'Twitter', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
                { name: 'Snapchat', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg' },
              ].concat([
                { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
                { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
                { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
                { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
                { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
                { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
                { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
                { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
                { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
                { name: 'Spotify', logo: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png' },
                { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg' },
                { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
                { name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
                { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
                { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg' },
                { name: 'NVIDIA', logo: 'https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg' },
                { name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
                { name: 'LinkedIn', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
                { name: 'Twitter', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
                { name: 'Snapchat', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg' },
              ]).map((company, i) => (
                <div key={i} style={{
                  padding: '16px 24px',
                  borderRadius: 12,
                  background: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 160,
                  height: 80,
                  flexShrink: 0,
                }}>
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    style={{ maxWidth: 140, maxHeight: 50, objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div style="font-size: 16px; font-weight: 700; color: #000;">${company.name}</div>`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ overflow: 'hidden', marginBottom: 40 }}>
            <div className="logo-scroll" style={{ display: 'flex', gap: 32, width: 'max-content' }}>
              {[
                { name: 'Dropbox', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg' },
                { name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
                { name: 'Zoom', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg' },
                { name: 'Shopify', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg' },
                { name: 'Square', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Square%2C_Inc._-_Square_Logo.svg' },
                { name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
                { name: 'Coinbase', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg' },
                { name: 'Robinhood', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Robinhood_Markets_Logo.svg' },
                { name: 'DoorDash', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/DoorDash_Logo.svg' },
                { name: 'Instacart', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Instacart_logo_and_wordmark.svg' },
                { name: 'Lyft', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Lyft_logo.svg' },
                { name: 'Pinterest', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png' },
                { name: 'Reddit', logo: 'https://upload.wikimedia.org/wikipedia/en/b/bd/Reddit_Logo_Icon.svg' },
                { name: 'TikTok', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg' },
                { name: 'Discord', logo: 'https://upload.wikimedia.org/wikipedia/en/9/98/Discord_logo.svg' },
                { name: 'Twitch', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Twitch_logo.svg' },
                { name: 'GitHub', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
                { name: 'GitLab', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg' },
                { name: 'Atlassian', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Atlassian-horizontal-blue-rgb.svg' },
                { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
              ].concat([
                { name: 'Dropbox', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg' },
                { name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
                { name: 'Zoom', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg' },
                { name: 'Shopify', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg' },
                { name: 'Square', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Square%2C_Inc._-_Square_Logo.svg' },
                { name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
                { name: 'Coinbase', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg' },
                { name: 'Robinhood', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Robinhood_Markets_Logo.svg' },
                { name: 'DoorDash', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/DoorDash_Logo.svg' },
                { name: 'Instacart', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Instacart_logo_and_wordmark.svg' },
                { name: 'Lyft', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Lyft_logo.svg' },
                { name: 'Pinterest', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png' },
                { name: 'Reddit', logo: 'https://upload.wikimedia.org/wikipedia/en/b/bd/Reddit_Logo_Icon.svg' },
                { name: 'TikTok', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg' },
                { name: 'Discord', logo: 'https://upload.wikimedia.org/wikipedia/en/9/98/Discord_logo.svg' },
                { name: 'Twitch', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Twitch_logo.svg' },
                { name: 'GitHub', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
                { name: 'GitLab', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg' },
                { name: 'Atlassian', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Atlassian-horizontal-blue-rgb.svg' },
                { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
              ]).map((company, i) => (
                <div key={i} style={{
                  padding: '16px 24px',
                  borderRadius: 12,
                  background: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 160,
                  height: 80,
                  flexShrink: 0,
                }}>
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    style={{ maxWidth: 140, maxHeight: 50, objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div style="font-size: 16px; font-weight: 700; color: #000;">${company.name}</div>`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '80px 24px',
        background: '#fafafa',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
              color: '#000',
            }}>
              How HelplyAI Works
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 680, margin: '0 auto' }}>
              Get real-time AI assistance during your interviews in 4 simple steps
            </p>
          </div>

          <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
            {/* Flow Line */}
            <div style={{
              position: 'absolute',
              top: 80,
              left: '10%',
              right: '10%',
              height: 2,
              background: 'linear-gradient(90deg, #000 0%, #000 25%, #000 50%, #000 75%, #000 100%)',
              zIndex: 0,
            }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, position: 'relative', zIndex: 1 }}>
              {[
                { 
                  step: '1', 
                  title: 'Setup', 
                  desc: 'Install HelplyAI and connect to your interview platform',
                  icon: '⚙️'
                },
                { 
                  step: '2', 
                  title: 'Upload Resume', 
                  desc: 'Upload your resume for personalized answers',
                  icon: '📄'
                },
                { 
                  step: '3', 
                  title: 'Start Interview', 
                  desc: 'AI listens and transcribes questions in real-time',
                  icon: '🎤'
                },
                { 
                  step: '4', 
                  title: 'Get Answers', 
                  desc: 'Receive instant, accurate answers on your screen',
                  icon: '✨'
                },
              ].map((item, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: '#000',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    margin: '0 auto 20px',
                    position: 'relative',
                    zIndex: 2,
                    border: '4px solid #fafafa',
                    transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {item.icon}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '2px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#000',
                    zIndex: 3,
                  }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#000' }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <a href="/settings/dashboard" style={{
              display: 'inline-block',
              padding: '16px 40px',
              borderRadius: 100,
              background: '#000',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              transition: 'all 0.3s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              Get Started Now →
            </a>
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
            Land your next job <span style={{ color: '#000' }}>effortlessly</span> 👍
          </h2>
          <p style={{ color: '#666', fontSize: 16, maxWidth: 680, margin: '0 auto 50px' }}>
            Works with any interview platform
          </p>

          <div style={{
            background: '#000',
            borderRadius: 20,
            padding: 50,
            color: '#fff',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(132, 204, 22, 0.3)',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, color: '#fff' }}>Works with any interview platform</h3>
              <p style={{ fontSize: 16, marginBottom: 24, opacity: 0.9, color: '#fff' }}>
                You can use HelplyAI with any video or coding platform including Zoom, Google Meet, 
                Microsoft Teams, HackerRank, and LeetCode.
              </p>
              <button style={{
                padding: '12px 28px',
                borderRadius: 100,
                background: '#fff',
                color: '#000',
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

      {/* Privacy Demo Videos Section */}
      <section style={{
        padding: '80px 24px',
        background: '#fafafa',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 100,
              background: '#000',
              fontSize: 11,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 20,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>✓ Cursor Undetectable</div>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
              color: '#000',
            }}>
              Privacy Demo Videos
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 60 }}>
            {[
              { name: 'Zoom', logo: 'https://cdn.worldvectorlogo.com/logos/zoom-communications-logo.svg', status: 'Undetectable, checked 15h ago' },
              { name: 'Microsoft Teams', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg', status: 'Undetectable, checked 15h ago' },
              { name: 'Google Meet', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg', status: 'Undetectable, checked 13h ago' },
              { name: 'Webex', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Webex_logo.svg', status: 'Undetectable, checked 13h ago' },
              { name: 'Lark/Feishu', logo: 'https://sf16-va.larksuitecdn.com/obj/lark-artifact-storage/baas/lark_suite_logo.svg', status: 'Undetectable, checked 19h ago' },
              { name: 'Amazon Chime', logo: 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png', status: 'Undetectable, checked 16h ago' },
              { name: 'Coderspad.io', logo: 'https://via.placeholder.com/40x40/000000/FFFFFF?text=CP', status: 'Undetectable, checked 16h ago' },
              { name: 'HackerRank', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png', status: 'Undetectable, checked 16h ago' },
            ].map((platform, i) => (
              <div key={i} style={{
                padding: 20,
                borderRadius: 14,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={platform.logo} alt={platform.name} style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/32x32/000000/FFFFFF?text=' + platform.name.charAt(0) }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 4 }}>{platform.name}</div>
                    <div style={{ fontSize: 11, color: '#000', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }}></span>
                      {platform.status}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: '#999' }}>→</div>
              </div>
            ))}
          </div>

          {/* Resume Upload & Auto Generate */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Upload Resume */}
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
                  background: '#000',
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: 20,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>RESUME</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                  Upload your Resume
                </h3>
                
                <div style={{
                  background: '#fafafa',
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 20,
                  textAlign: 'center',
                  border: '2px dashed rgba(0,0,0,0.1)',
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    border: '2px solid #000',
                  }}>
                    <span style={{ fontSize: 24 }}>⭐</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#000', marginBottom: 4 }}>Rob Parsley</div>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 16 }}>Lorem ipsum dolor sit amet consectetuer...</div>
                  <div style={{ fontSize: 10, color: '#000', fontWeight: 600 }}>Senior Software Engineer</div>
                </div>

                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                  Upload once and get instant interview answers perfectly matched to your experience and background.
                </p>
              </div>
            </div>

            {/* Auto Generate */}
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
                  background: '#000',
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: 20,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>INSTANT ANSWERS</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                  Auto Generate
                </h3>
                
                <div style={{
                  background: '#fafafa',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 20,
                  border: '1px solid #000',
                }}>
                  <div style={{ fontSize: 13, color: '#000', marginBottom: 12, fontWeight: 600 }}>
                    Our platform integrates with major cloud providers. Do you have a preferred cloud environment?
                  </div>
                  <div style={{
                    background: '#fff',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}>👤</div>
                    <div style={{ fontSize: 12, color: '#666' }}>...</div>
                  </div>
                </div>

                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                  Parakeet automatically detects questions and auto generate answers. This ensures you're well-prepared and confident.
                </p>
              </div>
            </div>
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
                background: '#000',
                fontSize: 10,
                fontWeight: 800,
                color: '#fff',
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
                  background: 'linear-gradient(90deg, #000 0%, #333 50%, #000 100%)',
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
                background: '#000',
                fontSize: 10,
                fontWeight: 800,
                color: '#fff',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>AI ANSWERS</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                100% Accurate Responses
              </h3>
              
              <div style={{
                background: '#fafafa',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                border: '1px solid #000',
              }}>
                <div style={{ fontSize: 12, color: '#000', marginBottom: 8, fontWeight: 600 }}>
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
                <div style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: '#999' }}>function</span> generatePrimes(n) {'{'}
                </div>
                <div style={{ color: '#fff', fontSize: 12, paddingLeft: 16, marginBottom: 4 }}>
                  <span style={{ color: '#999' }}>if</span> (num {'<'} <span style={{ color: '#fff' }}>2</span>) <span style={{ color: '#999' }}>return</span> [];
                </div>
                <div style={{ color: '#fff', fontSize: 12 }}>{'}'}</div>
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
              { name: 'Sarah Chen', role: 'Software Engineer @ Google', text: 'HelplyAI helped me ace my coding interviews! The real-time suggestions were incredibly accurate and natural.', avatar: 'https://i.pravatar.cc/150?img=5' },
              { name: 'Michael Rodriguez', role: 'Product Manager @ Meta', text: 'The screen analysis feature is a game-changer. Saved me during technical rounds.', avatar: 'https://i.pravatar.cc/150?img=12' },
              { name: 'Emily Watson', role: 'Data Scientist @ Amazon', text: 'Best AI interview helper I\'ve used. Gave me confidence during my interviews.', avatar: 'https://i.pravatar.cc/150?img=9' },
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={testimonial.avatar} alt={testimonial.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ color: '#000', fontSize: 14, fontWeight: 700 }}>{testimonial.name}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section style={{
        padding: '60px 24px',
        background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#666', marginBottom: 24 }}>
            Accepted Payment Methods
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
            {['💳 Visa', '💳 Mastercard', '💳 Amex', '📱 Apple Pay', '🔵 Google Pay', '💰 UPI', '💵 GPay', '📲 PhonePe'].map((method, i) => (
              <div key={i} style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: '#fafafa',
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 13,
                fontWeight: 600,
                color: '#666',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#000' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)' }}
              >{method}</div>
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

      {/* Download Modal */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }} onClick={() => setShowDownloadModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 40,
            maxWidth: 600, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button onClick={() => setShowDownloadModal(false)} style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius: '50%',
              background: '#f5f5f5', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#666', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5'; e.currentTarget.style.color = '#000' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#666' }}
            >×</button>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                {selectedPlatform === 'ios' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                  </svg>
                )}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#000', marginBottom: 8 }}>
                Download HelplyAI for {selectedPlatform === 'ios' ? 'iOS' : 'Windows'}
              </h2>
              <p style={{ fontSize: 15, color: '#666' }}>Choose your user type to download the application</p>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {/* Corporate User Download */}
              <a href="#" style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: 24, borderRadius: 16,
                background: '#fafafa', border: '2px solid rgba(0,0,0,0.08)',
                textDecoration: 'none', transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 4 }}>
                    Corporate User
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    Download application for corporate/enterprise use
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </a>

              {/* Individual User Download */}
              <a href="#" style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: 24, borderRadius: 16,
                background: '#fafafa', border: '2px solid rgba(0,0,0,0.08)',
                textDecoration: 'none', transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 4 }}>
                    Individual User
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    Download application for personal use
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </a>
            </div>

            <div style={{
              marginTop: 24, padding: 16, borderRadius: 12,
              background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
                💡 <strong>Note:</strong> Corporate users get advanced features including team management, analytics, and priority support.
              </p>
            </div>
          </div>
        </div>
      )}

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
              <a href="/privacy" style={{ display: 'block', color: '#666', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#000')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >Privacy Policy</a>
              <a href="/refund" style={{ display: 'block', color: '#666', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#000')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >Refund Policy</a>
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
