import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TmEvent } from '../types';
import axios from 'axios';

const categories = ['Music', 'Sport', 'Arts, Theatre, & Comedy', 'Family', 'Festivals'];

const formatEventDate = (d: string, t: string) => {
  if (!d) return '';
  try {
    const date = new Date(d + 'T00:00:00');
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const mon = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const num = date.getDate();
    const year = date.getFullYear();
    let timeStr = '';
    if (t) {
      const [h, m] = t.split(':');
      const hr = parseInt(h);
      timeStr = ` • ${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
    }
    return `${day} • ${mon} ${num}, ${year}${timeStr}`;
  } catch { return d; }
};

export const Discover: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const navigate = useNavigate();
  const { setSelectedEvent } = useStore();
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const r = await axios.get('/api/events/search', { params: { q, size: 20 } });
      setResults(r.data.events || []);
      setSearched(true);
    } catch {
      setResults([]); setSearched(true);
    } finally { setLoading(false); }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; setQuery(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(v), 500);
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat); setQuery(cat); search(cat);
  };

  const selectEvent = (ev: TmEvent) => {
    setSelectedEvent({ name: ev.name, image: ev.image });
    navigate('/create-ticket', { state: { event: ev } });
  };

  return (
    <div className="page-content" style={{ background: '#000' }}>
      {/* Dark header */}
      <div className="discover-header">
        {/* Location / Dates row */}
        <div className="flex gap-0 mb-3" style={{ borderBottom: '1px solid #333' }}>
          <button className="flex items-center gap-1.5 py-2 pr-4 border-r border-gray-700 flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 0.5 }}>LOCATION</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginLeft: 2 }}>All Cities</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" style={{ marginLeft: 2 }}>
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          <button className="flex items-center gap-1.5 py-2 pl-4 flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 0.5 }}>DATES</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginLeft: 2 }}>All Dates</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" style={{ marginLeft: 2 }}>
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div style={{ background: '#1c1c1c', borderRadius: 8, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#aaa', letterSpacing: 1, display: 'block' }}>SEARCH</span>
            <input
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Artist, Event, or Venue"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15, width: '100%', padding: 0, marginTop: 1 }}
            />
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#026CDF" strokeWidth="2.5" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: activeCategory === cat ? '#026CDF' : '#444',
                background: activeCategory === cat ? '#026CDF' : 'transparent',
                color: activeCategory === cat ? '#fff' : '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div style={{ width: 32, height: 32, border: '2px solid #026CDF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#888' }}>
          <p style={{ fontSize: 15 }}>No results for "{query}"</p>
        </div>
      ) : (
        <div style={{ padding: '12px 0' }}>
          {results.map(ev => (
            <EventCard key={ev.id} event={ev} onSelect={selectEvent} />
          ))}
          {!searched && (
            <div className="text-center py-10" style={{ color: '#666' }}>
              <p style={{ fontSize: 13 }}>Search for artists, teams or events above</p>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const EventCard: React.FC<{ event: TmEvent; onSelect: (e: TmEvent) => void }> = ({ event, onSelect }) => (
  <div className="event-ticket-card" onClick={() => onSelect(event)}>
    {/* Image */}
    <div style={{ position: 'relative', height: 220 }}>
      <img
        src={event.image}
        alt={event.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x220/111/555?text=Event'; }}
      />
      {/* Dark gradient overlay — bottom half */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />

      {/* Text overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px 14px' }}>
        <p style={{ color: '#bbb', fontSize: 12, fontWeight: 600, marginBottom: 4, letterSpacing: 0.3 }}>
          {formatEventDate(event.date, event.time)}
        </p>
        <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1.15, textTransform: 'uppercase', marginBottom: 6, letterSpacing: -0.3 }}>
          {event.name}
        </p>
        {/* Thin separator line */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.3)', marginBottom: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: '#ccc', fontSize: 12 }}>{event.venue}{event.city ? `, ${event.city}` : ''}{event.state ? `, ${event.state}` : ''}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(event); }}
            style={{ background: '#026CDF', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            Find tickets
          </button>
        </div>
      </div>
    </div>
  </div>
);
