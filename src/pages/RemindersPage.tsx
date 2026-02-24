import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Reminder {
  id: string;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  created_at: string;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (user) loadReminders();
  }, [user]);

  const loadReminders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user!.id)
      .order('due_date', { ascending: true });
    if (data) setReminders(data);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setDueDate('');
    setEditId(null); setShowForm(false);
  };

  const handleSave = async () => {
    if (!title || !dueDate) return;
    if (editId) {
      await supabase.from('reminders').update({
        title, description, due_date: new Date(dueDate).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', editId);
    } else {
      await supabase.from('reminders').insert({
        user_id: user!.id, title, description,
        due_date: new Date(dueDate).toISOString(),
      });
    }
    resetForm();
    loadReminders();
  };

  const handleEdit = (r: Reminder) => {
    setEditId(r.id);
    setTitle(r.title);
    setDescription(r.description || '');
    setDueDate(new Date(r.due_date).toISOString().slice(0, 16));
    setShowForm(true);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from('reminders').update({ is_completed: !current }).eq('id', id);
    setReminders(prev => prev.map(r => r.id === id ? { ...r, is_completed: !current } : r));
  };

  const handleDelete = async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const upcoming = reminders.filter(r => !r.is_completed);
  const completed = reminders.filter(r => r.is_completed);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#000000', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Reminders</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '8px 0 0' }}>Create and manage your reminders</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            padding: '12px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.2)', transition: 'all 0.2s',
          }}
        >New Reminder</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          marginBottom: 24, padding: 28, borderRadius: 12,
          background: '#ffffff', border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ color: '#000000', fontSize: 16, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            {editId ? 'Edit Reminder' : 'New Reminder'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
              style={{
                padding: '14px 16px', borderRadius: 10,
                background: '#ffffff', border: '2px solid #e5e7eb',
                color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
              }}
            />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)"
              rows={3}
              style={{
                padding: '14px 16px', borderRadius: 10, resize: 'vertical',
                background: '#ffffff', border: '2px solid #e5e7eb',
                color: '#000000', fontSize: 14, outline: 'none', fontFamily: 'inherit', fontWeight: 500,
              }}
            />
            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}
              style={{
                padding: '14px 16px', borderRadius: 10,
                background: '#ffffff', border: '2px solid #e5e7eb',
                color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500, cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave}
                style={{
                  padding: '12px 28px', borderRadius: 10,
                  background: '#2563eb', border: 'none',
                  color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >{editId ? 'Update' : 'Create'}</button>
              <button onClick={resetForm}
                style={{
                  padding: '12px 28px', borderRadius: 10,
                  background: '#ffffff', border: '2px solid #e5e7eb',
                  color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div style={{
        borderRadius: 12, background: '#ffffff',
        border: '1px solid #e5e7eb', marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ color: '#000000', fontSize: 16, fontWeight: 700, margin: 0 }}>Upcoming ({upcoming.length})</h2>
        </div>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : upcoming.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#6b7280' }}>No upcoming reminders.</div>
        ) : upcoming.map(r => (
          <ReminderItem key={r.id} reminder={r} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div style={{
          borderRadius: 12, background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ color: '#6b7280', fontSize: 16, fontWeight: 700, margin: 0 }}>Completed ({completed.length})</h2>
          </div>
          {completed.map(r => (
            <ReminderItem key={r.id} reminder={r} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReminderItem({ reminder: r, onToggle, onEdit, onDelete }: {
  reminder: Reminder;
  onToggle: (id: string, current: boolean) => void;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
}) {
  const isPast = new Date(r.due_date) < new Date() && !r.is_completed;
  return (
    <div style={{
      padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
      display: 'flex', alignItems: 'center', gap: 16, opacity: r.is_completed ? 0.5 : 1,
    }}>
      <button onClick={() => onToggle(r.id, r.is_completed)}
        style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: r.is_completed ? '#2563eb' : '#ffffff',
          border: r.is_completed ? 'none' : '2px solid #d1d5db',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {r.is_completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#000000', fontSize: 14, fontWeight: 600, textDecoration: r.is_completed ? 'line-through' : 'none' }}>{r.title}</div>
        {r.description && <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{r.description}</div>}
        <div style={{ color: isPast ? '#dc2626' : '#6b7280', fontSize: 12, marginTop: 6, fontWeight: 500 }}>
          {new Date(r.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {isPast && ' (overdue)'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onEdit(r)}
          style={{
            padding: '8px 14px', borderRadius: 8, background: '#ffffff',
            border: '2px solid #e5e7eb', color: '#6b7280',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >Edit</button>
        <button onClick={() => onDelete(r.id)}
          style={{
            padding: '8px 14px', borderRadius: 8, background: '#ffffff',
            border: '2px solid #e5e7eb', color: '#6b7280',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >Delete</button>
      </div>
    </div>
  );
}
