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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#000000', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>History</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '8px 0 0' }}>All your interactions and generated content</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClearAll}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: '#fee2e2', border: '2px solid #fca5a5',
              color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
          >Clear All</button>
        )}
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search history..."
          style={{
            flex: 1, padding: '14px 16px', borderRadius: 10,
            background: '#ffffff', border: '2px solid #e5e7eb',
            color: '#000000', fontSize: 14, outline: 'none', fontWeight: 500,
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {filterOptions.map(opt => (
            <button key={opt.value} onClick={() => setFilterType(opt.value)}
              style={{
                padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: filterType === opt.value ? '#2563eb' : '#f3f4f6',
                border: 'none',
                color: filterType === opt.value ? '#ffffff' : '#6b7280', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* History List - Scrollable */}
      <div style={{
        borderRadius: 12, background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        maxHeight: 'calc(100vh - 320px)',
        overflowY: 'auto',
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
              padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div style={{ color: '#000000', fontSize: 14, marginBottom: 6, fontWeight: 500 }}>
                    {item.query ? (item.query.length > 100 ? item.query.slice(0, 100) + '...' : item.query) : 'Screen Analysis'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: item.type === 'chat' ? '#dbeafe' : item.type === 'interview' ? '#d1fae5' : '#ede9fe',
                      color: item.type === 'chat' ? '#1e40af' : item.type === 'interview' ? '#065f46' : '#5b21b6',
                    }}>{item.type.replace('_', ' ')}</span>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: '#ffffff', border: '2px solid #e5e7eb',
                    color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#ffffff'; }}
                >Delete</button>
              </div>
              {expandedId === item.id && item.response && (
                <div style={{
                  marginTop: 16, padding: 20, borderRadius: 10,
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  color: '#374151', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontWeight: 400,
                  maxHeight: 400, overflowY: 'auto',
                }}>{item.response}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
