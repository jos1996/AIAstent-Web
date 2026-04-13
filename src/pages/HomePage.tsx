import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { DOWNLOAD_LINKS } from '../config/releases'
import { trackVideoPlayed, trackVideoPaused, trackCTAClick, trackDownload } from '../lib/analytics'

function VideoDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
    setIsPlaying(true);
    trackVideoPlayed();
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    videoRef.current?.pause();
    setIsPlaying(false);
    trackVideoPaused();
  };

  return (
    <div style={{ marginTop: 60, width: '100%', maxWidth: 1000, margin: '60px auto 0' }}>
      <div
        style={{
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.12)',
          background: '#000',
          boxShadow: isHovered ? '0 32px 90px rgba(0,0,0,0.3)' : '0 24px 70px rgba(0,0,0,0.2)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'all 0.4s',
          position: 'relative',
          cursor: 'pointer',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 14, color: '#fff', fontSize: 13, fontWeight: 600 }}>HelplyAI — Live Demo</span>
        </div>
        <div style={{ position: 'relative', background: '#000', lineHeight: 0 }}>
          <video
            ref={videoRef}
            src="https://beeptalk.s3.eu-north-1.amazonaws.com/AI+bot.mp4"
            muted
            loop
            playsInline
            preload="metadata"
            style={{ width: '100%', display: 'block', maxHeight: 520, objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isPlaying ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.45)',
            transition: 'background 0.3s',
            pointerEvents: 'none',
          }}>
            {!isPlaying && (
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    Settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-6.364 0L3.636 17.364m12.728 0l-4.243-4.243m-6.364 0L3.636 6.636"/></svg>,
    Briefcase: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    Monitor: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    Bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    Rocket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    BarChart3: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
    ArrowRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  }
  return icons[name] || null
}

export default function HomePage() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'windows' | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Capture referral code from URL and store in localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refCode = params.get('ref')
    if (refCode) {
      localStorage.setItem('referral_code', refCode.toUpperCase())
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleDownloadClick = (platform: 'ios' | 'windows') => {
    setSelectedPlatform(platform)
    setShowDownloadModal(true)
  }

  // Use centralized download links from config/releases.ts
  const downloadLinks = DOWNLOAD_LINKS;

  const handleDirectDownload = (url: string) => {
    const platform = url.includes('aarch64') ? 'mac_apple_silicon' : url.includes('x86_64') && url.includes('.dmg') ? 'mac_intel' : url.includes('.msi') ? 'windows_msi' : 'windows_nsis';
    trackDownload(platform);
    window.open(url, '_blank')
    setShowDownloadModal(false)
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 25%, #f0f0f0 50%, #e8e8e8 75%, #e0e0e0 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
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
          <a href="#pricing" style={{
            color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Pricing</a>
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
        textAlign: 'center', padding: '80px 24px 60px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.8) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated Grid Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
          opacity: 0.4,
          zIndex: 0,
        }} />
        {/* Animated Dots */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          animation: 'dotFloat 15s ease-in-out infinite',
          opacity: 0.3,
          zIndex: 0,
        }} />
        {/* Content wrapper with higher z-index */}
        <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px',
          background: 'rgba(0,0,0,0.04)', borderRadius: 24, border: '1px solid rgba(0,0,0,0.08)',
          fontSize: 12, fontWeight: 600, color: '#000', marginBottom: 24,
          margin: '0 auto 24px',
        }}>
          <Icon name="Sparkles" size={14} />
          ✨ PRACTICE & IMPROVE YOUR INTERVIEW SKILLS
        </div>

        <h1 style={{
          fontSize: 'clamp(22px, 3.75vw, 40px)', fontWeight: 900,
          lineHeight: 1.1, letterSpacing: '-1px', maxWidth: 900,
          marginBottom: 16,
          color: '#000',
          textAlign: 'center',
          margin: '0 auto 16px',
        }}>
          Your Real-Time <span style={{
            background: 'linear-gradient(135deg, #000 0%, #000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Interview</span> Assistant
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)', color: '#1a1a1a',
          maxWidth: 720, lineHeight: 1.6, marginBottom: 20, fontWeight: 600,
          textAlign: 'center',
          margin: '0 auto 20px',
        }}>
          <strong>Crack your first job</strong> with AI-powered interview practice at an <strong>affordable price</strong>
        </p>

        <p style={{
          fontSize: 'clamp(13px, 1.6vw, 15px)', color: '#666',
          maxWidth: 680, lineHeight: 1.7, marginBottom: 32, fontWeight: 400,
          textAlign: 'center',
          margin: '0 auto 32px',
        }}>
          Master <strong>interview skills</strong>, build <strong>confidence</strong>, and land your <strong>dream job</strong> with real-time AI feedback. Perfect for <strong>freshers</strong> and <strong>job seekers</strong> preparing for technical and HR interviews.
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

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center', padding: '20px 32px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', marginLeft: -8 }}>
              {[
                'https://randomuser.me/api/portraits/men/32.jpg',
                'https://randomuser.me/api/portraits/women/44.jpg',
                'https://randomuser.me/api/portraits/men/67.jpg',
                'https://randomuser.me/api/portraits/women/21.jpg',
                'https://randomuser.me/api/portraits/men/85.jpg',
              ].map((img, i) => (
                <img key={i} src={img} alt="User" style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '3px solid #fff',
                  marginLeft: -12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  objectFit: 'cover',
                }} />
              ))}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#000', marginLeft: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>100K+</span> users worldwide
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFB800" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#000' }}>4.9</span>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>from <span style={{ fontWeight: 700, color: '#000' }}>30K+</span> reviews</span>
            </div>
          </div>
        </div>

        {/* Video Demo */}
        <VideoDemo />
        </div>
      </section>

      {/* CSS Animations */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes dotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

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

      {/* Promotional Images Section */}
      <section style={{
        padding: '60px 24px',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: 32,
          }}>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)' }}
            >
              <img src="/promo-1.png" alt="HelplyAI Interview Assistant" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)' }}
            >
              <img src="/promo-2.png" alt="HelplyAI Real-Time Assistance" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '50px 24px',
        background: '#fafafa',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: 100,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.08) 100%)',
              border: '1px solid rgba(0,0,0,0.1)',
              fontSize: 13,
              fontWeight: 700,
              color: '#000',
              marginBottom: 20,
            }}>
              YOUR PERSONAL AI ASSISTANT
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
              color: '#000',
            }}>
              How Helply AI Works
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 720, margin: '0 auto', lineHeight: 1.6 }}>
              Your complete AI-powered productivity assistant for interviews, work, and daily tasks
            </p>
          </div>

          <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, position: 'relative', zIndex: 1 }}>
              {[
                { 
                  step: '1', 
                  title: 'Setup & Install', 
                  desc: 'Download AI interview assistant for iOS and Windows. Quick setup for job seekers and freshers preparing for interviews.',
                  iconName: 'Settings',
                  color: '#000'
                },
                { 
                  step: '2', 
                  title: 'Interview Mode', 
                  desc: 'Activate interview preparation mode with resume and job description for personalized technical and HR interview practice.',
                  iconName: 'Briefcase',
                  color: '#000'
                },
                { 
                  step: '3', 
                  title: 'Start Interview', 
                  desc: 'Real-time AI transcription captures interview questions instantly for mock interview practice and skill improvement.',
                  iconName: 'Mic',
                  color: '#000'
                },
                { 
                  step: '4', 
                  title: 'Get Answers', 
                  desc: 'AI-powered interview answers tailored to your resume help you crack job interviews with confidence.',
                  iconName: 'Sparkles',
                  color: '#000'
                },
                { 
                  step: '5', 
                  title: 'Screen Analysis', 
                  desc: 'Analyze coding challenges, technical questions, and documents for interview preparation and problem-solving.',
                  iconName: 'Monitor',
                  color: '#000'
                },
                { 
                  step: '6', 
                  title: 'Set Reminders', 
                  desc: 'Smart reminders for interview follow-ups, job applications, and career deadlines to stay organized.',
                  iconName: 'Bell',
                  color: '#000'
                },
                { 
                  step: '7', 
                  title: 'Boost Productivity', 
                  desc: 'AI coding assistant and content generation for technical interviews, projects, and daily work tasks.',
                  iconName: 'Rocket',
                  color: '#000'
                },
                { 
                  step: '8', 
                  title: 'Track Progress', 
                  desc: 'Interview performance analytics and AI insights to improve communication skills and land your dream job.',
                  iconName: 'BarChart3',
                  color: '#000'
                },
              ].map((item, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  position: 'relative',
                  padding: '28px 20px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-8px)'; 
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; 
                    e.currentTarget.style.borderColor = item.color;
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; 
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#fff',
                    zIndex: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    background: '#f5f5f5',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '2px solid #e5e5e5',
                  }}>
                    <Icon name={item.iconName as any} size={32} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, color: '#000', lineHeight: 1.3 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
              display: 'inline-block',
              padding: '16px 40px',
              borderRadius: 100,
              background: '#000',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              transition: 'all 0.3s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              border: 'none',
              textDecoration: 'none',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              Get Started Now →
            </button>
          </div>
        </div>
      </section>

      {/* How Interview Mode Works - Roadmap */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#000',
              color: '#fff',
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
            }}>
              🎯 INTERVIEW MODE
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 900,
              letterSpacing: '-1px',
              marginBottom: 16,
              color: '#000',
            }}>
              How It Works
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 600, margin: '0 auto' }}>
              Get real-time AI assistance during your interviews in just 4 simple steps
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            position: 'relative',
          }}>
            {[
              {
                step: '01',
                icon: '📥',
                title: 'Download & Install',
                desc: 'Download HelplyAI for Mac or Windows. Quick 2-minute setup with no complex configuration.',
                color: '#3b82f6',
              },
              {
                step: '02',
                icon: '🎙️',
                title: 'Switch to Interview Mode',
                desc: 'Open the app and toggle Interview Mode. Grant microphone & screen permissions when prompted.',
                color: '#8b5cf6',
              },
              {
                step: '03',
                icon: '📋',
                title: 'Join Your Interview',
                desc: 'Start your Zoom, Meet, or Teams call. HelplyAI runs invisibly in the background - undetectable on screen share.',
                color: '#ec4899',
              },
              {
                step: '04',
                icon: '✨',
                title: 'Get Real-Time Answers',
                desc: 'Click "Analyze Screen" or use voice. AI listens to questions and provides instant, contextual answers.',
                color: '#10b981',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: 20,
                padding: 32,
                position: 'relative',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = item.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: 24,
                  background: item.color,
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 800,
                }}>
                  STEP {item.step}
                </div>
                <div style={{
                  fontSize: 48,
                  marginBottom: 16,
                  marginTop: 8,
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 12,
                  color: '#000',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: 50,
            padding: '30px',
            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}>
            <p style={{ color: '#fff', fontSize: 18, fontWeight: 600, margin: 0 }}>
              💡 Pro Tip: Interview Mode captures both your voice AND the interviewer's audio for perfect context!
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                ✓ Works on Zoom
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                ✓ Google Meet
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                ✓ Microsoft Teams
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                ✓ HackerRank
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                ✓ LeetCode
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots — after How It Works */}
      <section style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#888', letterSpacing: 2, textTransform: 'uppercase' }}>See it in action</span>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#000', marginTop: 10, marginBottom: 0 }}>Real-time AI assistance during your interview</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.1)', transition: 'all 0.35s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 28px 64px rgba(0,0,0,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)' }}
            >
              <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>HelplyAI — Interview Assistant</span>
              </div>
              <img src="https://beeptalk.s3.eu-north-1.amazonaws.com/520f487f-051a-47a0-b252-8b12dd857c7d.png" alt="HelplyAI interview assistant" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.1)', transition: 'all 0.35s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 28px 64px rgba(0,0,0,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)' }}
            >
              <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>HelplyAI — AI Suggestions</span>
              </div>
              <img src="https://beeptalk.s3.eu-north-1.amazonaws.com/d4ef4241-efb1-41c8-8420-8caf0d06a790.png" alt="HelplyAI AI suggestions" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison Section */}
      <section style={{
        padding: '80px 24px',
        background: '#000',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#fff',
              color: '#000',
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
            }}>
              💰 SAVE UP TO 95%
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 900,
              letterSpacing: '-1px',
              marginBottom: 16,
              color: '#fff',
            }}>
              Why Pay More? Compare & Save
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, maxWidth: 700, margin: '0 auto' }}>
              HelplyAI offers the same powerful features at a fraction of the cost. No expensive subscriptions required.
            </p>
          </div>

          {/* Comparison Table */}
          <div style={{
            background: '#111',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: 1,
              background: 'rgba(255,255,255,0.05)',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Feature</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                <span style={{ background: '#fff', color: '#000', padding: '4px 12px', borderRadius: 100, fontSize: 12 }}>HelplyAI</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>ParakeetAI</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Final Round AI</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>LockedIn AI</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Interview Sidekick</div>
            </div>

            {/* Pricing Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: 1,
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>💰 Pricing</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 800 }}>₹399</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#ef4444', fontSize: 16, fontWeight: 700 }}>₹6,730</span>
                <span style={{ color: '#22c55e', fontSize: 11, display: 'block', fontWeight: 600 }}>Save 94%</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#ef4444', fontSize: 16, fontWeight: 700 }}>₹2,125-7,650</span>
                <span style={{ color: '#22c55e', fontSize: 11, display: 'block', fontWeight: 600 }}>Save 95%</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#ef4444', fontSize: 16, fontWeight: 700 }}>₹4,880</span>
                <span style={{ color: '#22c55e', fontSize: 11, display: 'block', fontWeight: 600 }}>Save 92%</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#ef4444', fontSize: 16, fontWeight: 700 }}>₹1,700</span>
                <span style={{ color: '#22c55e', fontSize: 11, display: 'block', fontWeight: 600 }}>Save 76%</span>
              </div>
            </div>

            {/* Feature Rows */}
            {[
              { feature: '🎯 Real-time Interview Assistance', helply: true, parakeet: true, finalround: true, lockedin: true, sidekick: true },
              { feature: '🖥️ Screen Analysis', helply: true, parakeet: true, finalround: true, lockedin: true, sidekick: false },
              { feature: '👻 Invisible on Screen Share', helply: true, parakeet: true, finalround: true, lockedin: true, sidekick: true },
              { feature: '🎙️ Voice Recognition', helply: true, parakeet: true, finalround: true, lockedin: true, sidekick: true },
              { feature: '📋 JD & Resume Analysis', helply: true, parakeet: false, finalround: true, lockedin: true, sidekick: false },
              { feature: '💳 Pay-Per-Use (No Subscription)', helply: true, parakeet: false, finalround: false, lockedin: false, sidekick: false },
              { feature: '⏰ Credits Never Expire', helply: true, parakeet: false, finalround: false, lockedin: false, sidekick: false },
              { feature: '🆓 Free Trial Included', helply: true, parakeet: false, finalround: true, lockedin: false, sidekick: true },
              { feature: '💻 Mac & Windows Support', helply: true, parakeet: true, finalround: true, lockedin: true, sidekick: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                gap: 1,
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{row.feature}</div>
                <div style={{ textAlign: 'center', fontSize: 18 }}>{row.helply ? '✅' : '❌'}</div>
                <div style={{ textAlign: 'center', fontSize: 18 }}>{row.parakeet ? '✅' : '❌'}</div>
                <div style={{ textAlign: 'center', fontSize: 18 }}>{row.finalround ? '✅' : '❌'}</div>
                <div style={{ textAlign: 'center', fontSize: 18 }}>{row.lockedin ? '✅' : '❌'}</div>
                <div style={{ textAlign: 'center', fontSize: 18 }}>{row.sidekick ? '✅' : '❌'}</div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            textAlign: 'center',
            marginTop: 40,
            padding: '30px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', marginBottom: 24 }}>
              <div>
                <div style={{ color: '#22c55e', fontSize: 36, fontWeight: 900 }}>95%</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Cheaper than competitors</div>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 36, fontWeight: 900 }}>₹399</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Starting price per hour</div>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 36, fontWeight: 900 }}>0</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Monthly commitment</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 20 }}>
              Why pay ₹5,000-7,000/month when you can pay only for what you use?
            </p>
            <button 
              onClick={() => window.location.href = '/settings/billing'}
              style={{
                padding: '14px 32px',
                borderRadius: 100,
                background: '#fff',
                color: '#000',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Start Free Trial →
            </button>
          </div>
        </div>
      </section>

      {/* Land Your Job Section */}
      <section style={{
        padding: '50px 24px',
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

      {/* Universal Job Search Section */}
      <section style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-block', padding: '6px 18px', borderRadius: 100,
              background: '#000', color: '#fff', fontSize: 11, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
            }}>Universal Job Search</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, color: '#000', margin: '0 auto 16px', maxWidth: 700, lineHeight: 1.15 }}>
              Find jobs from every platform — in one place
            </h2>
            <p style={{ fontSize: 16, color: '#555', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              No more switching between LinkedIn, Naukri, Indeed, and Glassdoor. HelplyAI searches all major job platforms simultaneously and shows the best matches right here — just click <strong>Apply</strong> and you're redirected directly to the job.
            </p>
          </div>

          {/* Feature highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 56 }}>
            {[
              { icon: '🔍', title: 'Search Once', desc: 'One search across LinkedIn, Indeed, Naukri, Glassdoor & more' },
              { icon: '⚡', title: 'Instant Results', desc: 'Real-time job listings updated as you search, no delays' },
              { icon: '🎯', title: 'Smart Matching', desc: 'AI scores jobs by relevance to your role, skills & experience' },
              { icon: '🔗', title: 'Direct Apply', desc: 'Click Apply and go straight to the job on the original platform' },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '24px 20px', borderRadius: 14,
                border: '1px solid rgba(0,0,0,0.08)', background: '#fafafa',
                transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.color = ''; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Screenshots */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
              transition: 'all 0.35s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 28px 64px rgba(0,0,0,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)' }}
            >
              <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>HelplyAI — Interview Assistant</span>
              </div>
              <img
                src="https://beeptalk.s3.eu-north-1.amazonaws.com/520f487f-051a-47a0-b252-8b12dd857c7d.png"
                alt="HelplyAI interview assistant"
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
              transition: 'all 0.35s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 28px 64px rgba(0,0,0,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)' }}
            >
              <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>HelplyAI — AI Suggestions</span>
              </div>
              <img
                src="https://beeptalk.s3.eu-north-1.amazonaws.com/d4ef4241-efb1-41c8-8420-8caf0d06a790.png"
                alt="HelplyAI AI suggestions"
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Demo Videos Section */}
      <section style={{
        padding: '40px 24px',
        background: '#fafafa',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { name: 'Zoom', logo: 'https://cdn.worldvectorlogo.com/logos/zoom-communications-logo.svg', status: 'Undetectable, checked 15h ago' },
              { name: 'Microsoft Teams', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg', status: 'Undetectable, checked 15h ago' },
              { name: 'Google Meet', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg', status: 'Undetectable, checked 13h ago' },
            ].map((platform, i) => (
              <div key={i} style={{
                padding: 24,
                borderRadius: 16,
                background: '#fff',
                border: '2px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src={platform.logo} alt={platform.name} style={{ width: 48, height: 48, objectFit: 'contain' }} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48x48/000000/FFFFFF?text=' + platform.name.charAt(0) }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#000', marginBottom: 6 }}>{platform.name}</div>
                    <div style={{ fontSize: 12, color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span>
                      {platform.status}
                    </div>
                  </div>
                </div>
                <Icon name="ArrowRight" size={24} />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Pricing Highlight Section */}
      <section style={{
        padding: '60px 24px',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: '#000',
            borderRadius: 24,
            padding: '50px 40px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 900,
                color: '#fff',
                marginBottom: 20,
                letterSpacing: '-1px',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}>
                🎯 Crack Your Interview for Just ₹399!
              </h2>
              <p style={{
                fontSize: 'clamp(18px, 3vw, 24px)',
                color: '#fff',
                marginBottom: 30,
                fontWeight: 600,
                opacity: 0.95,
              }}>
                Unlimited usage for the entire day • Pay only when you need it
              </p>
              
              <div style={{ display: 'flex', gap: 30, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 20,
                  padding: '30px 40px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  minWidth: 280,
                }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 8 }}>₹399</div>
                  <div style={{ fontSize: 18, color: '#fff', fontWeight: 600, marginBottom: 4 }}>Day Pass</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>24 hours unlimited access</div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 20,
                  padding: '30px 40px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  minWidth: 280,
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    background: '#000',
                    color: '#84cc16',
                    padding: '4px 12px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 800,
                  }}>BEST VALUE</div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 8 }}>₹799</div>
                  <div style={{ fontSize: 18, color: '#fff', fontWeight: 600, marginBottom: 4 }}>Week Pass</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>7 days unlimited access</div>
                </div>
              </div>

              <p style={{
                fontSize: 16,
                color: '#fff',
                marginTop: 30,
                fontWeight: 500,
                opacity: 0.9,
              }}>
                💼 Join 100K+ candidates who landed their dream jobs • 🚀 Start cracking interviews today!
              </p>
            </div>
            
            <div style={{
              position: 'absolute',
              right: -80,
              bottom: -80,
              fontSize: 300,
              opacity: 0.1,
            }}>💰</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 16,
              color: '#000',
            }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 600, margin: '0 auto 24px' }}>
              Pay only for what you use. No subscriptions, no hidden fees. Credits never expire.
            </p>

            {/* Mode Toggle */}
            <div style={{
              display: 'inline-flex',
              background: '#f5f5f5',
              borderRadius: 100,
              padding: 4,
              gap: 4,
            }}>
              <button style={{
                padding: '10px 24px',
                borderRadius: 100,
                border: 'none',
                background: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}>Interview Mode</button>
              <a href="/settings/billing" style={{
                padding: '10px 24px',
                borderRadius: 100,
                border: 'none',
                background: 'transparent',
                color: '#666',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none',
              }}>General Mode →</a>
            </div>
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}>
            {/* Free Trial */}
            <div style={{
              background: '#f9f9f9',
              borderRadius: 20,
              padding: 32,
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#666',
                }}>Free Trial</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#000' }}>Free</span>
              </div>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>15 minutes free to try all features.</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {['15 minutes free usage', 'Full AI chat access', 'Interview mode included', 'Screen analysis included', 'Generate answers included', 'No credit card required'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#444' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <a href="/settings/dashboard" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: '#fff',
                color: '#000',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                border: '1px solid rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
              }}>Get Started Free</a>
            </div>

            {/* 1 Credit */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: 32,
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#666',
                }}>1 Credit</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#000' }}>₹399</span>
                <span style={{ fontSize: 14, color: '#666', marginLeft: 4 }}>/ hour</span>
              </div>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>1 hour of full access.</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {['1 hour of usage', 'Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited generate answers', 'All features unlocked'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#444' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <a href="/settings/billing" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>Buy Credits</a>
            </div>

            {/* 3 Credits - Best Value */}
            <div style={{
              background: '#000',
              borderRadius: 20,
              padding: 32,
              border: '2px solid #000',
              position: 'relative',
              transform: 'scale(1.02)',
            }}>
              <div style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                padding: '6px 16px',
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                color: '#000',
              }}>BEST VALUE</div>

              <div style={{ marginBottom: 16, marginTop: 8 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                }}>3 Credits</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#fff' }}>₹599</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginLeft: 4 }}>/ 3 hours</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(34,197,94,0.2)',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#4ade80',
                }}>₹200/hr — Save 33%</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>3 hours — best for interview prep.</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {['3 hours of usage', 'Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited generate answers', 'All features unlocked', 'Best for interview prep'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#fff' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <a href="/settings/billing" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: '#fff',
                color: '#000',
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>Buy Credits</a>
            </div>

            {/* 10 Credits */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: 32,
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#666',
                }}>10 Credits</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#000' }}>₹1,999</span>
                <span style={{ fontSize: 14, color: '#666', marginLeft: 4 }}>/ 10 hours</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(34,197,94,0.15)',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#16a34a',
                }}>₹200/hr — Save 33%</span>
              </div>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>10 hours — maximum value.</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {['10 hours of usage', 'Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited generate answers', 'All features unlocked', 'Maximum value pack', 'Priority support'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#444' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <a href="/settings/billing" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>Buy Credits</a>
            </div>
          </div>

          {/* Bottom note */}
          <div style={{
            marginTop: 32,
            padding: 20,
            borderRadius: 12,
            background: '#f9f9f9',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
              💡 <strong>How it works:</strong> Purchase credits and use them anytime. 1 credit = 1 hour of AI assistance. 
              <a href="/settings/billing" style={{ color: '#000', fontWeight: 600 }}>View full pricing →</a>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '40px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* Speech Recognition */}
          <div style={{
            flex: '1 1 300px',
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
            flex: '1 1 300px',
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
            flex: '1 1 300px',
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

          {/* Row 2: Additional Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 24 }}>
            {/* Reminders */}
            <div style={{
              borderRadius: 18, background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
              transition: 'all 0.4s', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div style={{ padding: 36 }}>
                <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 100, background: '#000',
                  fontSize: 10, fontWeight: 800, color: '#fff', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>REMINDERS</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                  Smart Interview Reminders
                </h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                  Set up smart reminders for interview follow-ups, job applications, and career deadlines. Never miss an important interview or deadline again.
                </p>
              </div>
            </div>

            {/* Screen Analyzer */}
            <div style={{
              borderRadius: 18, background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
              transition: 'all 0.4s', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div style={{ padding: 36 }}>
                <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 100, background: '#000',
                  fontSize: 10, fontWeight: 800, color: '#fff', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>SCREEN ANALYZER</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                  Analyze Any Screen Content
                </h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                  Capture and analyze coding challenges, technical questions, and interview documents instantly. AI-powered screen analysis for problem-solving.
                </p>
              </div>
            </div>

            {/* 100% Accuracy */}
            <div style={{
              borderRadius: 18, background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
              transition: 'all 0.4s', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div style={{ padding: 36 }}>
                <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 100, background: '#22c55e',
                  fontSize: 10, fontWeight: 800, color: '#fff', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>100% ACCURACY</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                  Highly Accurate AI Responses
                </h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                  Powered by GPT-4.1, Claude 4.0, and advanced AI models to provide the most accurate interview answers tailored to your resume and experience.
                </p>
              </div>
            </div>

            {/* Instant Answers */}
            <div style={{
              borderRadius: 18, background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
              transition: 'all 0.4s', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div style={{ padding: 36 }}>
                <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 100, background: '#000',
                  fontSize: 10, fontWeight: 800, color: '#fff', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>INSTANT ANSWERS</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: '#000', lineHeight: 1.3 }}>
                  Real-Time Interview Answers
                </h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>
                  Get instant AI-generated answers during live interviews. Automatic question detection and personalized responses based on your background.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: '60px 24px',
        background: '#fafafa',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
              color: '#000',
            }}>
              People love HelplyAI 💬
            </h2>
          </div>

          <style>{`
            @keyframes scroll-testimonials {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes scroll-testimonials-reverse {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .testimonials-scroll-row1 {
              animation: scroll-testimonials 60s linear infinite;
            }
            .testimonials-scroll-row1:hover {
              animation-play-state: paused;
            }
            .testimonials-scroll-row2 {
              animation: scroll-testimonials-reverse 60s linear infinite;
            }
            .testimonials-scroll-row2:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Row 1 - Scroll Left to Right */}
            <div style={{ overflow: 'hidden', width: '100%' }}>
              <div className="testimonials-scroll-row1" style={{ display: 'flex', gap: 20, width: 'max-content' }}>
              {[
                { name: 'Rajesh Kumar', role: 'Software Engineer @ TCS • 12 LPA', text: 'HelplyAI helped me crack my dream job at TCS! The AI answers were spot-on during technical rounds.', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=2563eb&color=fff&size=150' },
                { name: 'Priya Sharma', role: 'Data Analyst @ Infosys • 8 LPA', text: 'Amazing tool for freshers! Got my first job with 100% confidence thanks to HelplyAI.', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=7c3aed&color=fff&size=150' },
                { name: 'Amit Patel', role: 'Full Stack Developer @ Wipro • 15 LPA', text: 'The screen analysis feature saved me during coding interviews. Highly recommended!', avatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=059669&color=fff&size=150' },
                { name: 'Sneha Reddy', role: 'Product Manager @ Flipkart • 24 LPA', text: 'Best investment for interview preparation. Landed my dream role at Flipkart!', avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=dc2626&color=fff&size=150' },
                { name: 'Vikram Singh', role: 'DevOps Engineer @ Amazon • 32 LPA', text: 'HelplyAI made my Amazon interview so much easier. The real-time suggestions were perfect.', avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=ea580c&color=fff&size=150' },
                { name: 'Ananya Iyer', role: 'Frontend Developer @ Google • 40 LPA', text: 'Cracked Google interview on my first attempt! HelplyAI is a game-changer.', avatar: 'https://ui-avatars.com/api/?name=Ananya+Iyer&background=0891b2&color=fff&size=150' },
                { name: 'Karthik Menon', role: 'Backend Developer @ Microsoft • 35 LPA', text: 'The AI-powered answers helped me ace Microsoft technical rounds. Worth every penny!', avatar: 'https://ui-avatars.com/api/?name=Karthik+Menon&background=9333ea&color=fff&size=150' },
                { name: 'Divya Nair', role: 'ML Engineer @ Swiggy • 22 LPA', text: 'Perfect for technical interviews. Got my ML role at Swiggy thanks to this tool.', avatar: 'https://ui-avatars.com/api/?name=Divya+Nair&background=0d9488&color=fff&size=150' },
                { name: 'Arjun Desai', role: 'Cloud Architect @ IBM • 28 LPA', text: 'HelplyAI gave me the confidence I needed. Now working at IBM as Cloud Architect!', avatar: 'https://ui-avatars.com/api/?name=Arjun+Desai&background=3b82f6&color=fff&size=150' },
                { name: 'Pooja Gupta', role: 'QA Engineer @ Zomato • 10 LPA', text: 'Excellent for freshers preparing for interviews. Highly accurate AI responses!', avatar: 'https://ui-avatars.com/api/?name=Pooja+Gupta&background=ec4899&color=fff&size=150' },
                { name: 'Rohit Verma', role: 'Java Developer @ Accenture • 11 LPA', text: 'The interview mode is brilliant. Helped me prepare for Accenture technical rounds.', avatar: 'https://ui-avatars.com/api/?name=Rohit+Verma&background=f59e0b&color=fff&size=150' },
                { name: 'Kavya Rao', role: 'UI/UX Designer @ Paytm • 14 LPA', text: 'Not just for developers! Helped me with design interviews at Paytm too.', avatar: 'https://ui-avatars.com/api/?name=Kavya+Rao&background=8b5cf6&color=fff&size=150' },
                { name: 'Sanjay Joshi', role: 'Data Scientist @ Ola • 18 LPA', text: 'The AI understands context so well. Aced my data science interviews at Ola!', avatar: 'https://ui-avatars.com/api/?name=Sanjay+Joshi&background=06b6d4&color=fff&size=150' },
                { name: 'Meera Krishnan', role: 'Python Developer @ HCL • 9 LPA', text: 'Best tool for coding interviews. Got placed at HCL with great package!', avatar: 'https://ui-avatars.com/api/?name=Meera+Krishnan&background=10b981&color=fff&size=150' },
              ].concat([
                { name: 'Rajesh Kumar', role: 'Software Engineer @ TCS • 12 LPA', text: 'HelplyAI helped me crack my dream job at TCS! The AI answers were spot-on during technical rounds.', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=2563eb&color=fff&size=150' },
                { name: 'Priya Sharma', role: 'Data Analyst @ Infosys • 8 LPA', text: 'Amazing tool for freshers! Got my first job with 100% confidence thanks to HelplyAI.', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=7c3aed&color=fff&size=150' },
                { name: 'Amit Patel', role: 'Full Stack Developer @ Wipro • 15 LPA', text: 'The screen analysis feature saved me during coding interviews. Highly recommended!', avatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=059669&color=fff&size=150' },
                { name: 'Sneha Reddy', role: 'Product Manager @ Flipkart • 24 LPA', text: 'Best investment for interview preparation. Landed my dream role at Flipkart!', avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=dc2626&color=fff&size=150' },
                { name: 'Vikram Singh', role: 'DevOps Engineer @ Amazon • 32 LPA', text: 'HelplyAI made my Amazon interview so much easier. The real-time suggestions were perfect.', avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=ea580c&color=fff&size=150' },
                { name: 'Ananya Iyer', role: 'Frontend Developer @ Google • 40 LPA', text: 'Cracked Google interview on my first attempt! HelplyAI is a game-changer.', avatar: 'https://ui-avatars.com/api/?name=Ananya+Iyer&background=0891b2&color=fff&size=150' },
                { name: 'Karthik Menon', role: 'Backend Developer @ Microsoft • 35 LPA', text: 'The AI-powered answers helped me ace Microsoft technical rounds. Worth every penny!', avatar: 'https://ui-avatars.com/api/?name=Karthik+Menon&background=9333ea&color=fff&size=150' },
                { name: 'Divya Nair', role: 'ML Engineer @ Swiggy • 22 LPA', text: 'Perfect for technical interviews. Got my ML role at Swiggy thanks to this tool.', avatar: 'https://ui-avatars.com/api/?name=Divya+Nair&background=0d9488&color=fff&size=150' },
                { name: 'Arjun Desai', role: 'Cloud Architect @ IBM • 28 LPA', text: 'HelplyAI gave me the confidence I needed. Now working at IBM as Cloud Architect!', avatar: 'https://ui-avatars.com/api/?name=Arjun+Desai&background=3b82f6&color=fff&size=150' },
                { name: 'Pooja Gupta', role: 'QA Engineer @ Zomato • 10 LPA', text: 'Excellent for freshers preparing for interviews. Highly accurate AI responses!', avatar: 'https://ui-avatars.com/api/?name=Pooja+Gupta&background=ec4899&color=fff&size=150' },
              ]).map((testimonial, i) => (
                <div key={i} style={{
                  padding: 24,
                  borderRadius: 16,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  minWidth: 320,
                  maxWidth: 320,
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(j => (
                      <Icon key={j} name="Star" size={14} />
                    ))}
                  </div>
                  <p style={{ color: '#333', fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>
                    "{testimonial.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={testimonial.avatar} alt={testimonial.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ color: '#000', fontSize: 13, fontWeight: 700 }}>{testimonial.name}</div>
                      <div style={{ color: '#666', fontSize: 12 }}>{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Row 2 - Scroll Right to Left (Reverse) */}
            <div style={{ overflow: 'hidden', width: '100%' }}>
              <div className="testimonials-scroll-row2" style={{ display: 'flex', gap: 20, width: 'max-content' }}>
              {[
                { name: 'Aditya Bhatt', role: 'iOS Developer @ Apple • 38 LPA', text: 'HelplyAI helped me prepare for Apple interviews. The quality is unmatched!', avatar: 'https://ui-avatars.com/api/?name=Aditya+Bhatt&background=6366f1&color=fff&size=150' },
                { name: 'Ritu Malhotra', role: 'Scrum Master @ Cognizant • 16 LPA', text: 'Perfect for both technical and HR rounds. Landed my Scrum Master role!', avatar: 'https://ui-avatars.com/api/?name=Ritu+Malhotra&background=f43f5e&color=fff&size=150' },
                { name: 'Nikhil Agarwal', role: 'Android Developer @ Samsung • 20 LPA', text: 'The real-time transcription is incredibly fast. Helped me at Samsung interview!', avatar: 'https://ui-avatars.com/api/?name=Nikhil+Agarwal&background=14b8a6&color=fff&size=150' },
                { name: 'Shruti Kapoor', role: 'Business Analyst @ Deloitte • 13 LPA', text: 'Great for non-technical roles too! Got my BA position at Deloitte.', avatar: 'https://ui-avatars.com/api/?name=Shruti+Kapoor&background=a855f7&color=fff&size=150' },
                { name: 'Manish Tiwari', role: 'React Developer @ Netflix • 30 LPA', text: 'HelplyAI is a must-have for interview prep. Now at Netflix thanks to this!', avatar: 'https://ui-avatars.com/api/?name=Manish+Tiwari&background=ef4444&color=fff&size=150' },
                { name: 'Lakshmi Pillai', role: 'Salesforce Developer @ Tech Mahindra • 11 LPA', text: 'Affordable and effective! Cracked Tech Mahindra interview easily.', avatar: 'https://ui-avatars.com/api/?name=Lakshmi+Pillai&background=f97316&color=fff&size=150' },
                { name: 'Varun Chopra', role: 'Security Engineer @ Meta • 36 LPA', text: 'The screen analysis helped me solve coding problems during Meta interview.', avatar: 'https://ui-avatars.com/api/?name=Varun+Chopra&background=84cc16&color=fff&size=150' },
                { name: 'Sarah Chen', role: 'Software Engineer @ Google', text: 'HelplyAI helped me ace my coding interviews! The real-time suggestions were incredibly accurate.', avatar: 'https://i.pravatar.cc/150?img=5' },
                { name: 'Deepak Yadav', role: 'Node.js Developer @ Uber • 26 LPA', text: 'Best investment for my career. Got Uber offer with HelplyAI preparation!', avatar: 'https://ui-avatars.com/api/?name=Deepak+Yadav&background=22c55e&color=fff&size=150' },
                { name: 'Nisha Bansal', role: 'HR Manager @ LinkedIn • 19 LPA', text: 'Even for HR roles, this tool is fantastic. Helped me prepare for LinkedIn!', avatar: 'https://ui-avatars.com/api/?name=Nisha+Bansal&background=d946ef&color=fff&size=150' },
                { name: 'Gaurav Saxena', role: 'Blockchain Developer @ Polygon • 25 LPA', text: 'Perfect for Web3 interviews too! Now working at Polygon.', avatar: 'https://ui-avatars.com/api/?name=Gaurav+Saxena&background=0ea5e9&color=fff&size=150' },
                { name: 'Anjali Mehta', role: 'Marketing Manager @ Amazon • 21 LPA', text: 'HelplyAI works for all roles. Helped me with Amazon marketing interview!', avatar: 'https://ui-avatars.com/api/?name=Anjali+Mehta&background=f472b6&color=fff&size=150' },
                { name: 'Suresh Babu', role: 'SAP Consultant @ Capgemini • 17 LPA', text: 'Great for SAP interviews. The AI understood technical SAP questions perfectly.', avatar: 'https://ui-avatars.com/api/?name=Suresh+Babu&background=fb923c&color=fff&size=150' },
                { name: 'Michael Rodriguez', role: 'Product Manager @ Meta', text: 'The screen analysis feature is a game-changer. Saved me during technical rounds.', avatar: 'https://i.pravatar.cc/150?img=12' },
                { name: 'Harish Kumar', role: 'AI/ML Engineer @ NVIDIA • 34 LPA', text: 'As an ML engineer, I appreciate the AI quality. Helped me join NVIDIA!', avatar: 'https://ui-avatars.com/api/?name=Harish+Kumar&background=4ade80&color=fff&size=150' },
              ].concat([
                { name: 'Aditya Bhatt', role: 'iOS Developer @ Apple • 38 LPA', text: 'HelplyAI helped me prepare for Apple interviews. The quality is unmatched!', avatar: 'https://ui-avatars.com/api/?name=Aditya+Bhatt&background=6366f1&color=fff&size=150' },
                { name: 'Ritu Malhotra', role: 'Scrum Master @ Cognizant • 16 LPA', text: 'Perfect for both technical and HR rounds. Landed my Scrum Master role!', avatar: 'https://ui-avatars.com/api/?name=Ritu+Malhotra&background=f43f5e&color=fff&size=150' },
                { name: 'Nikhil Agarwal', role: 'Android Developer @ Samsung • 20 LPA', text: 'The real-time transcription is incredibly fast. Helped me at Samsung interview!', avatar: 'https://ui-avatars.com/api/?name=Nikhil+Agarwal&background=14b8a6&color=fff&size=150' },
                { name: 'Shruti Kapoor', role: 'Business Analyst @ Deloitte • 13 LPA', text: 'Great for non-technical roles too! Got my BA position at Deloitte.', avatar: 'https://ui-avatars.com/api/?name=Shruti+Kapoor&background=a855f7&color=fff&size=150' },
                { name: 'Manish Tiwari', role: 'React Developer @ Netflix • 30 LPA', text: 'HelplyAI is a must-have for interview prep. Now at Netflix thanks to this!', avatar: 'https://ui-avatars.com/api/?name=Manish+Tiwari&background=ef4444&color=fff&size=150' },
                { name: 'Lakshmi Pillai', role: 'Salesforce Developer @ Tech Mahindra • 11 LPA', text: 'Affordable and effective! Cracked Tech Mahindra interview easily.', avatar: 'https://ui-avatars.com/api/?name=Lakshmi+Pillai&background=f97316&color=fff&size=150' },
                { name: 'Varun Chopra', role: 'Security Engineer @ Meta • 36 LPA', text: 'The screen analysis helped me solve coding problems during Meta interview.', avatar: 'https://ui-avatars.com/api/?name=Varun+Chopra&background=84cc16&color=fff&size=150' },
                { name: 'Sarah Chen', role: 'Software Engineer @ Google', text: 'HelplyAI helped me ace my coding interviews! The real-time suggestions were incredibly accurate.', avatar: 'https://i.pravatar.cc/150?img=5' },
                { name: 'Deepak Yadav', role: 'Node.js Developer @ Uber • 26 LPA', text: 'Best investment for my career. Got Uber offer with HelplyAI preparation!', avatar: 'https://ui-avatars.com/api/?name=Deepak+Yadav&background=22c55e&color=fff&size=150' },
                { name: 'Nisha Bansal', role: 'HR Manager @ LinkedIn • 19 LPA', text: 'Even for HR roles, this tool is fantastic. Helped me prepare for LinkedIn!', avatar: 'https://ui-avatars.com/api/?name=Nisha+Bansal&background=d946ef&color=fff&size=150' },
              ]).map((testimonial, i) => (
                <div key={i} style={{
                  padding: 24,
                  borderRadius: 16,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  minWidth: 320,
                  maxWidth: 320,
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(j => (
                      <Icon key={j} name="Star" size={14} />
                    ))}
                  </div>
                  <p style={{ color: '#333', fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>
                    "{testimonial.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={testimonial.avatar} alt={testimonial.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ color: '#000', fontSize: 13, fontWeight: 700 }}>{testimonial.name}</div>
                      <div style={{ color: '#666', fontSize: 12 }}>{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
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

      {/* FAQ Section */}
      <section style={{
        padding: '80px 24px',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#000',
              color: '#fff',
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
            }}>
              ❓ FAQ
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 900,
              letterSpacing: '-1px',
              marginBottom: 16,
              color: '#000',
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 600, margin: '0 auto' }}>
              Everything you need to know about HelplyAI
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { q: 'What is HelplyAI?', a: 'HelplyAI is an AI-powered interview assistant that provides real-time support during coding and behavioral interviews. It listens to interview questions and provides instant, contextual answers to help you succeed.' },
              { q: 'Is HelplyAI detectable during screen sharing?', a: 'No! HelplyAI is 100% invisible on screen share. The app uses advanced overlay technology that is completely undetectable on Zoom, Google Meet, Microsoft Teams, and other video platforms.' },
              { q: 'How does the pricing work?', a: 'HelplyAI uses a pay-per-use credit system. You only pay for what you use - no monthly subscriptions required. Credits never expire, so you can use them whenever you need. Starting at just ₹399 per hour.' },
              { q: 'What platforms does HelplyAI support?', a: 'HelplyAI works on both Mac (Apple Silicon & Intel) and Windows. It supports all major interview platforms including Zoom, Google Meet, Microsoft Teams, HackerRank, LeetCode, and more.' },
              { q: 'How do I get started?', a: 'Simply download the app, create an account, purchase credits, and you\'re ready to go! The setup takes less than 2 minutes. We also offer a free trial so you can test the features before purchasing.' },
              { q: 'What is Interview Mode vs General Mode?', a: 'Interview Mode is specifically designed for job interviews - it captures both your voice and the interviewer\'s audio for perfect context. General Mode is for everyday tasks like writing emails, analyzing documents, and coding help.' },
              { q: 'Can I use HelplyAI for coding interviews?', a: 'Absolutely! HelplyAI excels at coding interviews. It can analyze screen content, understand coding problems, and provide solutions in real-time. It works with HackerRank, LeetCode, CoderPad, and other coding platforms.' },
              { q: 'How does the voice recognition work?', a: 'HelplyAI uses advanced speech-to-text technology to capture and transcribe interview questions in real-time. It captures both your microphone and system audio (interviewer\'s voice) for complete context.' },
              { q: 'Is my data secure?', a: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We do not store your interview conversations permanently. Your privacy is our top priority.' },
              { q: 'What if I have technical issues?', a: 'Our support team is available to help you. You can reach us through the Help Center in the app or contact us via email. We typically respond within 24 hours.' },
              { q: 'Can I get a refund?', a: 'Yes, we offer refunds for unused credits. Please refer to our Refund Policy for detailed terms and conditions. Customer satisfaction is important to us.' },
              { q: 'How do I paste my JD and Resume?', a: 'In Interview Mode, simply copy your Job Description and Resume, then paste them into the chatbot. The AI will analyze them and tailor its answers to match your profile and the job requirements.' },
              { q: 'Does HelplyAI work with behavioral interviews?', a: 'Yes! HelplyAI is excellent for behavioral interviews. It can help you structure STAR responses, provide relevant examples, and answer common behavioral questions effectively.' },
              { q: 'How many credits do I need for an interview?', a: 'A typical 1-hour interview uses about 1 hour of credits (₹399). We recommend purchasing 3 credits (₹599 for 3 hours) if you have multiple interviews lined up.' },
              { q: 'Can I use HelplyAI on multiple devices?', a: 'Yes, you can use your account on multiple devices. However, you can only have one active session at a time. Your credits are linked to your account, not the device.' },
            ].map((faq, i) => (
              <div key={i} style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                overflow: 'hidden',
                background: openFaq === i ? '#f9fafb' : '#fff',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>{faq.q}</span>
                  <span style={{
                    fontSize: 24,
                    color: '#666',
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 24px 20px',
                    color: '#666',
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Video Section */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, #f0f0f0 0%, #e8e8e8 100%)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 900,
            letterSpacing: '-1px',
            marginBottom: 16,
            color: '#000',
          }}>
            See HelplyAI in Action
          </h2>
          <p style={{ color: '#666', fontSize: 16, marginBottom: 40 }}>
            Watch how HelplyAI helps you ace your interviews
          </p>
          <div style={{
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.1)',
          }}>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            >
              <source src="/promo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px 40px',
        background: '#000',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
          <div style={{ maxWidth: 350 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img 
                src="/helply-logo.png" 
                alt="HelplyAI Logo" 
                style={{ width: 40, height: 40, borderRadius: 10 }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#fff',
                display: 'none', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 20, color: '#000',
              }}>⚡</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>HelplyAI</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Your AI-powered interview assistant. Real-time support for coding and behavioral interviews. Trusted by 1.5M+ users worldwide.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="mailto:support@helplyai.co" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >
                📧 support@helplyai.co
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Product</div>
              <a href="#features" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Features</a>
              <a href="/settings/dashboard" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Dashboard</a>
              <a href="/settings/billing" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Pricing</a>
              <a href="#" onClick={() => handleDownloadClick('ios')} style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Download</a>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Company</div>
              <a href="#about" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >About Us</a>
              <a href="/privacy" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Privacy Policy</a>
              <a href="/refund" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Refund Policy</a>
              <a href="/terms" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Terms of Service</a>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Support</div>
              <a href="/settings/help" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Help Center</a>
              <a href="mailto:support@helplyai.co" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Contact Us</a>
              <a href="#faq" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >FAQ</a>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: 1100, margin: '40px auto 0', paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>© 2026 HelplyAI. All rights reserved.</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Powered by Levelon Technologies Private Limited</span>
        </div>
      </footer>

      {/* Download Modal */}
      {showDownloadModal && (
        <div onClick={() => setShowDownloadModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, padding: 40,
            maxWidth: 500, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            <button onClick={() => setShowDownloadModal(false)} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(0,0,0,0.05)', border: 'none',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, color: '#666',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#000' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#666' }}
            >×</button>

            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#000' }}>
              {selectedPlatform === 'ios' ? 'Download for macOS' : 'Download for Windows'}
            </h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              {selectedPlatform === 'ios' 
                ? 'Choose your Mac processor type' 
                : 'Choose the installer type that best suits your needs'}
            </p>

            {selectedPlatform === 'ios' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => handleDirectDownload(downloadLinks.macAppleSilicon)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#000', color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>Apple Silicon (M1/M2/M3/M4)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>For Macs with Apple M-series chips (2020 and newer)</span>
                </button>

                <button onClick={() => handleDirectDownload(downloadLinks.macIntel)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#fff', color: '#000', border: '2px solid #000',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>Intel Processor</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontWeight: 400 }}>For Macs with Intel processors (2019 and older)</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => handleDirectDownload(downloadLinks.windowsMSI)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#000', color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>MSI Installer (Individual)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>Download ZIP → extract → run .exe to install</span>
                </button>

                <button onClick={() => handleDirectDownload(downloadLinks.windowsNSIS)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#fff', color: '#000', border: '2px solid #000',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>NSIS Installer (Organization)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontWeight: 400 }}>Modern installer for enterprise deployment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
