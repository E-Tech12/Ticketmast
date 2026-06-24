import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import QRCode from 'qrcode';
import { TransferModal } from '../components/transfer/TransferModal';

const formatDate = (d: string) => {
  if (!d) return '';
  try {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return d; }
};

const formatTime = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { getTicketById } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTransfer, setShowTransfer] = useState(false);

  const ticket = getTicketById(ticketId || '');

  useEffect(() => {
    if (ticket && canvasRef.current) {
      const url = `${window.location.origin}/verify/${ticket.verificationToken}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>Ticket not found</p>
        <button onClick={() => navigate('/my-tickets')} style={{ background: '#026CDF', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ background: '#fff' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 200 }}>
        <img
          src={ticket.eventImage || 'https://placehold.co/430x200/111/444?text=Event'}
          alt={ticket.eventName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/430x200/111/444?text=Event'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.65) 100%)' }} />
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: 20, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px 12px' }}>
          <p style={{ color: '#fff', fontSize: 17, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.2, letterSpacing: -0.2 }}>{ticket.eventName}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>{ticket.venue}{ticket.city ? `, ${ticket.city}` : ''}</p>
        </div>
      </div>

      {/* Blue date strip */}
      <div style={{ background: '#026CDF', padding: '9px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</p>
          <p style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{formatDate(ticket.eventDate)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Time</p>
          <p style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{formatTime(ticket.eventTime) || 'TBD'}</p>
        </div>
      </div>

      {/* Ticket card */}
      <div style={{ margin: '14px 12px', background: '#fff', borderRadius: 12, border: '1px solid #e0e0e0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

        {/* Section / Row / Seat — REDUCED font size */}
        <div style={{ background: '#f7f7f7', padding: '14px 12px 12px', borderBottom: '1.5px dashed #ddd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[['SECTION', ticket.section], ['ROW', ticket.row], ['SEAT', ticket.seat]].map(([label, value], i) => (
              <div key={label} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid #e0e0e0' : 'none' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{label}</p>
                {/* Reduced from 30px → clamp 18-22px */}
                <p style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#111', lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket type + entry info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 11, color: '#777' }}>{ticket.ticketType}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#026CDF' }}>{ticket.entryInfo}</span>
        </div>

        {/* QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 12px 10px' }}>
          <canvas ref={canvasRef} style={{ borderRadius: 8, maxWidth: '100%' }} />
          <p style={{ fontSize: 10, color: '#bbb', marginTop: 6, fontWeight: 600, letterSpacing: 0.3 }}>Scan to verify ticket</p>
        </div>

        {/* Ticket ID */}
        <div style={{ textAlign: 'center', padding: '0 12px 14px' }}>
          <p style={{ fontSize: 9, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ticket ID</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#666', fontFamily: 'monospace', marginTop: 2 }}>{ticket.ticketId}</p>
        </div>
      </div>

      {/* Order info grid — reduced font */}
      <div style={{ margin: '0 12px 14px', background: '#f8f8f8', borderRadius: 12, padding: '12px 14px', border: '1px solid #efefef' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 8px' }}>
          {[
            ['Order #', ticket.orderId],
            ['Price', `$${ticket.price.toFixed(2)}`],
            ['Purchase Date', ticket.purchaseDate],
            ['Status', 'Active'],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: label === 'Status' ? '#00843D' : '#444', marginTop: 2 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '0 12px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setShowTransfer(true)}
          style={{ background: 'transparent', color: '#026CDF', border: '1.5px solid #026CDF', borderRadius: 6, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}
        >
          Transfer Ticket
        </button>
        <button style={{ background: '#026CDF', color: '#fff', border: 'none', borderRadius: 6, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
          View Ticket
        </button>
      </div>

      {showTransfer && (
        <TransferModal
          ticket={ticket}
          allOrderTickets={[ticket]}
          onClose={() => setShowTransfer(false)}
          onSuccess={() => setShowTransfer(false)}
        />
      )}
    </div>
  );
};
