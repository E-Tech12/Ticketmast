import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const Favorites: React.FC = () => (
  <div className="page-content" style={{ background: '#000' }}>
    <div style={{ background: '#000', padding: '16px', borderBottom: '1px solid #222' }}>
      <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, textAlign: 'center' }}>Favorites</p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', gap: 12 }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.3">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <p style={{ color: '#555', fontSize: 15, fontWeight: 600 }}>No favorites yet</p>
      <p style={{ color: '#333', fontSize: 13, textAlign: 'center' }}>Artists and teams you follow will appear here</p>
    </div>
  </div>
);

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { orders, userId, userName, logout } = useStore();
  const total = orders.reduce((s, o) => s + o.tickets.filter(t => !t.isTransferred).length, 0);

  const handleLogout = () => {
    logout();
  };

  const Row: React.FC<{ icon: string; label: string; sub?: string; onClick?: () => void; danger?: boolean }> = ({ icon, label, sub, onClick, danger }) => (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#111', border: 'none', borderBottom: '1px solid #1e1e1e', cursor: 'pointer', textAlign: 'left' }}
    >
      <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: danger ? '#E31837' : '#fff' }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{sub}</p>}
      </div>
      {!danger && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className="page-content" style={{ background: '#000' }}>
      <div style={{ background: '#000', padding: '16px', borderBottom: '1px solid #1e1e1e' }}>
        <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, textAlign: 'center' }}>My Account</p>
      </div>

      {/* Profile */}
      <div style={{ background: '#026CDF', padding: '22px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>
            {userName ? userName.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{userName || 'User'}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>{userId}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#111', borderBottom: '1px solid #1e1e1e' }}>
        <div style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #1e1e1e' }}>
          <p style={{ color: '#026CDF', fontSize: 26, fontWeight: 900 }}>{orders.length}</p>
          <p style={{ color: '#555', fontSize: 12 }}>Orders</p>
        </div>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#026CDF', fontSize: 26, fontWeight: 900 }}>{total}</p>
          <p style={{ color: '#555', fontSize: 12 }}>Active Tickets</p>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <p style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tickets</p>
        <Row icon="🎫" label="My Tickets" sub={`${total} active tickets`} onClick={() => navigate('/my-tickets')} />
        <Row icon="➕" label="Create Ticket" onClick={() => navigate('/create-ticket')} />
      </div>

      <div style={{ marginTop: 8 }}>
        <p style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 }}>Discover</p>
        <Row icon="🔍" label="Find Events" onClick={() => navigate('/discover')} />
      </div>

      <div style={{ marginTop: 8 }}>
        <p style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 }}>Support</p>
        <Row icon="❓" label="Help Center" />
        <Row icon="📞" label="Contact Us" />
      </div>

      <div style={{ marginTop: 8, marginBottom: 16 }}>
        <p style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 }}>Session</p>
        <Row icon="🚪" label="Sign Out" danger onClick={handleLogout} />
      </div>
    </div>
  );
};

export const VerifyTicket: React.FC = () => {
  const token = window.location.pathname.split('/verify/')[1];
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`/api/verify/${token}`);
        const d = await r.json();
        setResult(d);
      } catch {
        setResult({ valid: false, message: 'Unable to verify at this time.' });
      } finally { setLoading(false); }
    };
    if (token) check();
    else { setResult({ valid: false, message: 'No token provided.' }); setLoading(false); }
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '2px solid #026CDF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#888', fontSize: 14 }}>Verifying ticket…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ background: '#026CDF', padding: '16px 20px' }}>
        <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>ticketmaster</p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>Ticket Verification</p>
      </div>

      <div style={{ padding: '40px 24px', maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
        {result?.valid ? (
          <>
            <div style={{ width: 72, height: 72, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginBottom: 24 }}>VALID TICKET</h1>
            <div style={{ background: '#f8f8f8', borderRadius: 12, overflow: 'hidden', textAlign: 'left' }}>
              <div style={{ background: '#059669', padding: '10px 16px' }}>
                <p style={{ color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ticket Information</p>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Event', result.eventName], ['Ticket ID', result.ticketId], ['Section', result.section], ['Row', result.row], ['Seat', result.seat], ['Status', 'VALID']].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', flexShrink: 0 }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: l === 'Status' ? '#059669' : '#333', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 72, height: 72, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#DC2626', marginBottom: 12 }}>INVALID TICKET</h1>
            <p style={{ color: '#888', fontSize: 14 }}>{result?.message || 'This ticket is not valid or has been transferred.'}</p>
          </>
        )}
      </div>
    </div>
  );
};
