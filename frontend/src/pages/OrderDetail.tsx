import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { TransferModal } from '../components/transfer/TransferModal';
import { Ticket } from '../types';

const formatDate = (d: string) => {
  if (!d) return '';
  try {
    const date = new Date(d + 'T00:00:00');
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const mon = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `${day} • ${mon} ${date.getDate()}, ${date.getFullYear()}`;
  } catch { return d; }
};

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useStore();
  const [showTransfer, setShowTransfer] = useState(false);

  const order = getOrderById(decodeURIComponent(orderId || ''));

  if (!order) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Order not found</p>
        <button onClick={() => navigate('/my-tickets')} style={{ background: '#026CDF', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Back to Tickets
        </button>
      </div>
    );
  }

  const activeTickets = order.tickets.filter(t => !t.isTransferred);
  const transferredTickets = order.tickets.filter(t => t.isTransferred);

  return (
    <div className="page-content" style={{ background: '#fff' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 230 }}>
        <img
          src={order.eventImage || 'https://placehold.co/430x230/111/444?text=Event'}
          alt={order.eventName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/430x230/111/444?text=Event'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px' }}>
          <button
            onClick={() => navigate('/my-tickets')}
            style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 20, padding: '7px 12px', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
              {order.eventName.length > 24 ? order.eventName.slice(0, 24) + '…' : order.eventName}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>{order.venue}{order.city ? `, ${order.city}` : ''}</p>
          </div>
          <button style={{ background: '#026CDF', border: 'none', borderRadius: 20, padding: '7px 14px', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700 }}>
            Help
          </button>
        </div>
      </div>

      {/* White content */}
      <div style={{ background: '#fff', paddingBottom: 130 }}>
        {/* Tickets / Extras tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          <button style={{ flex: 1, padding: '13px 0', fontSize: 14, fontWeight: 700, color: '#111', background: 'none', border: 'none', borderBottom: '2px solid #111', cursor: 'pointer' }}>
            Tickets
          </button>
          <button style={{ flex: 1, padding: '13px 0', fontSize: 14, fontWeight: 600, color: '#aaa', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' }}>
            Extras
          </button>
        </div>

        {/* Order number row */}
        <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 2 }}>Order #{order.orderId}</p>
            <p style={{ fontSize: 12, color: '#999' }}>x{activeTickets.length} Ticket{activeTickets.length !== 1 ? 's' : ''}</p>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginTop: 2 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#555">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>

        {/* Active ticket cards */}
        <div style={{ padding: '0 12px' }}>
          {activeTickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              style={{ background: '#ebebeb', borderRadius: 8, marginBottom: 10, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate(`/ticket/${ticket.ticketId}`)}
            >
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #ddd' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>{ticket.ticketType}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 14px 13px' }}>
                {[['SECTION', ticket.section], ['ROW', ticket.row], ['SEAT', ticket.seat]].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#111', lineHeight: 1 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Transferred tickets */}
          {transferredTickets.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 8 }}>Transferred</p>
              {transferredTickets.map((ticket) => (
                <div key={ticket.ticketId} style={{ background: '#f5f5f5', borderRadius: 8, marginBottom: 10, overflow: 'hidden', opacity: 0.55 }}>
                  <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #e8e8e8' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>{ticket.ticketType} — Transferred</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 14px 13px' }}>
                    {[['SECTION', ticket.section], ['ROW', ticket.row], ['SEAT', ticket.seat]].map(([label, value]) => (
                      <div key={label}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: '#ccc', lineHeight: 1 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Transfer / Sell floating bar */}
      {activeTickets.length > 0 && (
        <div className="transfer-sell-bar">
          <button className="transfer-sell-btn active" onClick={() => setShowTransfer(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#026CDF" strokeWidth="2">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7,7 17,7 17,17"/>
            </svg>
            <span>Transfer</span>
          </button>
          <button className="transfer-sell-btn disabled">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
              <polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            <span style={{ color: '#bbb' }}>Sell</span>
          </button>
        </div>
      )}

      {showTransfer && (
        <TransferModal
          ticket={activeTickets[0]}
          allOrderTickets={activeTickets}
          onClose={() => setShowTransfer(false)}
          onSuccess={() => setShowTransfer(false)}
        />
      )}
    </div>
  );
};
