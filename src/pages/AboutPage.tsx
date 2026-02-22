import { useState, useEffect } from 'react'

const Icon = ({ name, size = 24 }: { name: string; size?: number }) => {
  const icons: Record<string, React.ReactElement> = {
    Users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Target: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    Heart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    Zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  }
  return icons[name] || null
}

export default function AboutPage() {
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
            color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Home</a>
          <a href="/#features" style={{
            color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Features</a>
          <a href="/about" style={{
            color: '#000', fontSize: 14, fontWeight: 600, transition: 'color 0.2s',
          }}>About Us</a>
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
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 60px', textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900,
          lineHeight: 1.1, letterSpacing: '-1.5px', maxWidth: 800,
          marginBottom: 24,
          color: '#000',
        }}>
          About HelplyAI
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)', color: '#666',
          maxWidth: 720, lineHeight: 1.7, marginBottom: 40, fontWeight: 400,
        }}>
          We're on a mission to democratize interview success and help candidates 
          land their dream jobs with confidence.
        </p>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          
          <div style={{
            padding: 40,
            borderRadius: 18,
            background: '#000',
            color: '#fff',
            transition: 'all 0.4s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}>
              <Icon name="Target" size={28} />
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Our Mission</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
              To empower every candidate with AI-powered tools that level the playing field in 
              technical interviews, making success accessible to all.
            </p>
          </div>

          <div style={{
            padding: 40,
            borderRadius: 18,
            background: '#fafafa',
            border: '1px solid rgba(0,0,0,0.08)',
            transition: 'all 0.4s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              color: '#fff',
            }}>
              <Icon name="Zap" size={28} />
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16, color: '#000' }}>Our Vision</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#666' }}>
              A world where talent and preparation matter more than interview anxiety, 
              where every qualified candidate gets a fair shot at their dream role.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 24px',
        background: '#fafafa',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 50,
            color: '#000',
            textAlign: 'center',
          }}>
            Our Impact
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {[
              { number: '1.5M+', label: 'Users Worldwide', icon: 'Users' },
              { number: '100K+', label: 'Successful Interviews', icon: 'Target' },
              { number: '4.88/5', label: 'Average Rating', icon: 'Heart' },
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: 32,
                borderRadius: 16,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#fff',
                }}>
                  <Icon name={stat.icon} size={32} />
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#000', marginBottom: 8 }}>{stat.number}</div>
                <div style={{ fontSize: 15, color: '#666', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 32,
          color: '#000',
          textAlign: 'center',
        }}>
          Our Story
        </h2>
        
        <div style={{ fontSize: 17, lineHeight: 1.9, color: '#666', marginBottom: 24 }}>
          <p style={{ marginBottom: 24 }}>
            HelplyAI was founded by a team of engineers who experienced firsthand the stress and 
            challenges of technical interviews. We noticed that many talented developers struggled 
            not because they lacked skills, but because interview anxiety and pressure affected 
            their performance.
          </p>
          <p style={{ marginBottom: 24 }}>
            We built HelplyAI to be the supportive companion every candidate deserves. Using 
            cutting-edge AI technology, we've created a platform that provides real-time assistance 
            while maintaining complete privacy and discretion.
          </p>
          <p>
            Today, over 1.5 million professionals trust HelplyAI to help them succeed in interviews 
            at companies like Google, Meta, Amazon, Microsoft, and Tesla. We're proud to have played 
            a part in helping talented individuals achieve their career goals.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: '80px 24px',
        background: '#000',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 50,
            textAlign: 'center',
          }}>
            Our Values
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            {[
              { title: 'Privacy First', desc: 'Your data and usage remain completely private and secure.' },
              { title: 'Accessibility', desc: 'Making interview success tools available to everyone.' },
              { title: 'Innovation', desc: 'Continuously improving with the latest AI technology.' },
              { title: 'Integrity', desc: 'Building tools that enhance, not replace, your abilities.' },
            ].map((value, i) => (
              <div key={i} style={{
                padding: 28,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{value.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 16,
            color: '#000',
          }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: '#666', fontSize: 17, marginBottom: 36 }}>
            Join over 1.5 million users who trust HelplyAI for their interview success.
          </p>

          <a href="/settings/dashboard" style={{
            display: 'inline-block',
            padding: '16px 40px', borderRadius: 100, fontSize: 16, fontWeight: 700,
            background: '#000',
            color: '#fff', transition: 'all 0.3s',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
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
              <a href="/#features" style={{ display: 'block', color: '#666', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
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
              <a href="/about" style={{ display: 'block', color: '#666', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
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
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
      </div>
    </div>
  )
}
