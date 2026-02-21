import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface HistoryItem {
  id: string;
  type: string;
  mode: string;
  query: string;
  response: string;
  created_at: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setItems(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('history').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all history?')) return;
    await supabase.from('history').delete().eq('user_id', user!.id);
    setItems([]);
  };

  const filtered = items.filter(item => {
    const matchType = filterType === 'all' || item.type === filterType;
    const matchSearch = !search || item.query?.toLowerCase().includes(search.toLowerCase()) || item.response?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'chat', label: 'Chat' },
    { value: 'screen_analysis', label: 'Screen' },
    { value: 'interview', label: 'Interview' },
    { value: 'generation', label: 'Generated' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>History</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '6px 0 0' }}>All your interactions and generated content</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClearAll}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >Clear All</button>
        )}
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search history..."
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 14, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {filterOptions.map(opt => (
            <button key={opt.value} onClick={() => setFilterType(opt.value)}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                background: filterType === opt.value ? 'rgba(37,99,235,0.2)' : 'transparent',
                border: filterType === opt.value ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: filterType === opt.value ? '#60a5fa' : '#9ca3af', cursor: 'pointer',
              }}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div style={{
        borderRadius: 14, background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
            {search ? 'No results found.' : 'No history yet.'}
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} style={{
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div style={{ color: '#e5e7eb', fontSize: 14, marginBottom: 4 }}>
                    {item.query ? (item.query.length > 100 ? item.query.slice(0, 100) + '...' : item.query) : 'Screen Analysis'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: item.type === 'chat' ? 'rgba(37,99,235,0.15)' : item.type === 'interview' ? 'rgba(5,150,105,0.15)' : 'rgba(124,58,237,0.15)',
                      color: item.type === 'chat' ? '#60a5fa' : item.type === 'interview' ? '#34d399' : '#a78bfa',
                    }}>{item.type.replace('_', ' ')}</span>
                    <span style={{ color: '#4b5563', fontSize: 11 }}>
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 6,
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#6b7280', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >Delete</button>
              </div>
              {expandedId === item.id && item.response && (
                <div style={{
                  marginTop: 12, padding: 16, borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                  color: '#9ca3af', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  maxHeight: 300, overflowY: 'auto',
                }}>{item.response}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
