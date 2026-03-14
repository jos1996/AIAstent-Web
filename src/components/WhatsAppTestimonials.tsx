import React from 'react';

const conversations = [
  {
    messages: [
      { type: 'received', text: "Hi! Does HelplyAI really work for interviews?", time: '9:15 AM' },
      { type: 'sent', text: "Yes! Real-time AI assistance during interviews. Invisible on screen share.", time: '9:16 AM' },
      { type: 'received', text: "What's the price?", time: '9:17 AM' },
      { type: 'sent', text: "Day pass is just ₹399 for 24 hours unlimited!", time: '9:17 AM' },
      { type: 'received', text: "Perfect! Buying now 🤞", time: '9:20 AM' },
      { type: 'received', text: "UPDATE: GOT SELECTED AT GOOGLE! 5 rounds cleared! 🎉🎉", time: '6:45 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Amazon interview in 2 hours. Will this help?", time: '10:30 AM' },
      { type: 'sent', text: "Absolutely! Quick setup. Works on Zoom, Meet, Teams.", time: '10:31 AM' },
      { type: 'received', text: "Just purchased. Setting up now", time: '10:35 AM' },
      { type: 'received', text: "OMG the suggestions are insane! 🔥", time: '12:45 PM' },
      { type: 'received', text: "AMAZON SDE-2 OFFER! Best ₹399 ever! 💯", time: '5:20 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Is it detectable on screen share?", time: '2:10 PM' },
      { type: 'sent', text: "100% invisible! Advanced overlay technology.", time: '2:11 PM' },
      { type: 'received', text: "How does it capture questions?", time: '2:12 PM' },
      { type: 'sent', text: "System audio + screen analysis. AI generates perfect answers!", time: '2:13 PM' },
      { type: 'received', text: "Buying now!", time: '2:15 PM' },
      { type: 'received', text: "MICROSOFT OFFER! System design suggestions were PERFECT! 🚀", time: '8:30 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Failed 8 interviews already 😢 Will this help?", time: '11:00 AM' },
      { type: 'sent', text: "100K+ candidates cracked interviews with us. You've got this! 💪", time: '11:01 AM' },
      { type: 'received', text: "What about coding rounds?", time: '11:02 AM' },
      { type: 'sent', text: "AI suggests optimal solutions with explanations!", time: '11:03 AM' },
      { type: 'received', text: "Taking the leap 🙏", time: '11:10 AM' },
      { type: 'received', text: "META OFFER! From 8 rejections to Meta! 😭🎉", time: '7:15 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Works for HR rounds too?", time: '3:20 PM' },
      { type: 'sent', text: "Yes! Technical, HR, Behavioral, System Design - all covered!", time: '3:21 PM' },
      { type: 'received', text: "Salary negotiation?", time: '3:22 PM' },
      { type: 'sent', text: "AI suggests strategies based on market data!", time: '3:23 PM' },
      { type: 'received', text: "Getting it now", time: '3:25 PM' },
      { type: 'received', text: "FLIPKART! 40% higher package! AI negotiation worked! 📈", time: '9:00 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "First interview ever. Super nervous 😰", time: '8:00 AM' },
      { type: 'sent', text: "HelplyAI will be your silent companion. Focus on speaking!", time: '8:01 AM' },
      { type: 'received', text: "How fast are the answers?", time: '8:02 AM' },
      { type: 'sent', text: "2-3 seconds! Read while interviewer talks.", time: '8:03 AM' },
      { type: 'received', text: "Purchasing now!", time: '8:05 AM' },
      { type: 'received', text: "TCS 7 LPA! Mom is so happy! 🌟", time: '4:30 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "I'm a fresher. Is ₹399 worth it?", time: '1:00 PM' },
      { type: 'sent', text: "One interview = lakhs in salary. ₹399 is nothing!", time: '1:01 PM' },
      { type: 'received', text: "Works on Mac?", time: '1:02 PM' },
      { type: 'sent', text: "Mac & Windows both! Seamless experience!", time: '1:03 PM' },
      { type: 'received', text: "Downloaded. Interview in 1 hour!", time: '1:10 PM' },
      { type: 'received', text: "INFOSYS 12 LPA! This is MAGIC! ✨", time: '5:45 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Goldman Sachs interview. Very tough 😓", time: '7:30 AM' },
      { type: 'sent', text: "HelplyAI handles complex finance + tech perfectly!", time: '7:31 AM' },
      { type: 'received', text: "Even puzzles?", time: '7:32 AM' },
      { type: 'sent', text: "AI breaks down puzzles step-by-step! 🧠", time: '7:33 AM' },
      { type: 'received', text: "Let's do this! 💪", time: '7:35 AM' },
      { type: 'received', text: "GOLDMAN SACHS! Problem-solving was exceptional! 🏆", time: '6:00 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Is HelplyAI legit?", time: '4:00 PM' },
      { type: 'sent', text: "1.5M+ users, 4.88 rating. Check reviews!", time: '4:01 PM' },
      { type: 'received', text: "Works for Deloitte consulting?", time: '4:02 PM' },
      { type: 'sent', text: "Perfect for case studies & market sizing!", time: '4:03 PM' },
      { type: 'received', text: "Giving it a shot", time: '4:05 PM' },
      { type: 'received', text: "DELOITTE CONSULTANT! Case suggestions brilliant! 🎯", time: '8:00 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Back to back interviews - Paytm & PhonePe", time: '10:00 PM' },
      { type: 'sent', text: "Day pass = unlimited interviews for 24 hours!", time: '10:01 PM' },
      { type: 'received', text: "Both fintech. Will AI know?", time: '10:02 PM' },
      { type: 'sent', text: "Trained on all domains - fintech, e-commerce, SaaS!", time: '10:03 PM' },
      { type: 'received', text: "Purchasing! Wish me luck! 🤞", time: '10:05 PM' },
      { type: 'received', text: "BOTH OFFERS! Going with PhonePe! 🚀🚀", time: '7:30 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Non-tech role? I'm applying for PM", time: '11:30 AM' },
      { type: 'sent', text: "AI excels at PM - product sense, metrics, strategy!", time: '11:31 AM' },
      { type: 'received', text: "Estimation questions?", time: '11:32 AM' },
      { type: 'sent', text: "Step-by-step with logical frameworks!", time: '11:33 AM' },
      { type: 'received', text: "That's my weakness. Buying!", time: '11:35 AM' },
      { type: 'received', text: "CRED PM! Estimation was smooth! 💯", time: '6:15 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "3 saal se job nahi lagi 😭", time: '9:00 AM' },
      { type: 'sent', text: "Don't lose hope! Let's crack this together! 💪", time: '9:01 AM' },
      { type: 'received', text: "Sach mein kaam karega?", time: '9:02 AM' },
      { type: 'sent', text: "Haan! Real-time AI. Tum bolo, AI sochega!", time: '9:03 AM' },
      { type: 'received', text: "Last try", time: '9:05 AM' },
      { type: 'received', text: "WIPRO MEIN SELECT! 3 saal baad! 😭🎉", time: '5:00 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Uber interview tomorrow. Nervous!", time: '11:00 PM' },
      { type: 'sent', text: "Uber loves problem solvers. AI will help you shine!", time: '11:01 PM' },
      { type: 'received', text: "System design round?", time: '11:02 PM' },
      { type: 'sent', text: "AI suggests scalable architectures with trade-offs!", time: '11:03 PM' },
      { type: 'received', text: "Perfect! Getting it", time: '11:05 PM' },
      { type: 'received', text: "UBER SDE! System design was my best round! 🚗", time: '6:30 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Swiggy interview. Food delivery domain?", time: '2:00 PM' },
      { type: 'sent', text: "AI knows all domains! E-commerce, logistics, everything!", time: '2:01 PM' },
      { type: 'received', text: "Is screen share really invisible?", time: '2:02 PM' },
      { type: 'sent', text: "100%! No one has ever been detected!", time: '2:03 PM' },
      { type: 'received', text: "Okay buying now", time: '2:05 PM' },
      { type: 'received', text: "SWIGGY OFFER! They didn't suspect anything! 😄", time: '7:00 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Razorpay fintech interview", time: '8:30 AM' },
      { type: 'sent', text: "Perfect! AI handles payments, APIs, security questions!", time: '8:31 AM' },
      { type: 'received', text: "4 technical rounds 😰", time: '8:32 AM' },
      { type: 'sent', text: "Day pass covers all! AI adapts to each round!", time: '8:33 AM' },
      { type: 'received', text: "Let's go!", time: '8:35 AM' },
      { type: 'received', text: "RAZORPAY! All 4 rounds cleared! Worth every rupee! 💰", time: '8:00 PM' },
    ]
  },
  {
    messages: [
      { type: 'received', text: "Dream11 sports tech interview", time: '10:00 AM' },
      { type: 'sent', text: "AI handles gaming, real-time systems, scaling!", time: '10:01 AM' },
      { type: 'received', text: "Only 2 days to prepare", time: '10:02 AM' },
      { type: 'sent', text: "HelplyAI = instant preparation! Just focus on delivery!", time: '10:03 AM' },
      { type: 'received', text: "Magic tool!", time: '10:05 AM' },
      { type: 'received', text: "DREAM11! Cracked in 2 days prep! 🏏", time: '5:30 PM' },
    ]
  },
];

const WhatsAppChat: React.FC<{ messages: { type: string; text: string; time: string }[]; index: number }> = ({ messages, index }) => (
  <div style={{
    background: '#fff',
    borderRadius: 16,
    minWidth: 320,
    maxWidth: 320,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    flexShrink: 0,
    overflow: 'hidden',
  }}>
    {/* WhatsApp Header */}
    <div style={{
      background: '#075E54',
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: `linear-gradient(135deg, hsl(${(index * 47) % 360}, 70%, 60%) 0%, hsl(${(index * 47 + 40) % 360}, 70%, 50%) 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'blur(3px)',
      }}>
        <span style={{ filter: 'blur(0)', fontSize: 16 }}>👤</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, filter: 'blur(4px)', letterSpacing: 1 }}>████████</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>online</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
        <circle cx="12" cy="5" r="2"/>
        <circle cx="12" cy="12" r="2"/>
        <circle cx="12" cy="19" r="2"/>
      </svg>
    </div>
    {/* Chat Messages */}
    <div style={{
      background: '#ECE5DD',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      padding: '10px 8px',
      minHeight: 240,
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
    }}>
      {messages.map((msg, j) => (
        <div key={j} style={{
          alignSelf: msg.type === 'sent' ? 'flex-start' : 'flex-end',
          maxWidth: '88%',
        }}>
          <div style={{
            background: msg.type === 'sent' ? '#fff' : '#DCF8C6',
            borderRadius: msg.type === 'sent' ? '0 10px 10px 10px' : '10px 0 10px 10px',
            padding: '6px 8px',
            boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
          }}>
            <div style={{ fontSize: 12, color: '#303030', lineHeight: 1.35 }}>
              {msg.text}
            </div>
            <div style={{ 
              fontSize: 9, 
              color: '#667781', 
              textAlign: 'right', 
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 2,
            }}>
              {msg.time}
              {msg.type === 'received' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#53bdeb">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Input Bar */}
    <div style={{
      background: '#f0f0f0',
      padding: '6px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#54656f">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
      <div style={{
        flex: 1,
        background: '#fff',
        borderRadius: 18,
        padding: '6px 12px',
        fontSize: 12,
        color: '#667781',
      }}>
        Type a message
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#54656f">
        <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
      </svg>
    </div>
  </div>
);

export default function WhatsAppTestimonials() {
  const allConversations = [...conversations, ...conversations];

  return (
    <section style={{
      padding: '60px 0',
      background: 'linear-gradient(135deg, #075E54 0%, #128C7E 50%, #25D366 100%)',
      overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 24px' }}>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 900,
          color: '#fff',
          marginBottom: 12,
        }}>
          💬 What Our Users Say
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 500 }}>
          Real conversations from candidates who cracked their interviews with HelplyAI
        </p>
      </div>

      <style>{`
        @keyframes scrollTestimonials {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .whatsapp-scroll {
          animation: scrollTestimonials 120s linear infinite;
        }
        .whatsapp-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Row 1 */}
      <div style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div className="whatsapp-scroll" style={{ display: 'flex', gap: 20, width: 'max-content' }}>
          {allConversations.slice(0, 16).map((chat, i) => (
            <WhatsAppChat key={i} messages={chat.messages} index={i} />
          ))}
        </div>
      </div>

      {/* Row 2 */}
      <div style={{ overflow: 'hidden' }}>
        <div className="whatsapp-scroll" style={{ display: 'flex', gap: 20, width: 'max-content', animationDirection: 'reverse' }}>
          {allConversations.slice(8, 24).map((chat, i) => (
            <WhatsAppChat key={i} messages={chat.messages} index={i + 8} />
          ))}
        </div>
      </div>
    </section>
  );
}
