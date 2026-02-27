import { useState, useEffect } from 'react'

export default function PrivacyPolicyPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    window.scrollTo(0, 0)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sectionStyle: React.CSSProperties = {
    marginBottom: 32,
  }

  const h2Style: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 800,
    color: '#000',
    marginBottom: 16,
    marginTop: 40,
  }

  const h3Style: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: '#000',
    marginBottom: 12,
    marginTop: 24,
  }

  const pStyle: React.CSSProperties = {
    fontSize: 15,
    color: '#444',
    lineHeight: 1.8,
    marginBottom: 12,
  }

  const ulStyle: React.CSSProperties = {
    paddingLeft: 24,
    marginBottom: 16,
  }

  const liStyle: React.CSSProperties = {
    fontSize: 15,
    color: '#444',
    lineHeight: 1.8,
    marginBottom: 4,
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.3s',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 18, color: '#fff',
          }}>🌟</div>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#000' }}>HelplyAI</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/" style={{ color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Home</a>
          <a href="/#features" style={{ color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >Features</a>
          <a href="/about" style={{ color: '#555', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >About Us</a>
          <a href="/settings/dashboard" style={{
            padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600,
            background: '#000', color: '#fff', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
          >Dashboard</a>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px' }}>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          color: '#000',
          letterSpacing: '-1px',
          marginBottom: 8,
        }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 40, fontWeight: 600 }}>
          Last Updated: February 22, 2026
        </p>

        <div style={{
          padding: 24,
          borderRadius: 12,
          background: '#fafafa',
          border: '1px solid rgba(0,0,0,0.08)',
          marginBottom: 40,
        }}>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Welcome to HelplyAI ("we," "our," "us"). Your privacy is extremely important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and related services (collectively, the "Service").
          </p>
        </div>

        <p style={pStyle}>
          By using HelplyAI, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our Service.
        </p>

        {/* Section 1 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>1. Information We Collect</h2>

          <h3 style={h3Style}>1.1 Personal Information</h3>
          <p style={pStyle}>HelplyAI does not collect, store, or process any personal information such as:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Name</li>
            <li style={liStyle}>Email address</li>
            <li style={liStyle}>Phone number</li>
            <li style={liStyle}>Address</li>
            <li style={liStyle}>Date of birth</li>
            <li style={liStyle}>Payment information</li>
            <li style={liStyle}>Identification details</li>
          </ul>
          <p style={pStyle}>We are committed to providing our services without requiring users to share personal data.</p>

          <h3 style={h3Style}>1.2 Non-Personal Information</h3>
          <p style={pStyle}>We may collect limited non-personal and anonymous technical information automatically, such as:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Device type</li>
            <li style={liStyle}>Operating system</li>
            <li style={liStyle}>App version</li>
            <li style={liStyle}>Browser type</li>
            <li style={liStyle}>General usage patterns</li>
          </ul>
          <p style={pStyle}>This data is used only to improve app performance and user experience. It does not identify you personally.</p>

          <h3 style={h3Style}>1.3 Chat and Interaction Data</h3>
          <p style={pStyle}>HelplyAI processes user inputs (such as chat messages or commands) only to provide responses in real time.</p>
          <p style={pStyle}>We do not store, save, or retain:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Chat conversations</li>
            <li style={liStyle}>Voice inputs</li>
            <li style={liStyle}>Uploaded content</li>
            <li style={liStyle}>Interaction history</li>
          </ul>
          <p style={pStyle}>All interactions are processed temporarily and discarded after use.</p>
        </div>

        {/* Section 2 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>2. How We Use Information</h2>
          <p style={pStyle}>Since we do not store personal data, we use limited anonymous data only for:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Providing AI-based responses</li>
            <li style={liStyle}>Improving application performance</li>
            <li style={liStyle}>Fixing bugs and errors</li>
            <li style={liStyle}>Enhancing user experience</li>
            <li style={liStyle}>Maintaining security</li>
          </ul>
          <p style={pStyle}>We never use your data for advertising, profiling, or selling purposes.</p>
        </div>

        {/* Section 3 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>3. Data Storage and Retention</h2>
          <p style={pStyle}>HelplyAI follows a no-data-storage policy.</p>
          <ul style={ulStyle}>
            <li style={liStyle}>We do not permanently store user conversations.</li>
            <li style={liStyle}>We do not create user profiles.</li>
            <li style={liStyle}>We do not retain personal identifiers.</li>
          </ul>
          <p style={pStyle}>Any temporary data used for processing is automatically deleted after the session ends.</p>
        </div>

        {/* Section 4 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Cookies and Tracking Technologies</h2>
          <p style={pStyle}>HelplyAI does not use cookies for tracking or advertising.</p>
          <p style={pStyle}>If our website uses essential cookies, they are used only for:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Basic functionality</li>
            <li style={liStyle}>Security</li>
            <li style={liStyle}>Performance optimization</li>
          </ul>
          <p style={pStyle}>No tracking cookies are used for marketing or analytics without consent.</p>
        </div>

        {/* Section 5 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Data Sharing and Disclosure</h2>
          <p style={pStyle}>We do not sell, rent, trade, or share your data with third parties.</p>
          <p style={pStyle}>We may disclose limited information only if:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Required by law</li>
            <li style={liStyle}>Ordered by a court or government authority</li>
            <li style={liStyle}>Necessary to protect legal rights</li>
            <li style={liStyle}>Needed to prevent fraud or security threats</li>
          </ul>
          <p style={pStyle}>Even in such cases, only minimal required information will be disclosed.</p>
        </div>

        {/* Section 6 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Third-Party Services</h2>
          <p style={pStyle}>HelplyAI may use third-party services for:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Hosting</li>
            <li style={liStyle}>Cloud infrastructure</li>
            <li style={liStyle}>AI processing</li>
            <li style={liStyle}>Error monitoring</li>
          </ul>
          <p style={pStyle}>These providers are contractually obligated to protect your data and comply with privacy standards.</p>
          <p style={pStyle}>We are not responsible for third-party privacy practices. Please review their policies separately.</p>
        </div>

        {/* Section 7 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>7. Data Security</h2>
          <p style={pStyle}>We take strong measures to protect your information, including:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Secure servers</li>
            <li style={liStyle}>Encryption protocols</li>
            <li style={liStyle}>Access controls</li>
            <li style={liStyle}>Regular security updates</li>
            <li style={liStyle}>Monitoring systems</li>
          </ul>
          <p style={pStyle}>While no system is 100% secure, we strive to use commercially acceptable methods to protect user data.</p>
        </div>

        {/* Section 8 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>8. Children's Privacy</h2>
          <p style={pStyle}>HelplyAI does not knowingly collect data from children under the age of 13.</p>
          <p style={pStyle}>If you believe a child has provided personal information, please contact us immediately, and we will remove it.</p>
        </div>

        {/* Section 9 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>9. User Rights and Choices</h2>
          <p style={pStyle}>Depending on your location, you may have the right to:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Access your information</li>
            <li style={liStyle}>Request deletion</li>
            <li style={liStyle}>Restrict processing</li>
            <li style={liStyle}>Object to data usage</li>
          </ul>
          <p style={pStyle}>Since we do not store personal data, most of these requests are automatically fulfilled.</p>
          <p style={pStyle}>You may stop using the Service at any time.</p>
        </div>

        {/* Section 10 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>10. International Users</h2>
          <p style={pStyle}>HelplyAI may be accessed globally. By using the Service, you agree that your information may be processed in accordance with this Privacy Policy and applicable laws.</p>
          <p style={pStyle}>We comply with relevant data protection regulations where applicable.</p>
        </div>

        {/* Section 11 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>11. GDPR and CCPA Compliance</h2>
          <p style={pStyle}>We respect user rights under:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>General Data Protection Regulation (GDPR)</li>
            <li style={liStyle}>California Consumer Privacy Act (CCPA)</li>
          </ul>
          <p style={pStyle}>Key principles:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>No sale of personal data</li>
            <li style={liStyle}>No profiling</li>
            <li style={liStyle}>No tracking</li>
            <li style={liStyle}>No storage of personal data</li>
          </ul>
          <p style={pStyle}>Users may contact us for any privacy-related concerns.</p>
        </div>

        {/* Section 12 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>12. Changes to This Privacy Policy</h2>
          <p style={pStyle}>We may update this Privacy Policy from time to time.</p>
          <p style={pStyle}>When changes are made:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>The "Last Updated" date will be revised</li>
            <li style={liStyle}>Updated policies will be published in the app/website</li>
          </ul>
          <p style={pStyle}>Continued use of HelplyAI means acceptance of the updated policy.</p>
        </div>

        {/* Section 13 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>13. Limitation of Liability</h2>
          <p style={pStyle}>HelplyAI provides AI-generated information for assistance purposes only.</p>
          <p style={pStyle}>We are not responsible for:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Decisions made based on AI responses</li>
            <li style={liStyle}>Losses caused by misuse</li>
            <li style={liStyle}>Technical failures beyond our control</li>
          </ul>
          <p style={pStyle}>Users are responsible for how they use the information provided.</p>
        </div>

        {/* Section 14 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>14. Contact Us</h2>
          <p style={pStyle}>If you have any questions, concerns, or complaints about this Privacy Policy, please contact us at:</p>
          <div style={{
            padding: 20,
            borderRadius: 12,
            background: '#fafafa',
            border: '1px solid rgba(0,0,0,0.08)',
            marginBottom: 16,
          }}>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Email:</strong> support@helplyai.com</p>
            <p style={{ ...pStyle, marginBottom: 0 }}><strong>App Name:</strong> HelplyAI</p>
          </div>
        </div>

        {/* Section 15 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>15. Consent</h2>
          <p style={pStyle}>By using HelplyAI, you:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Acknowledge this Privacy Policy</li>
            <li style={liStyle}>Agree to its terms</li>
            <li style={liStyle}>Consent to limited data processing as described</li>
          </ul>
          <p style={pStyle}>If you do not agree, please discontinue use.</p>
        </div>

      </div>

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
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#999', fontSize: 13 }}>© 2026 HelplyAI. All rights reserved.</span>
          <span style={{ color: '#999', fontSize: 12 }}>Powered by Levelon Technologies Private Limited</span>
        </div>
      </footer>
    </div>
  )
}
