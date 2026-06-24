import React, { useState } from 'react';
import { useStore } from '../store';

const ACCESS_KEY = 'Ticket1122';

export const Login: React.FC = () => {
  const { login } = useStore();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!key.trim()) { setError('Please enter your access key.'); return; }
    if (key !== ACCESS_KEY) { setError('Incorrect access key. Please try again.'); return; }

    setLoading(true);
    setError('');
    // Small delay for feel
    setTimeout(() => {
      login(name.trim());
      setLoading(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="login-shell">
      {/* Logo */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <p style={{ color: '#fff', fontSize: 32, fontWeight: 900, letterSpacing: -1, margin: 0 }}>
          ticket<span style={{ color: '#026CDF' }}>master</span>
        </p>
        <p style={{ color: '#555', fontSize: 13, marginTop: 6, letterSpacing: 0.3 }}>
          Ticket Management Platform
        </p>
      </div>

      {/* Card */}
      <div className="login-card">
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 4, textAlign: 'center' }}>
          Sign In
        </h1>
        <p style={{ color: '#555', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>
          Enter your name and access key to continue
        </p>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
            Your Name
          </label>
          <input
            className="login-input"
            type="text"
            placeholder="e.g. John Smith"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            autoComplete="name"
            autoFocus
          />
        </div>

        {/* Access Key */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
            Access Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="login-input"
              type={showKey ? 'text' : 'password'}
              placeholder="Enter access key"
              value={key}
              onChange={e => { setKey(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4,
              }}
            >
              {showKey ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#1a0000', border: '1px solid #5a0000', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          className="login-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Signing in…
            </span>
          ) : 'Sign In'}
        </button>

        <p style={{ color: '#333', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          Contact your administrator if you don't have an access key.
        </p>
      </div>

      {/* Bottom branding */}
      <p style={{ color: '#2a2a2a', fontSize: 11, marginTop: 32, textAlign: 'center' }}>
        © {new Date().getFullYear()} Ticketmaster. All rights reserved.
      </p>
    </div>
  );
};
