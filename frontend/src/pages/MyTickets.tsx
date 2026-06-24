import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Order } from '../types';

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

const TicketStackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="6" width="20" height="14" rx="2"/>
    <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
    <line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>
  </svg>
);

export const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useStore();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const now = new Date();

  const upcoming = orders.filter(o => {
    const hasActive = o.tickets.some(t => !t.isTransferred);
    if (!hasActive) return false;
    try { return new Date(o.eventDate + 'T23:59:59') >= now; }
    catch { return true; }
  });

  const past = orders.filter(o => {
    const hasActive = o.tickets.some(t => !t.isTransferred);
    if (!hasActive) return false;
    try { return new Date(o.eventDate + 'T23:59:59') < now; }
    catch { return false; }
  });

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="page-content" style={{ background: '#000' }}>
      {/* Header — matches "My Events" TM style */}
      <div style={{ background: '#000', padding: '16px 16px 0', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ width: 40 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>My Events</p>
            {/* Flag emoji */}
            <span style={{ fontSize: 18 }}>🇺🇸</span>
          </div>
          <button style={{ color: '#026CDF', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            Help
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          {(['upcoming', 'past'] as const).map(t => {
            const count = t === 'upcoming' ? upcoming.length : past.length;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: active ? '#fff' : '#666',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid #026CDF' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {t.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', gap: 12 }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.2">
            <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/>
          </svg>
          <p style={{ color: '#666', fontSize: 15, fontWeight: 600 }}>No {tab} events</p>
          <p style={{ color: '#444', fontSize: 13, textAlign: 'center' }}>
            {tab === 'upcoming' ? 'Find your next event on Discover' : 'Your past events will show here'}
          </p>
          {tab === 'upcoming' && (
            <button
              onClick={() => navigate('/discover')}
              style={{ marginTop: 8, background: '#026CDF', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Find Events
            </button>
          )}
        </div>
      ) : (
        <div style={{ paddingTop: 8 }}>
          {list.map(order => (
            <OrderCard key={order.orderId} order={order} formatDate={formatEventDate} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard: React.FC<{
  order: Order;
  formatDate: (d: string, t: string) => string;
}> = ({ order, formatDate }) => {
  const navigate = useNavigate();
  const activeCount = order.tickets.filter(t => !t.isTransferred).length;

  return (
    <div
      style={{ margin: '0 12px 16px', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#000' }}
      onClick={() => navigate(`/order/${encodeURIComponent(order.orderId)}`)}
    >
      {/* Image with overlay text */}
      <div style={{ position: 'relative' }}>
        <img
          src={order.eventImage || 'https://placehold.co/430x240/111/444?text=Event'}
          alt={order.eventName}
          style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/430x240/111/444?text=Event'; }}
        />

        {/* Gradient overlay — lower half dark */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)' }} />

        {/* Text overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px 14px' }}>
          {/* Date */}
          <p style={{ color: '#bbb', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 }}>
            {formatDate(order.eventDate, order.eventTime)}
          </p>
          {/* Event name — large bold white uppercase */}
          <p style={{ color: '#fff', fontSize: 24, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 8 }}>
            {order.eventName}
          </p>
          {/* Separator */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', marginBottom: 8 }} />
          {/* Venue + ticket count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: '#ccc', fontSize: 12 }}>
              {order.venue}{order.city ? `, ${order.city}` : ''}{order.state ? `, ${order.state}` : ''}
            </p>
            {/* Ticket stack icon + count — exactly like TM screenshots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ccc' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700 }}>x{activeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
