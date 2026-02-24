import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    // Read from central users table first
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, username, display_name, avatar_url, bio, phone, location, website, timezone')
      .eq('id', user!.id)
      .single();
    if (userData) {
      setFullName(userData.full_name || '');
      setUsername(userData.username || '');
      setDisplayName(userData.display_name || '');
      setAvatarUrl(userData.avatar_url || '');
      setBio(userData.bio || '');
      setPhone(userData.phone || '');
      setLocation(userData.location || '');
      setWebsite(userData.website || '');
      setTimezone(userData.timezone || 'UTC');
      return;
    }
    // Fallback to profiles table if users table not yet populated
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username, display_name, avatar_url, bio, phone, location, website, timezone')
      .eq('id', user!.id)
      .single();
    if (data) {
      setFullName(data.full_name || '');
      setUsername(data.username || '');
      setDisplayName(data.display_name || '');
      setAvatarUrl(data.avatar_url || '');
      setBio(data.bio || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
      setWebsite(data.website || '');
      setTimezone(data.timezone || 'UTC');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const updateData: Record<string, any> = {
      full_name: fullName,
      display_name: displayName,
      bio,
      phone,
      location,
      website,
      timezone,
      updated_at: new Date().toISOString(),
    };
    if (username.trim()) {
      updateData.username = username.trim().toLowerCase();
    }
    // Write to central users table
    const { error: usersError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user!.id);
    // Also sync to profiles table
    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user!.id);
    if (usersError) {
      if (usersError.message.includes('unique') || usersError.message.includes('duplicate')) {
        showMessage('Username is already taken. Please choose another.', 'error');
      } else {
        showMessage(usersError.message, 'error');
      }
    } else {
      showMessage('Profile updated successfully.', 'success');
    }
    setLoading(false);
  };

  const checkUsername = async (value: string) => {
    setUsername(value);
    if (!value.trim() || value.trim().length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const { data } = await supabase.rpc('check_username_available', { desired_username: value.trim().toLowerCase() });
    setUsernameAvailable(data ?? null);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      showMessage('Password must be at least 8 characters.', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) showMessage(error.message, 'error');
    else { showMessage('Password updated successfully.', 'success'); setNewPassword(''); }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { showMessage(uploadError.message, 'error'); setLoading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id);
    setAvatarUrl(publicUrl);
    showMessage('Avatar updated.', 'success');
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/settings');
  };

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await deleteAccount();
    if (error) showMessage(error || 'Failed to delete account.', 'error');
    else navigate('/settings');
    setLoading(false);
  };

  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : (user?.email?.[0]?.toUpperCase() || 'U');

  return (
    <div>
      <h1 style={{ color: '#000000', fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Profile</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 32px' }}>Manage your account settings</p>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 24,
          background: msgType === 'success' ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${msgType === 'success' ? '#86efac' : '#fca5a5'}`,
          color: msgType === 'success' ? '#065f46' : '#991b1b', fontSize: 14, fontWeight: 500,
        }}>{msg}</div>
      )}

      {/* Account Email */}
      <Section title="Account Email" subtitle="Your email cannot be changed. Contact support if you need assistance.">
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: '#f9fafb', border: '1px solid #e5e7eb',
          color: '#6b7280', fontSize: 14, fontWeight: 500,
        }}>{user?.email}</div>
      </Section>

      {/* Username */}
      <Section title="Username" subtitle="Choose a unique username. Lowercase letters, numbers, and underscores only.">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}>@</span>
            <input
              value={username} onChange={e => checkUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="username"
              style={{
                width: '100%', padding: '14px 16px 14px 36px', borderRadius: 10,
                background: '#ffffff',
                border: `2px solid ${usernameAvailable === true ? '#86efac' : usernameAvailable === false ? '#fca5a5' : '#e5e7eb'}`,
                color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
              }}
            />
          </div>
          {usernameAvailable !== null && (
            <span style={{ fontSize: 13, fontWeight: 600, color: usernameAvailable ? '#059669' : '#dc2626', whiteSpace: 'nowrap' }}>
              {usernameAvailable ? '✓ Available' : '✗ Taken'}
            </span>
          )}
        </div>
      </Section>

      {/* Full Name & Display Name */}
      <Section title="Name">
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Full name"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
            }}
          />
          <input
            value={displayName} onChange={e => setDisplayName(e.target.value)}
            placeholder="Display name (shown publicly)"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
            }}
          />
        </div>
      </Section>

      {/* Avatar */}
      <Section title="Avatar" subtitle="Click on the avatar to upload a custom one from your files.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 22, fontWeight: 700,
              }}>{initials}</div>
            )}
          </label>
          <div>
            <div style={{ color: '#000000', fontSize: 14, fontWeight: 600 }}>{fullName || 'No name set'}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Click avatar to change</div>
          </div>
        </div>
      </Section>

      {/* Bio */}
      <Section title="Bio" subtitle="Tell us a little about yourself.">
        <textarea
          value={bio} onChange={e => setBio(e.target.value)}
          placeholder="A short bio about yourself..."
          rows={4}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 10, resize: 'vertical',
            background: '#ffffff', border: '2px solid #e5e7eb',
            color: '#000000', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', fontWeight: 500,
          }}
        />
      </Section>

      {/* Contact Details */}
      <Section title="Contact Details">
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Phone number"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
            }}
          />
          <input
            value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Location (e.g. San Francisco, CA)"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            value={website} onChange={e => setWebsite(e.target.value)}
            placeholder="Website (e.g. https://mysite.com)"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
            }}
          />
          <select
            value={timezone} onChange={e => setTimezone(e.target.value)}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500, cursor: 'pointer',
            }}
          >
            {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
              'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
              'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland'].map(tz => (
              <option key={tz} value={tz} style={{ background: '#ffffff' }}>{tz.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </Section>

      {/* Save All Profile */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={handleUpdateProfile} disabled={loading}
          style={{
            padding: '14px 32px', borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.2)', transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)'; }}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.2)'}
        >{loading ? 'Saving...' : 'Save All Changes'}</button>
      </div>

      {/* Password */}
      <Section title="Password & Security" subtitle="Secure your account with a password.">
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            placeholder="New password (min 8 characters)"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              background: '#ffffff', border: '2px solid #e5e7eb',
              color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
            }}
          />
          <button onClick={handleUpdatePassword} disabled={loading}
            style={{
              padding: '14px 24px', borderRadius: 10,
              background: '#2563eb', border: 'none',
              color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >Update</button>
        </div>
      </Section>

      {/* Sign Out */}
      <Section title="Session">
        <button onClick={handleSignOut}
          style={{
            padding: '14px 28px', borderRadius: 10,
            background: '#ffffff', border: '2px solid #e5e7eb',
            color: '#000000', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          Sign out
        </button>
      </Section>

      {/* Delete Account */}
      <Section title="Delete Account" subtitle="Delete your account and all associated data. This action cannot be undone.">
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '14px 28px', borderRadius: 10,
              background: '#fee2e2', border: '2px solid #fca5a5',
              color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
          >Delete my account</button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 600 }}>Are you sure? This cannot be undone.</span>
            <button onClick={handleDelete} disabled={loading}
              style={{
                padding: '12px 24px', borderRadius: 10,
                background: '#dc2626', border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              }}
            >Yes, delete</button>
            <button onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '12px 24px', borderRadius: 10,
                background: '#ffffff', border: '2px solid #e5e7eb',
                color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 24, padding: 28, borderRadius: 12,
      background: '#ffffff', border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <h3 style={{ color: '#000000', fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
      {subtitle && <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 0', lineHeight: 1.5 }}>{subtitle}</p>}
      <div style={{ marginTop: 20 }}>{children}</div>
    </div>
  );
}
