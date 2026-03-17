import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ReferralPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => { if (user) loadReferralData(); }, [user]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const loadReferralData = async () => {
    const { data: codeData } = await supabase.from('referral_codes').select('code').eq('user_id', user!.id).single();
    if (codeData) {
      setReferralCode(codeData.code);
    } else {
      const newCode = generateCode();
      await supabase.from('referral_codes').insert({ user_id: user!.id, code: newCode });
      setReferralCode(newCode);
    }
    const { data: referralsData } = await supabase.from('referrals').select('*').eq('referrer_id', user!.id).order('created_at', { ascending: false });
    if (referralsData) {
      setReferrals(referralsData);
      setTotalEarned(referralsData.filter(r => r.credits_awarded).reduce((sum, r) => sum + (r.credits_minutes || 0), 0));
    }
    setLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = `https://helplyai.co/?ref=${referralCode}`;

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Loading...</div>;

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎁</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#000', marginBottom: 8 }}>Refer Friends, Earn Free Time</h1>
        <p style={{ color: '#6b7280', fontSize: 15 }}>Share your referral code. When friends sign up, you both get <strong>15 minutes</strong> free!</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 16, padding: 32, marginBottom: 24, color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9, marginBottom: 8 }}>YOUR REFERRAL CODE</div>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 4, marginBottom: 16, fontFamily: 'monospace' }}>{referralCode}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => copyToClipboard(referralCode)} style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
          <button onClick={() => copyToClipboard(shareLink)} style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', border: 'none', color: '#2563eb', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            🔗 Copy Link
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>{referrals.length}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Total Referrals</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{referrals.filter(r => r.status === 'completed').length}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Completed</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#7c3aed' }}>{totalEarned} min</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Time Earned</div>
        </div>
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#000', marginBottom: 16 }}>How it works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>1</div>
            <span style={{ color: '#374151', fontSize: 14 }}>Share your referral code or link with friends</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>2</div>
            <span style={{ color: '#374151', fontSize: 14 }}>Friend signs up using your code</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>3</div>
            <span style={{ color: '#374151', fontSize: 14 }}>You both get 15 minutes of free interview time!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
