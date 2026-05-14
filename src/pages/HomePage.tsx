import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { DOWNLOAD_LINKS } from '../config/releases'
import { trackVideoPlayed, trackVideoPaused, trackCTAClick, trackDownload } from '../lib/analytics'
import { detectRegionalPricing, getDefaultPricing } from '../lib/pricing'
import type { RegionalPricing } from '../lib/pricing'

const footerLinkStyle: React.CSSProperties = {
  display: 'block',
  color: 'rgba(255,255,255,0.7)',
  fontSize: 14,
  marginBottom: 12,
  textDecoration: 'none',
  transition: 'color 0.2s',
};

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

const VIDEO_CHIPS = [
  { id: 'ZxO1OHEdxw4', label: '🎯 Interview Mode', desc: 'See how Interview Mode gives you real-time AI answers during live interviews.' },
  { id: 'FgKdax1TnM0', label: '🤖 General Mode',   desc: 'Use HelplyAI for everyday tasks — writing, coding, screen analysis and more.' },
  { id: 'DvdSQMR_hsY', label: '🪟 Windows Setup',  desc: 'Install and launch HelplyAI on Windows in under 2 minutes.' },
  { id: 'dhEGDlpOUbg', label: '🔍 Job Search',      desc: 'Find jobs, save listings, track applications and match your resume.' },
  { id: 'qnJ7UpRNR40', label: '📊 Dashboard',       desc: 'A full tour of the dashboard — settings, downloads, and getting started.' },
];

function VideoShowcase() {
  const [activeId, setActiveId] = useState(VIDEO_CHIPS[0].id);
  const [playing, setPlaying] = useState(false);
  const active = VIDEO_CHIPS.find(v => v.id === activeId)!;

  const selectVideo = (id: string) => {
    if (id === activeId) {
      setPlaying(true);
    } else {
      setActiveId(id);
      setPlaying(false);
    }
  };

  return (
    <section id="how-it-works" style={{ padding: '48px 24px 64px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-0.5px', color: '#000', marginBottom: 10 }}>
            See HelplyAI in Action
          </h2>
          <p style={{ fontSize: 15, color: '#666', maxWidth: 480, margin: '0 auto' }}>
            Click any video below to watch it play.
          </p>
        </div>

        {/* All 5 thumbnails side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}>
          {VIDEO_CHIPS.map(v => {
            const isActive = v.id === activeId;
            return (
              <div
                key={v.id}
                onClick={() => selectVideo(v.id)}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  aspectRatio: '16/9',
                  border: isActive ? '2.5px solid #000' : '2px solid rgba(0,0,0,0.1)',
                  boxShadow: isActive ? '0 6px 24px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
                  transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'all 0.25s',
                  background: '#000',
                }}
              >
                <img
                  src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                  alt={v.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isActive ? 1 : 0.75, transition: 'opacity 0.25s' }}
                  onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`; }}
                />
                {/* Overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.35)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'background 0.25s',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: isActive ? '#ff0000' : 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid rgba(255,255,255,0.5)',
                    transition: 'all 0.25s',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
                {/* Label at bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                  padding: '14px 8px 7px',
                }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {v.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active video description */}
        <p style={{ textAlign: 'center', fontSize: 14, color: '#555', marginBottom: 20 }}>{active.desc}</p>

        {/* Large player for selected video */}
        <div style={{
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 16px 60px rgba(0,0,0,0.15)',
          position: 'relative',
          aspectRatio: '16/9',
          cursor: 'pointer',
          background: '#000',
        }} onClick={() => setPlaying(true)}>
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0&modestbranding=1`}
              title={active.label}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <>
              <img
                src={`https://img.youtube.com/vi/${activeId}/maxresdefault.jpg`}
                alt={active.label}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${activeId}/hqdefault.jpg`; }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: '#ff0000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 28px rgba(255,0,0,0.55)',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <span style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: 0.3 }}>Click to play</span>
              </div>
            </>
          )}
        </div>

        {/* YouTube link */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a
            href={`https://youtu.be/${activeId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, fontWeight: 600, color: '#ff0000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            Watch on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'windows' | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [regionalPricing, setRegionalPricing] = useState<RegionalPricing>(getDefaultPricing())

  useEffect(() => {
    detectRegionalPricing().then(setRegionalPricing)
  }, [])

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
    const platform = url.includes('Apple_Silicon') ? 'mac_apple_silicon' : url.includes('Intel') && url.includes('.dmg') ? 'mac_intel' : url.includes('MSI') ? 'windows_msi' : 'windows_nsis';
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
        padding: '0 20px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/favicon.png" alt="Helply AI" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: '#000', letterSpacing: '-0.02em' }}>Helply AI</span>
        </div>

        {/* Desktop links */}
        <div className="home-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="/" style={{ color: '#000', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Home</a>
          <a href="#features" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Features</a>
          <a href="#pricing" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Pricing</a>
          <a href="#how-it-works" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >How It Works</a>
          <a href="#about" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >About Us</a>
          <a href="/settings/dashboard" style={{
            padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600,
            background: '#000', color: '#fff', textDecoration: 'none',
          }}>{user ? 'Dashboard' : 'Sign In'}</a>
        </div>

        {/* Mobile: Dashboard button + hamburger */}
        <div className="home-nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          <a href="/settings/dashboard" style={{
            padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700,
            background: '#000', color: '#fff', textDecoration: 'none',
          }}>{user ? 'Dashboard' : 'Sign In'}</a>
          <button
            className="home-hamburger"
            onClick={() => {
              const menu = document.getElementById('home-mobile-menu');
              if (menu) menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
            }}
            style={{
              width: 38, height: 38, borderRadius: 8, background: '#f3f4f6',
              border: '1px solid #e5e7eb', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      <div id="home-mobile-menu" style={{
        display: 'none', position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
        background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        flexDirection: 'column', padding: '12px 20px 20px', gap: 4,
      }}>
        {[['/', 'Home'], ['#features', 'Features'], ['#pricing', 'Pricing'], ['#how-it-works', 'How It Works'], ['#about', 'About Us']].map(([href, label]) => (
          <a key={href} href={href}
            onClick={() => { const m = document.getElementById('home-mobile-menu'); if (m) m.style.display = 'none'; }}
            style={{
              display: 'block', padding: '12px 4px', fontSize: 16, fontWeight: 600, color: '#111',
              textDecoration: 'none', borderBottom: '1px solid #f3f4f6',
            }}
          >{label}</a>
        ))}
      </div>

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
            <span>Download for Mac</span>
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

      {/* Video Showcase — all 5 videos side by side, directly under hero */}
      <VideoShowcase />

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
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#2D8CFF"/><path d="M6.5 8.5v7h5v-7h-5zm6 1.5v4l4 2.5v-9l-4 2.5z" fill="#fff"/></svg>
                Works on Zoom
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#00897B"/><path d="M12 6.5c-1.93 0-3.5 1.57-3.5 3.5v4c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5v-4c0-1.93-1.57-3.5-3.5-3.5zm5 3.5h1.5v4c0 3.04-2.17 5.57-5 6.33V22h-3v-1.67c-2.83-.76-5-3.29-5-6.33V10H7v4c0 2.76 2.24 5 5 5s5-2.24 5-5v-4z" fill="#fff"/></svg>
                Google Meet
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#5B5FC7"/><path d="M14.5 5h-7A1.5 1.5 0 0 0 6 6.5v7A1.5 1.5 0 0 0 7.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 5zm3.5 3v6l2 1.5v-9L18 8zM7 17h8a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V8.5a1 1 0 0 1 1-1v8.5a1 1 0 0 0 1 1z" fill="#fff"/></svg>
                Microsoft Teams
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1BA94C"/><path d="M6 6h5v5H6V6zm7 0h5v5h-5V6zm-7 7h5v5H6v-5zm7 0h5v5h-5v-5z" fill="#fff" fillOpacity="0.9"/></svg>
                HackerRank
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#FFA116"/><path d="M8 17l4-4 4 4M8 7l4 4 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                LeetCode
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* Custom Resume Builder Section */}
      <section style={{ padding: '80px 24px', background: '#f9fafb', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#888', letterSpacing: 2, textTransform: 'uppercase' }}>AI Resume Builder</span>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#000', marginTop: 10, marginBottom: 0 }}>Custom Resume Builder based on Job Description</h2>
            <p style={{ color: '#000', fontSize: 15, maxWidth: 650, margin: '10px auto 0' }}>Paste any job description — AI tailors your resume with JD keywords, optimises for ATS, and generates print-ready PDFs in seconds</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {/* Step 1: Paste JD */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.08)', transition: 'all 0.35s', background: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 28px 64px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.08)'; }}
            >
              <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Step 1 — Paste Job Description</span>
              </div>
              <div style={{ padding: 20, minHeight: 240, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#000' }}>Resume Builder</div>
                <div style={{ fontSize: 12, color: '#000', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>Paste a job description — AI tailors your resume with JD keywords</div>
                <div style={{ width: '90%', padding: '10px 12px', background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11, color: '#000' }}>Paste the full job description here...</div>
                <div style={{ width: '90%', padding: '10px 0', background: '#000', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Generate Tailored Resume</div>
              </div>
            </div>

            {/* Step 2: Choose Template */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.08)', transition: 'all 0.35s', background: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 28px 64px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.08)'; }}
            >
              <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Step 2 — Choose Template</span>
              </div>
              <div style={{ padding: 16, minHeight: 240 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 4 }}>Your Tailored Resumes</div>
                <div style={{ fontSize: 11, color: '#000', marginBottom: 14 }}>3 ATS-optimised templates • Tailored for your role</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {['Executive', 'Modern', 'Clean'].map((t, i) => (
                    <div key={t} style={{ borderRadius: 8, border: i === 0 ? '2px solid #000' : '1px solid #e5e7eb', padding: 8, textAlign: 'center', background: '#fafafa', cursor: 'default' }}>
                      <div style={{ height: 64, background: i === 0 ? 'linear-gradient(135deg, #1e3a5f, #2c5a7f)' : i === 1 ? '#2563eb' : '#f3f4f6', borderRadius: 4, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i === 0 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{t}</div>
                      <div style={{ fontSize: 9, color: '#000', marginTop: 2 }}>{i === 0 ? 'gold accents' : i === 1 ? 'sidebar' : 'serif'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Executive selected</div>
                    <div style={{ fontSize: 9, color: '#000' }}>ATS-optimised • 1 page</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '5px 12px', background: '#000', color: '#fff', borderRadius: 6, fontWeight: 600 }}>Download PDF</span>
                </div>
              </div>
            </div>

            {/* Step 3: Final Resume */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.08)', transition: 'all 0.35s', background: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 28px 64px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.08)'; }}
            >
              <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Step 3 — Your Resume</span>
              </div>
              <div style={{ padding: 12, minHeight: 240 }}>
                <div style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #2c5a7f 100%)', borderRadius: 6, padding: '14px 16px', color: '#fff', marginBottom: 10 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#c9a96e', marginBottom: 4 }}>AI PRODUCT MANAGER</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                    {['Product Management', 'Healthcare', 'Agile', 'Cross-functional'].map(k => (
                      <span key={k} style={{ fontSize: 7, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 3, color: '#fff' }}>{k}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '0 4px' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: '#1e3a5f', marginBottom: 4, textTransform: 'uppercase' as const }}>Professional Summary</div>
                  <div style={{ fontSize: 8, color: '#444', lineHeight: 1.5, marginBottom: 8 }}>AI Product Manager with 3.7 years of experience in product management, focusing on healthcare and clinical research...</div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: '#1e3a5f', marginBottom: 4, textTransform: 'uppercase' as const }}>Experience</div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>Product Manager / Product Owner</div>
                  <div style={{ fontSize: 7, color: '#000', marginBottom: 4 }}>HUB Group • Sep 2024 – Present</div>
                  <div style={{ fontSize: 7, color: '#555', lineHeight: 1.4 }}>• Built LTL Logistics platform from 0→1 and delivered MVP in 3 months, generating $1M revenue</div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: '#1e3a5f', marginTop: 8, marginBottom: 4, textTransform: 'uppercase' as const }}>Core Competencies</div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                    {['Product Strategy', 'A/B Testing', 'Go-To-Market', 'KPI & Metrics'].map(k => (
                      <span key={k} style={{ fontSize: 7, padding: '2px 5px', border: '1px solid #d1d5db', borderRadius: 3, color: '#374151' }}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison Section */}
      <section style={{ padding: '60px 24px', background: '#000' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: 8 }}>
              Why Pay More? Compare & Save
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: 0 }}>
              Same powerful features — fraction of the cost.
            </p>
          </div>

          {/* Comparison Table */}
          <div style={{ background: '#111', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Feature</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ background: '#fff', color: '#000', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>HelplyAI</span>
              </div>
              {['ParakeetAI', 'Final Round', 'LockedIn AI', 'Sidekick'].map(n => (
                <div key={n} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{n}</div>
              ))}
            </div>

            {/* Pricing Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Pricing / hr
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>₹399</span>
              </div>
              {[{ p: '₹6,730', s: '–94%' }, { p: '₹5,000+', s: '–92%' }, { p: '₹4,880', s: '–92%' }, { p: '₹1,700', s: '–76%' }].map((c, ci) => (
                <div key={ci} style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, textDecoration: 'line-through' }}>{c.p}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{c.s}</div>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            {[
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, label: 'Real-time Assistance', vals: [true, true, true, true, true] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: 'Screen Analysis', vals: [true, true, true, true, false] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>, label: 'Invisible on Screen Share', vals: [true, true, true, true, true] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>, label: 'Voice Recognition', vals: [true, true, true, true, true] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'JD & Resume Analysis', vals: [true, false, true, true, false] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Pay-Per-Use (No Sub)', vals: [true, false, false, false, false] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, label: 'Credits Never Expire', vals: [true, false, false, false, false] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, label: 'Free Trial Included', vals: [true, false, true, false, true] },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: 'Mac & Windows', vals: [true, true, true, true, true] },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{row.icon}</span>
                  {row.label}
                </div>
                {row.vals.map((v, vi) => (
                  <div key={vi} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {v
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    }
                  </div>
                ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 56 }}>
            {[
              { num: '01', title: 'Search Once', desc: 'One search across LinkedIn, Indeed, Naukri, Glassdoor & more — no tab switching.' },
              { num: '02', title: 'Instant Results', desc: 'Real-time job listings updated as you search. No delays, no refresh needed.' },
              { num: '03', title: 'Smart Matching', desc: 'AI scores jobs by relevance to your role, skills & experience level.' },
              { num: '04', title: 'Direct Apply', desc: 'Click Apply and go straight to the job on the original platform instantly.' },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '24px 20px', borderRadius: 14,
                border: '1px solid #e5e7eb', background: '#fff',
                transition: 'all 0.25s', cursor: 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; (e.currentTarget.querySelector('.fnum') as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget.querySelector('.ftitle') as HTMLElement).style.color = '#fff'; (e.currentTarget.querySelector('.fdesc') as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget.querySelector('.fnum') as HTMLElement).style.color = '#d1d5db'; (e.currentTarget.querySelector('.ftitle') as HTMLElement).style.color = '#111'; (e.currentTarget.querySelector('.fdesc') as HTMLElement).style.color = '#6b7280'; }}
              >
                <div className="fnum" style={{ fontSize: 11, fontWeight: 800, color: '#d1d5db', letterSpacing: 1, marginBottom: 14, transition: 'color 0.25s' }}>{f.num}</div>
                <div className="ftitle" style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 8, transition: 'color 0.25s' }}>{f.title}</div>
                <div className="fdesc" style={{ fontSize: 13, lineHeight: 1.65, color: '#6b7280', transition: 'color 0.25s' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Screenshot — single, centered */}
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
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
                <span style={{ marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>HelplyAI — Job Search</span>
              </div>
              <img
                src="https://beeptalk.s3.eu-north-1.amazonaws.com/d4ef4241-efb1-41c8-8420-8caf0d06a790.png"
                alt="HelplyAI job search"
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

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '60px 24px', background: 'linear-gradient(180deg, #000 0%, #111 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: 8 }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, margin: 0 }}>
              Pay only for what you use — no subscriptions, no hidden fees.
            </p>
          </div>

          {/* Compact 4-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Free Trial', price: 'Free', sub: '15 min', features: ['15 min free', 'Full AI chat', 'Interview mode', 'No card needed'], cta: 'Start Free', href: '/settings/dashboard', highlight: false, badge: '' },
              { label: '1 Credit', price: regionalPricing.credit_1hr.label, sub: regionalPricing.credit_1hr.sub, features: ['1 hr usage', 'Unlimited AI', 'Screen analysis', 'All features'], cta: 'Buy', href: '/settings/billing', highlight: false, badge: regionalPricing.credit_1hr.badge },
              { label: '3 Credits', price: regionalPricing.credit_3hr.label, sub: regionalPricing.credit_3hr.sub, features: ['3 hrs usage', 'Unlimited AI', regionalPricing.credit_3hr.savingsNote || 'Best for prep', 'All features'], cta: 'Buy', href: '/settings/billing', highlight: true, badge: regionalPricing.credit_3hr.badge || 'BEST VALUE' },
              { label: '10 Credits', price: regionalPricing.credit_10hr.label, sub: regionalPricing.credit_10hr.sub, features: ['10 hrs usage', 'Unlimited AI', regionalPricing.credit_10hr.savingsNote || 'Max value', 'Priority support'], cta: 'Buy', href: '/settings/billing', highlight: false, badge: regionalPricing.credit_10hr.badge },
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.highlight ? '#fff' : 'rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '24px 20px',
                border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: '#000', color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '3px 12px', borderRadius: 20, letterSpacing: 1, whiteSpace: 'nowrap' as const,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>{plan.badge}</div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, color: plan.highlight ? '#666' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 }}>{plan.label}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: plan.highlight ? '#000' : '#fff' }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: plan.highlight ? '#666' : 'rgba(255,255,255,0.5)', marginLeft: 4 }}>{plan.sub}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 16px 0' }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ fontSize: 12, color: plan.highlight ? '#333' : 'rgba(255,255,255,0.7)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: plan.highlight ? '#000' : '#4ade80', fontSize: 14, lineHeight: 1 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '10px 0',
                  borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: plan.highlight ? '#000' : 'rgba(255,255,255,0.1)',
                  color: plan.highlight ? '#fff' : '#fff',
                  textDecoration: 'none', transition: 'all 0.2s',
                  border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.2)',
                }}>{plan.cta}</a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Credits never expire · 1 credit = 1 hour · <a href="/settings/billing" style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Full billing details →</a>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 100,
              background: '#000', color: '#fff', fontSize: 11, fontWeight: 800,
              textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 16,
            }}>All Features</span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#000', margin: '0 0 14px', lineHeight: 1.1 }}>
              Everything you need to land<br />your next job
            </h2>
            <p style={{ color: '#555', fontSize: 16, margin: 0, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              Four powerful tools — AI interview assistance, smart resume building, universal job search, and mock interview practice — all in one platform.
            </p>
          </div>

          {/* Main feature cards — 2x2 large grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20, marginBottom: 20 }}>

            {/* 1. AI Interview Helper */}
            <div style={{
              borderRadius: 20, border: '1px solid rgba(0,0,0,0.09)', overflow: 'hidden',
              background: '#000', position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; }}
            >
              <div style={{ padding: '32px 32px 0' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 16 }}>
                  AI Interview Helper
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.25 }}>
                  Real-time AI answers during live interviews
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 24px', lineHeight: 1.65 }}>
                  Helply AI listens to your interview via mic and system audio, transcribes questions in real time, and generates accurate answers using GPT-4.1 or Claude — invisible to the interviewer.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 28 }}>
                  {['Real-time transcription', 'GPT-4.1 & Claude', 'Undetectable overlay', 'Coding support', 'Screen analyzer'].map(t => (
                    <span key={t} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
              {/* Browser window mockup — AI Interview Helper */}
              <div style={{ margin: '0 20px 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                {/* Title bar */}
                <div style={{ background: '#1a1a1a', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
                  <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600 }}>Helply AI — Interview Mode</span>
                </div>
                {/* App UI */}
                <div style={{ background: '#111', padding: '14px' }}>
                  {/* Transcription box */}
                  <div style={{ background: '#1c1c1c', borderRadius: 8, padding: '10px 12px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 6 }}>Interviewer said</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>"Walk me through how you would design a scalable REST API from scratch."</div>
                  </div>
                  {/* AI Answer streaming */}
                  <div style={{ background: '#1c1c1c', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      </div>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1 }}>AI Answer — GPT-4.1</span>
                      <span style={{ marginLeft: 'auto', fontSize: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontWeight: 700 }}>LIVE</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>"I'd start by defining the resource model — nouns like /users, /orders. Then enforce versioning via /v1/. For scalability, I'd add rate limiting, use stateless JWT auth, implement pagination on list endpoints, and put an API gateway in front for throttling and caching..."</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                      {['Copy', 'Regenerate'].map(b => (
                        <div key={b} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 700, cursor: 'default' }}>{b}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AI Resume Builder + ATS */}
            <div style={{
              borderRadius: 20, border: '1px solid rgba(0,0,0,0.09)', overflow: 'hidden',
              background: '#f9fafb', position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ padding: '32px 32px 0' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 16 }}>
                  Resume Builder + ATS
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#000', margin: '0 0 10px', lineHeight: 1.25 }}>
                  ATS-optimised resumes tailored to every JD
                </h3>
                <p style={{ fontSize: 14, color: '#555', margin: '0 0 24px', lineHeight: 1.65 }}>
                  Paste any job description and AI rewrites your resume with the exact keywords recruiters and ATS systems look for — then generates a print-ready PDF in seconds.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 28 }}>
                  {['JD keyword matching', 'ATS optimised', '3 templates', 'PDF export', 'One-click generate'].map(t => (
                    <span key={t} style={{ padding: '4px 12px', borderRadius: 20, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
              {/* Browser window mockup — Resume Builder */}
              <div style={{ margin: '0 20px 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                {/* Title bar */}
                <div style={{ background: '#1a1a1a', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
                  <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600 }}>Helply AI — Resume Builder</span>
                </div>
                {/* Two-column layout */}
                <div style={{ background: '#fff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {/* Left: input */}
                  <div style={{ padding: '12px', borderRight: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 9, color: '#888', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 }}>Job Description</div>
                    <div style={{ background: '#f9fafb', borderRadius: 6, padding: '8px', fontSize: 10, color: '#374151', lineHeight: 1.6, marginBottom: 8, border: '1px solid #e5e7eb', minHeight: 60 }}>"Senior Product Manager at Google. 5+ years exp. Must have experience with OKRs, roadmapping, agile, and cross-functional leadership..."</div>
                    <div style={{ background: '#000', borderRadius: 6, padding: '7px 0', textAlign: 'center' as const, fontSize: 10, fontWeight: 800, color: '#fff' }}>Generate Tailored Resume</div>
                  </div>
                  {/* Right: output */}
                  <div style={{ padding: '12px', background: '#fafafa' }}>
                    <div style={{ fontSize: 9, color: '#888', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 }}>Your Resume — ATS Score</div>
                    {[['Keyword match', 94, '#22c55e'], ['ATS compatibility', 98, '#2563eb'], ['Readability', 91, '#7c3aed']].map(([label, val, col]) => (
                      <div key={label as string} style={{ marginBottom: 7 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#374151', fontWeight: 700, marginBottom: 2 }}>
                          <span>{label}</span><span style={{ color: col as string }}>{val}%</span>
                        </div>
                        <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2 }}>
                          <div style={{ height: '100%', background: col as string, borderRadius: 2, width: `${val}%` }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, padding: '6px 8px', background: '#000', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Executive Template</span>
                      <span style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(255,255,255,0.15)', borderRadius: 4, color: '#fff', fontWeight: 700 }}>Download PDF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>

            {/* 3. Universal Job Search */}
            <div style={{
              borderRadius: 20, border: '1px solid rgba(0,0,0,0.09)', overflow: 'hidden',
              background: '#f9fafb',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ padding: '32px 32px 0' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 16 }}>
                  Universal Job Search
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#000', margin: '0 0 10px', lineHeight: 1.25 }}>
                  Find jobs from every platform in one place
                </h3>
                <p style={{ fontSize: 14, color: '#555', margin: '0 0 24px', lineHeight: 1.65 }}>
                  Search LinkedIn, Indeed, Glassdoor, and more simultaneously. Save listings, track application status, and match your resume to any role — all from one dashboard.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 28 }}>
                  {['LinkedIn', 'Indeed', 'Glassdoor', 'Application tracker', 'Resume match score'].map(t => (
                    <span key={t} style={{ padding: '4px 12px', borderRadius: 20, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
              {/* Browser window mockup — Job Search */}
              <div style={{ margin: '0 20px 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                {/* Title bar */}
                <div style={{ background: '#1a1a1a', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
                  <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600 }}>Helply AI — Job Search</span>
                </div>
                <div style={{ background: '#fff' }}>
                  {/* Search bar */}
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, background: '#f9fafb', borderRadius: 6, padding: '6px 10px', fontSize: 10, color: '#374151', border: '1px solid #e5e7eb' }}>Product Manager · Remote · Any experience</div>
                    <div style={{ padding: '6px 12px', background: '#000', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#fff' }}>Search</div>
                  </div>
                  {/* Source logos row */}
                  <div style={{ padding: '8px 12px', display: 'flex', gap: 8, borderBottom: '1px solid #f3f4f6' }}>
                    {[['in', '#0077b5'], ['G', '#ea4335'], ['G+', '#1a9b00']].map(([label, col]) => (
                      <div key={label as string} style={{ padding: '3px 8px', borderRadius: 4, background: col as string, fontSize: 9, fontWeight: 800, color: '#fff' }}>{label}</div>
                    ))}
                    <span style={{ fontSize: 9, color: '#9ca3af', alignSelf: 'center' }}>LinkedIn · Indeed · Glassdoor</span>
                  </div>
                  {/* Job listings */}
                  {[
                    { title: 'Senior Product Manager', co: 'Google', loc: 'Remote', match: '96%', tag: 'New' },
                    { title: 'Product Manager II', co: 'Stripe', loc: 'San Francisco', match: '91%', tag: '' },
                    { title: 'Associate PM', co: 'Notion', loc: 'New York', match: '88%', tag: '' },
                  ].map((job, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: i < 2 ? '1px solid #f9fafb' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: ['#4285f4','#635bff','#000'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>{job.co[0]}</div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {job.title}
                            {job.tag && <span style={{ fontSize: 8, padding: '1px 5px', background: '#dcfce7', color: '#16a34a', borderRadius: 3, fontWeight: 800 }}>{job.tag}</span>}
                          </div>
                          <div style={{ fontSize: 9, color: '#6b7280' }}>{job.co} · {job.loc}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 5, background: '#000', color: '#fff' }}>{job.match}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Mock Interview */}
            <div style={{
              borderRadius: 20, border: '1px solid rgba(0,0,0,0.09)', overflow: 'hidden',
              background: '#000',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; }}
            >
              <div style={{ padding: '32px 32px 0' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 16 }}>
                  Mock Interview
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.25 }}>
                  Practice interviews with AI voice questions
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 24px', lineHeight: 1.65 }}>
                  Select your target role and an AI voice asks you 5 real interview questions one by one. Use the Helply AI chatbot to get ideal answers and build your confidence before the real interview.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 28 }}>
                  {['12 job roles', 'Voice questions', 'AI answers', '5 daily sessions', 'Custom roles'].map(t => (
                    <span key={t} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
              {/* Browser window mockup — Mock Interview */}
              <div style={{ margin: '0 20px 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                {/* Title bar */}
                <div style={{ background: '#1a1a1a', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
                  <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600 }}>helplyai.co — Mock Interview</span>
                </div>
                <div style={{ background: '#111', padding: '14px' }}>
                  {/* Role badge + progress */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 12, background: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontWeight: 700 }}>Product Manager</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Question 2 of 5</span>
                  </div>
                  {/* Progress segments */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 2 ? 'linear-gradient(90deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>
                  {/* Waveform visual */}
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 10, height: 28 }}>
                    {[10,18,14,22,16,20,12,24,14,18,10].map((h, i) => (
                      <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: 'rgba(37,99,235,0.7)' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center' as const, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>Interviewer is speaking...</div>
                  {/* Question */}
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>"How do you measure whether a feature you shipped was actually successful?"</div>
                  </div>
                  {/* Tip */}
                  <div style={{ background: 'rgba(253,224,71,0.08)', borderRadius: 6, padding: '7px 10px', marginBottom: 10, border: '1px solid rgba(253,224,71,0.15)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(253,224,71,0.8)', lineHeight: 1.5 }}>Open Helply AI chatbot and click <strong>Get Answer</strong> to see the ideal answer</div>
                  </div>
                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, padding: '7px 0', background: '#fff', borderRadius: 7, textAlign: 'center' as const, fontSize: 10, fontWeight: 800, color: '#000' }}>Next Question</div>
                    <div style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 7, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)' }}>End</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom capability pills */}
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 16 }}>Also included</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center', gap: 10 }}>
              {[
                'Real-time speech transcription', 'GPT-4.1 + Claude 4.0', 'Coding round support',
                'Screen content analyzer', 'Smart interview reminders', '100% undetectable overlay',
                'Zoom, Meet & Teams support', 'Multi-language support', 'Application history tracker',
              ].map(cap => (
                <span key={cap} style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151',
                }}>{cap}</span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Modern UI Section (Uiverse-inspired) */}
      <section style={{ padding: '60px 24px', background: 'linear-gradient(165deg, #0b0b0b 0%, #161616 55%, #0f0f0f 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.4,
            }}>
              <Icon name="Sparkles" size={14} /> UI UPGRADE
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, color: '#fff', margin: '14px 0 10px', letterSpacing: '-0.8px' }}>
              Faster Decisions, Cleaner Interface
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.72)' }}>
              Polished cards, modern buttons, and clean layouts built for interview workflows.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 18 }}>
            <div style={{
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))',
              padding: 22,
              boxShadow: '0 22px 50px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                {[
                  { title: 'One-click startup', desc: 'Launch interview mode instantly with preloaded context.', icon: 'Rocket' },
                  { title: 'Live answer stream', desc: 'Readable token-by-token response for natural flow.', icon: 'MessageSquare' },
                  { title: 'Screen insights', desc: 'Analyze shared screens and coding tasks in real time.', icon: 'Monitor' },
                  { title: 'Reminder smart actions', desc: 'Capture follow-ups without leaving interview focus.', icon: 'Bell' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(9,9,9,0.5)',
                    padding: 14,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(145deg, #ffffff, #cccccc)',
                      color: '#000', marginBottom: 10,
                    }}>
                      <Icon name={item.icon} size={16} />
                    </div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', fontSize: 12.5, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.06)',
                padding: 16,
              }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Quick Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => handleDownloadClick('ios')}
                    style={{
                      border: 'none', borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #ffffff 0%, #d6d6d6 100%)',
                      color: '#000', fontWeight: 700, fontSize: 13,
                      boxShadow: '0 8px 18px rgba(255,255,255,0.2)',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    Download for Mac
                  </button>
                  <a
                    href={user ? '/settings/dashboard' : '/signin'}
                    onClick={() => trackCTAClick(user ? 'go_dashboard_modern_ui' : 'start_now_modern_ui')}
                    style={{
                      borderRadius: 12, padding: '12px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff', fontWeight: 700, fontSize: 13,
                      textDecoration: 'none', textAlign: 'center',
                    }}
                  >
                    {user ? 'Go to Dashboard' : 'Start Free'}
                  </a>
                </div>
              </div>

              <div style={{
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                padding: 16,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { value: '100K+', label: 'Users' },
                    { value: '4.9/5', label: 'Rating' },
                    { value: '<2 min', label: 'Setup' },
                    { value: '24/7', label: 'AI support' },
                  ].map((stat, idx) => (
                    <div key={idx} style={{
                      borderRadius: 10, background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.1)', padding: '10px 8px',
                      textAlign: 'center',
                    }}>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{stat.value}</div>
                      <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: 11 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
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

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '60px 24px', background: 'linear-gradient(180deg, #f9f9f9 0%, #fff 100%)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, letterSpacing: '-1px', color: '#000', marginBottom: 8 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#666', fontSize: 15, margin: 0 }}>Everything you need to know about HelplyAI</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 10 }}>
            {[
              { q: 'What is HelplyAI?', a: 'AI-powered interview assistant giving real-time answers during coding & behavioral interviews — 100% invisible on screen share.' },
              { q: 'Is it detectable on Zoom / Meet?', a: 'No. HelplyAI uses advanced overlay tech that is completely undetectable on Zoom, Google Meet, Teams, and all major platforms.' },
              { q: 'How does pricing work?', a: 'Pay-per-use credits — no monthly subscription. Credits never expire. Start free (15 min), then from ₹399/hr.' },
              { q: 'Mac or Windows?', a: 'Both! Works on macOS (Apple Silicon & Intel) and Windows 10/11. Download from the Dashboard.' },
              { q: 'Interview Mode vs General Mode?', a: 'Interview Mode captures interviewer audio for live Q&A. General Mode is for everyday tasks — writing, coding, screen analysis.' },
              { q: 'How do I start?', a: 'Download the app → sign up → paste your JD & resume → start your session. Setup takes under 2 minutes.' },
            ].map((faq, i) => (
              <div key={i} style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                overflow: 'hidden',
                background: openFaq === i ? '#000' : '#fff',
                transition: 'background 0.2s',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: openFaq === i ? '#fff' : '#000' }}>{faq.q}</span>
                  <span style={{
                    fontSize: 20, color: openFaq === i ? '#fff' : '#666', flexShrink: 0, marginLeft: 12,
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s',
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.6 }}>
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
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>AI Tools</div>
              <a href="/ai-interview-helper" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >AI Interview Helper</a>
              <a href="/online-interview-helper" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Online Interview Helper</a>
              <a href="/mock-interview-ai" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Mock Interview AI</a>
              <a href="/ai-resume-builder" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >AI Resume Builder</a>
              <a href="/ai-job-search" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >AI Job Search</a>
              <a href="/ai-interview-answer-generator" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Interview Answer Generator</a>
              <a href="/free-ai-interview-helper" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Free AI Interview Helper</a>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Platforms</div>
              <a href="/blog/zoom-ai-interview-helper" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Zoom Interview Helper</a>
              <a href="/google-meet-ai-interview-helper" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Google Meet Helper</a>
              <a href="/microsoft-teams-ai-interview-helper" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Microsoft Teams Helper</a>
              <a href="/blog/best-ai-interview-helper-tools" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Best AI Interview Tools</a>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Compare</div>
              <a href="/compare/final-round-ai-vs-helplyai" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >vs Final Round AI</a>
              <a href="/compare/lockedin-ai-vs-helplyai" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >vs LockedIn AI</a>
              <a href="/compare/sensei-ai-vs-helplyai" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >vs Sensei AI</a>
              <a href="/compare/parakeet-ai-vs-helplyai" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >vs Parakeet AI</a>
              <a href="/alternatives" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >All Alternatives</a>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Product</div>
              <a href="#features" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Features</a>
              <a href="/settings/dashboard" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Dashboard</a>
              <a href="/settings/billing" style={footerLinkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >Pricing</a>
              <a href="#" onClick={() => handleDownloadClick('ios')} style={footerLinkStyle}
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

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {
          /* Nav */
          .home-nav-links { display: none !important; }
          .home-nav-mobile { display: flex !important; }

          /* Feature cards grid: 1 column on mobile */
          #features > div > div[style*="minmax(480px"] {
            grid-template-columns: 1fr !important;
          }
          /* Section padding */
          section { padding-left: 16px !important; padding-right: 16px !important; }
          /* Hero top padding for fixed nav */
          section:first-of-type { padding-top: 80px !important; }
        }

        @media (max-width: 600px) {
          /* Stack all auto-fit grids to single column */
          [style*="repeat(auto-fit"] {
            grid-template-columns: 1fr !important;
          }
          /* Feature section 2x2 */
          [style*="minmax(480px"] {
            grid-template-columns: 1fr !important;
          }
          /* Smaller headings */
          h1, h2 { letter-spacing: -0.5px !important; }
          /* Download buttons stack */
          .download-buttons { flex-direction: column !important; }
          /* Pricing cards */
          [style*="minmax(300px"] {
            grid-template-columns: 1fr !important;
          }
          /* Mock window previews don't overflow */
          [style*="minmax(200px"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        /* Ensure all images are responsive */
        img { max-width: 100%; height: auto; }

        /* Smooth scrolling */
        html { scroll-behavior: smooth; }

        /* Tap targets: minimum 44px on mobile */
        @media (max-width: 768px) {
          button, a { min-height: 44px; }
        }
      `}</style>
      </div>
    </div>
  )
}
