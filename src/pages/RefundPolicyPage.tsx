import { useState, useEffect } from 'react'

export default function RefundPolicyPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    window.scrollTo(0, 0)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sectionStyle: React.CSSProperties = { marginBottom: 32 }
  const h2Style: React.CSSProperties = { fontSize: 24, fontWeight: 800, color: '#000', marginBottom: 16, marginTop: 40 }
  const pStyle: React.CSSProperties = { fontSize: 15, color: '#444', lineHeight: 1.8, marginBottom: 12 }
  const ulStyle: React.CSSProperties = { paddingLeft: 24, marginBottom: 16 }
  const liStyle: React.CSSProperties = { fontSize: 15, color: '#444', lineHeight: 1.8, marginBottom: 4 }

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
          fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#000',
          letterSpacing: '-1px', marginBottom: 8,
        }}>
          Refund Policy
        </h1>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 40, fontWeight: 600 }}>
          Last Updated: February 22, 2026
        </p>

        <div style={{
          padding: 24, borderRadius: 12, background: '#fafafa',
          border: '1px solid rgba(0,0,0,0.08)', marginBottom: 40,
        }}>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Thank you for choosing HelplyAI. We value your trust and strive to provide the best possible AI-powered services. This Refund Policy explains our policies regarding payments, cancellations, and refunds.
          </p>
        </div>

        <p style={pStyle}>
          By making a purchase through HelplyAI, you agree to the terms outlined in this Refund Policy.
        </p>

        {/* Section 1 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>1. General Refund Policy</h2>
          <p style={pStyle}>All purchases made through HelplyAI are final and non-refundable.</p>
          <p style={pStyle}>Once a payment has been successfully completed, no refunds, cancellations, or reversals will be provided under any circumstances, except where required by applicable law.</p>
          <p style={pStyle}>We encourage users to review all plan details, pricing, and features carefully before making a purchase.</p>
        </div>

        {/* Section 2 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>2. No Refund Policy</h2>
          <p style={pStyle}>HelplyAI follows a strict no-refund policy, which means:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Payments made for subscriptions, premium features, or services are non-refundable.</li>
            <li style={liStyle}>Partial refunds are not available.</li>
            <li style={liStyle}>Unused subscription time is not refundable.</li>
            <li style={liStyle}>Accidental purchases are not eligible for refunds.</li>
            <li style={liStyle}>Failure to use the Service does not qualify for a refund.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>3. Payment Issues and Failed Transactions</h2>
          <p style={pStyle}>If you experience any of the following payment-related issues:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Payment deducted but service not activated</li>
            <li style={liStyle}>Duplicate charges</li>
            <li style={liStyle}>Failed or pending transactions</li>
            <li style={liStyle}>Technical payment errors</li>
          </ul>
          <p style={pStyle}>Please contact our support team immediately.</p>
          <div style={{
            padding: 20, borderRadius: 12, background: '#fafafa',
            border: '1px solid rgba(0,0,0,0.08)', marginBottom: 16,
          }}>
            <p style={{ ...pStyle, marginBottom: 8 }}>📧 <strong>Email:</strong> support@helplyai.com</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>When contacting us, please include:</p>
          </div>
          <ul style={ulStyle}>
            <li style={liStyle}>Registered email (if applicable)</li>
            <li style={liStyle}>Transaction ID</li>
            <li style={liStyle}>Date and time of payment</li>
            <li style={liStyle}>Payment method used</li>
            <li style={liStyle}>Screenshots (if available)</li>
          </ul>
          <p style={pStyle}>Our team will investigate and resolve the issue as quickly as possible.</p>
        </div>

        {/* Section 4 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Razorpay Payment Processing</h2>
          <p style={pStyle}>All payments on HelplyAI are processed securely through Razorpay.</p>
          <p style={pStyle}>In rare cases where a refund is approved due to technical failure or payment error:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>The refund will be processed via Razorpay.</li>
            <li style={liStyle}>The refunded amount will be credited to the original payment method.</li>
            <li style={liStyle}>Processing may take 5 to 7 business days, depending on your bank or payment provider.</li>
          </ul>
          <p style={pStyle}>HelplyAI is not responsible for delays caused by banks or payment gateways.</p>
        </div>

        {/* Section 5 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Subscription Cancellations</h2>
          <p style={pStyle}>Users may cancel their subscription at any time.</p>
          <p style={pStyle}>However:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Cancellation will prevent future charges.</li>
            <li style={liStyle}>No refund will be issued for the current billing period.</li>
            <li style={liStyle}>Access will continue until the end of the paid period.</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Chargebacks and Disputes</h2>
          <p style={pStyle}>We encourage users to contact HelplyAI support before initiating any chargeback or dispute with their bank or payment provider.</p>
          <p style={pStyle}>Unauthorized chargebacks may result in:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Suspension of account access</li>
            <li style={liStyle}>Termination of services</li>
            <li style={liStyle}>Restriction from future use</li>
          </ul>
          <p style={pStyle}>We reserve the right to contest unjustified disputes.</p>
        </div>

        {/* Section 7 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>7. Pricing Changes</h2>
          <p style={pStyle}>HelplyAI reserves the right to modify pricing, plans, and features at any time.</p>
          <p style={pStyle}>Price changes will not affect previously completed transactions.</p>
        </div>

        {/* Section 8 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>8. Limitation of Liability</h2>
          <p style={pStyle}>HelplyAI is not responsible for:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>User dissatisfaction after purchase</li>
            <li style={liStyle}>Network or connectivity issues</li>
            <li style={liStyle}>Device incompatibility</li>
            <li style={liStyle}>Service interruptions</li>
            <li style={liStyle}>Misuse of the application</li>
          </ul>
          <p style={pStyle}>Refunds will not be issued for these reasons.</p>
        </div>

        {/* Section 9 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>9. Changes to This Refund Policy</h2>
          <p style={pStyle}>We may update this Refund Policy periodically.</p>
          <p style={pStyle}>Any changes will be posted within the app or on our website with an updated "Last Updated" date.</p>
          <p style={pStyle}>Continued use of the Service constitutes acceptance of the revised policy.</p>
        </div>

        {/* Section 10 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>10. Contact Information</h2>
          <p style={pStyle}>For any payment-related questions or concerns, please contact us:</p>
          <div style={{
            padding: 20, borderRadius: 12, background: '#fafafa',
            border: '1px solid rgba(0,0,0,0.08)', marginBottom: 16,
          }}>
            <p style={{ ...pStyle, marginBottom: 4 }}>📧 <strong>Email:</strong> support@helplyai.com</p>
            <p style={{ ...pStyle, marginBottom: 4 }}>📱 <strong>App Name:</strong> HelplyAI</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>🌐 <strong>Website:</strong> www.helplyai.com</p>
          </div>
        </div>

        {/* Section 11 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>11. Acceptance of Policy</h2>
          <p style={pStyle}>By completing a payment on HelplyAI, you confirm that:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>You have read and understood this Refund Policy</li>
            <li style={liStyle}>You agree to its terms</li>
            <li style={liStyle}>You accept the no-refund policy</li>
          </ul>
          <p style={pStyle}>If you do not agree, please do not proceed with payment.</p>
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
