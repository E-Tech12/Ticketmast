import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import axios from 'axios';

interface TransferData {
  valid: boolean;
  ticketId: string;
  eventName: string;
  venue: string;
  city: string;
  state: string;
  eventDate: string;
  eventTime: string;
  eventImage: string;
  section: string;
  row: string;
  seat: string;
  ticketType: string;
  orderId: string;
  token: string;
  error?: string;
}

type PageState = 'loading' | 'confirm' | 'accepted' | 'ticket' | 'error';

const formatDate = (d: string) => {
  if (!d) return '';
  try {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch { return d; }
};

const formatTime = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

// ── Shared header ──────────────────────────────────
const TmHeader: React.FC = () => (
  <div style={{
    background: '#026CDF', padding: '13px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <span style={{ color: '#fff', fontSize: 16, fontWeight: 900, letterSpacing: -0.3 }}>
      ticketmaster
    </span>
    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      Ticket Transfer
    </span>
  </div>
);

// ── Spinner ────────────────────────────────────────
const Spinner: React.FC = () => (
  <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
    <TmHeader />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '2.5px solid #e0e0e0', borderTopColor: '#026CDF', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Loading transfer…</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const AcceptTransfer: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [page, setPage] = useState<PageState>('loading');
  const [data, setData] = useState<TransferData | null>(null);
  const [accepting, setAccepting] = useState(false);

  // ── Fetch transfer info ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/accept-transfer/${token}`);
        setData(res.data);
        setPage('confirm');
      } catch (err: any) {
        // backend offline → try local storage fallback
        const stored = localStorage.getItem('ticketvault-storage');
        if (stored) {
          try {
            const state = JSON.parse(stored);
            const orders = state?.state?.orders || [];
            for (const order of orders) {
              for (const t of order.tickets) {
                if (t.verificationToken === token) {
                  setData({
                    valid: true,
                    ticketId:   t.ticketId,
                    eventName:  t.eventName,
                    venue:      t.venue,
                    city:       t.city,
                    state:      t.state,
                    eventDate:  t.eventDate,
                    eventTime:  t.eventTime,
                    eventImage: t.eventImage,
                    section:    t.section,
                    row:        t.row,
                    seat:       t.seat,
                    ticketType: t.ticketType,
                    orderId:    t.orderId,
                    token:      token || '',
                  });
                  setPage('confirm');
                  return;
                }
              }
            }
          } catch {}
        }
        setPage('error');
      }
    };
    if (token) load();
    else setPage('error');
  }, [token]);

  // ── Generate QR once on ticket view ──
  useEffect(() => {
    if (page === 'ticket' && data && canvasRef.current) {
      const verifyUrl = `${window.location.origin}/verify/${data.token}`;
      QRCode.toCanvas(canvasRef.current, verifyUrl, {
        width: 180,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
    }
  }, [page, data]);

  const handleAccept = async () => {
    setAccepting(true);
    // Just transition — backend already marked it transferred on send
    await new Promise(r => setTimeout(r, 700));
    setAccepting(false);
    setPage('accepted');
  };

  if (page === 'loading') return <Spinner />;

  if (page === 'error') return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TmHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>Transfer Not Found</p>
        <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.6 }}>
          This transfer link may have expired or already been accepted.
        </p>
      </div>
    </div>
  );

  if (!data) return <Spinner />;

  // ── CONFIRM PAGE ──────────────────────────────────
  if (page === 'confirm') return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TmHeader />

      {/* Event image */}
      {data.eventImage && (
        <div style={{ width: '100%', maxHeight: 220, overflow: 'hidden', lineHeight: 0 }}>
          <img
            src={data.eventImage}
            alt={data.eventName}
            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <div style={{ flex: 1, padding: '24px 20px 32px', maxWidth: 540, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Message */}
        <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
          You've received a ticket
        </p>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 24px', lineHeight: 1.5 }}>
          Review the details below and accept to add this ticket to your account.
        </p>

        {/* Details table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #eeeeee' }}>
          {[
            ['Event',        data.eventName],
            ['Date',         formatDate(data.eventDate)],
            ['Time',         formatTime(data.eventTime)],
            ['Venue',        [data.venue, data.city, data.state].filter(Boolean).join(', ')],
            ['Section',      data.section],
            ['Row',          data.row],
            ['Seat',         data.seat],
            ['Order Number', data.orderId],
          ].filter(([, v]) => v).map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid #eeeeee' }}>
              <td style={{ padding: '10px 0', verticalAlign: 'top', width: '38%' }}>
                <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{label}</span>
              </td>
              <td style={{ padding: '10px 0 10px 12px', verticalAlign: 'top' }}>
                <span style={{ fontSize: 13, color: '#222', fontWeight: 600 }}>{value}</span>
              </td>
            </tr>
          ))}
        </table>

        {/* Notice */}
        <p style={{ fontSize: 12, color: '#aaa', margin: '16px 0 24px', lineHeight: 1.5 }}>
          By accepting, this ticket will be added to your Ticketmaster account.
          The original sender will no longer have access to this ticket.
        </p>

        {/* Accept button */}
        <button
          onClick={handleAccept}
          disabled={accepting}
          style={{
            width: '100%', background: '#026CDF', color: '#fff', border: 'none',
            borderRadius: 4, padding: '14px', fontSize: 15, fontWeight: 700,
            cursor: accepting ? 'not-allowed' : 'pointer',
            opacity: accepting ? 0.75 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {accepting ? (
            <>
              <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Accepting…
            </>
          ) : 'Accept Ticket'}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── ACCEPTED PAGE ─────────────────────────────────
  if (page === 'accepted') return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TmHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Check */}
        <div style={{ width: 60, height: 60, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>

        <p style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 6px' }}>
          Ticket Transfer Accepted
        </p>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 28px', lineHeight: 1.6 }}>
          {data.eventName}
        </p>

        {/* Seat summary */}
        <div style={{ width: '100%', background: '#f8f8f8', borderRadius: 8, padding: '16px', marginBottom: 28, border: '1px solid #eee' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
            {[['Section', data.section], ['Row', data.row], ['Seat', data.seat]].map(([label, value], i) => (
              <div key={label} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid #e5e5e5' : 'none', padding: '4px 0' }}>
                <p style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#999', margin: '0 0 24px', lineHeight: 1.5 }}>
          The ticket has been added to your account.
        </p>

        <button
          onClick={() => setPage('ticket')}
          style={{ width: '100%', background: '#026CDF', color: '#fff', border: 'none', borderRadius: 4, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          View Ticket
        </button>
      </div>
    </div>
  );

  // ── TICKET VIEW PAGE ──────────────────────────────
  if (page === 'ticket') return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TmHeader />

      {/* Event hero */}
      <div style={{ position: 'relative' }}>
        {data.eventImage ? (
          <img
            src={data.eventImage}
            alt={data.eventName}
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={{ height: 120, background: '#026CDF' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.65) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px 12px' }}>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.2, margin: 0 }}>{data.eventName}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '3px 0 0' }}>
            {data.venue}{data.city ? `, ${data.city}` : ''}
          </p>
        </div>
      </div>

      {/* Blue date strip */}
      <div style={{ background: '#026CDF', padding: '9px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Date</p>
          <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '2px 0 0' }}>{formatDate(data.eventDate)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Time</p>
          <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '2px 0 0' }}>{formatTime(data.eventTime) || 'TBD'}</p>
        </div>
      </div>

      {/* Ticket card */}
      <div style={{ margin: '14px 14px 0', border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>

        {/* Sec / Row / Seat */}
        <div style={{ background: '#f7f7f7', padding: '14px 12px 12px', borderBottom: '1.5px dashed #ddd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[['SECTION', data.section], ['ROW', data.row], ['SEAT', data.seat]].map(([label, value], i) => (
              <div key={label} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid #e0e0e0' : 'none' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 3px' }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#111', lineHeight: 1, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Type + entry */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 11, color: '#888' }}>{data.ticketType}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#026CDF' }}>Mobile Entry</span>
        </div>

        {/* QR code */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 12px 10px' }}>
          <canvas ref={canvasRef} style={{ borderRadius: 6, maxWidth: '100%' }} />
          <p style={{ fontSize: 10, color: '#bbb', margin: '6px 0 0', fontWeight: 600, letterSpacing: 0.3 }}>Scan to verify</p>
        </div>

        {/* Ticket ID */}
        <div style={{ textAlign: 'center', padding: '0 12px 14px' }}>
          <p style={{ fontSize: 9, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Ticket ID</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#666', fontFamily: 'monospace', margin: '3px 0 0' }}>{data.ticketId}</p>
        </div>
      </div>

      {/* Order info */}
      <div style={{ margin: '10px 14px 32px', background: '#f8f8f8', borderRadius: 8, padding: '12px 14px', border: '1px solid #efefef' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 8px' }}>
          {[['Order #', data.orderId], ['Status', 'Active']].map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>{label}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: label === 'Status' ? '#059669' : '#444', margin: '3px 0 0' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
};
