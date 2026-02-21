import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const languages = [
  'English', 'French (Francais)', 'German (Deutsch)', 'Spanish (Espanol)',
  'Portuguese (Portugues)', 'Italian (Italiano)', 'Hindi (हिन्दी)',
  'Japanese (日本語)', 'Korean (한국어)', 'Mandarin (普通话)',
  'Arabic (العربية)', 'Bengali (বাংলা)', 'Russian (Русский)',
  'Dutch (Nederlands)', 'Polish (Polski)', 'Tamil (தமிழ்)',
];

export default function LanguagePage() {
  const { user } = useAuth();
  const [inputLang, setInputLang] = useState('English');
  const [outputLang, setOutputLang] = useState('English');
  const [autoDetect, setAutoDetect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('language_settings')
      .select('*')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setInputLang(data.input_language);
      setOutputLang(data.output_language);
      setAutoDetect(data.auto_detect);
    }
    setLoading(false);
  };

  const handleSave = async (field: string, value: string | boolean) => {
    const update: Record<string, string | boolean> = { [field]: value, updated_at: new Date().toISOString() };
    await supabase.from('language_settings').update(update).eq('user_id', user!.id);
    setMsg('Settings saved.');
    setTimeout(() => setMsg(''), 2000);
  };

  if (loading) return <div style={{ color: '#6b7280', padding: 40 }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Language</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px' }}>Select the language you want to use for your interactions.</p>

      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 20,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          color: '#4ade80', fontSize: 13,
        }}>{msg}</div>
      )}

      {/* Transcription Language */}
      <div style={{
        marginBottom: 20, padding: 24, borderRadius: 14,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'rgba(37,99,235,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Transcription language</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Select the language you speak in interactions.</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {languages.map(lang => (
            <button key={lang} onClick={() => { setInputLang(lang); handleSave('input_language', lang); }}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13,
                background: inputLang === lang ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                border: inputLang === lang ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: inputLang === lang ? '#60a5fa' : '#9ca3af',
                cursor: 'pointer', transition: 'all 0.15s', fontWeight: inputLang === lang ? 600 : 400,
              }}
            >
              {inputLang === lang && '✓ '}{lang}
            </button>
          ))}
        </div>
      </div>

      {/* Output Language */}
      <div style={{
        marginBottom: 20, padding: 24, borderRadius: 14,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'rgba(124,58,237,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
              <path d="M2 5h7"/><path d="M2 8h7"/><path d="M2 11h4"/>
              <path d="M14 5l4 14"/><path d="M18 5l4 14"/><path d="M15 14h6"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Output language</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Select your preferred language for responses.</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {languages.map(lang => (
            <button key={lang} onClick={() => { setOutputLang(lang); handleSave('output_language', lang); }}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13,
                background: outputLang === lang ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                border: outputLang === lang ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: outputLang === lang ? '#a78bfa' : '#9ca3af',
                cursor: 'pointer', transition: 'all 0.15s', fontWeight: outputLang === lang ? 600 : 400,
              }}
            >
              {outputLang === lang && '✓ '}{lang}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-detect */}
      <div style={{
        padding: 24, borderRadius: 14,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Auto-detect language</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>Automatically detect the language you are speaking.</div>
        </div>
        <button
          onClick={() => { const v = !autoDetect; setAutoDetect(v); handleSave('auto_detect', v); }}
          style={{
            width: 48, height: 26, borderRadius: 13, padding: 3,
            background: autoDetect ? '#2563eb' : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            transition: 'all 0.2s', transform: autoDetect ? 'translateX(22px)' : 'translateX(0)',
          }} />
        </button>
      </div>
    </div>
  );
}
