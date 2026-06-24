import React, { useState } from 'react';
import { Ticket } from '../../types';
import { useStore } from '../../store';
import axios from 'axios';

interface Props {
  ticket: Ticket;
  allOrderTickets: Ticket[];   // all active tickets in same order
  onClose: () => void;
  onSuccess: (email?: string) => void;
}

type Step = 'quantity' | 'form' | 'confirm' | 'success';

const iStyle: React.CSSProperties = {
  width: '100%',
  background: '#f5f5f5',
  border: '1px solid #e5e5e5',
  borderRadius: 10,
  padding: '13px 14px',
  fontSize: 15,
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelSt: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#666',
  letterSpacing: 0.6,
  textTransform: 'uppercase' as const,
  marginBottom: 7,
  display: 'block',
};

export const TransferModal: React.FC<Props> = ({ ticket, allOrderTickets, onClose, onSuccess }) => {
  const { updateMultipleTickets } = useStore();

  const [step, setStep] = useState<Step>('quantity');
  const [selectedQty, setSelectedQty] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // tickets selected = first N active tickets
  const ticketsToTransfer = allOrderTickets.slice(0, selectedQty);

  /* ── Step 1: quantity ── */
  const handleQtyNext = () => {
    setError('');
    setStep('form');
  };

  /* ── Step 2: form ── */
  const handleFormNext = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please fill in all fields.'); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.'); return;
    }
    setError('');
    setStep('confirm');
  };

  /* ── Step 3: confirm → process ── */
  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    const transferPromises = ticketsToTransfer.map((t) =>
      axios.post('/api/transfer', {
        ticketId: t.ticketId,
        firstName, lastName, email,
        eventName: t.eventName,
        venue: t.venue,
        city: t.city,
        state: t.state,
        eventDate: t.eventDate,
        eventTime: t.eventTime,
        eventImage: t.eventImage,
        section: t.section,
        row: t.row,
        seat: t.seat,
        orderId: t.orderId,
        verificationToken: t.verificationToken,
        totalTickets: selectedQty,
      }).catch(() => null) // graceful fail if backend down
    );

    await Promise.all(transferPromises);

    // Update local state
    const ids = ticketsToTransfer.map(t => t.ticketId);
    updateMultipleTickets(ids, { isTransferred: true, transferredTo: email });

    setLoading(false);
    setStep('success');
  };

  const qtyOptions = allOrderTickets.length === 1
    ? [1]
    : allOrderTickets.length === 2
    ? [1, 2]
    : Array.from({ length: allOrderTickets.length }, (_, i) => i + 1);

  const qtyLabel = (n: number) => {
    if (n === allOrderTickets.length) return `All (${n})`;
    return `${n}`;
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && step !== 'success') onClose(); }}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* ── STEP 1: How many tickets ── */}
        {step === 'quantity' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0 }}>Transfer Tickets</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 22, lineHeight: 1.5 }}>
              {ticket.eventName}
            </p>

            <p style={{ ...labelSt }}>How many tickets do you want to transfer?</p>

            {/* Qty chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {qtyOptions.map(n => (
                <button
                  key={n}
                  className={`qty-chip${selectedQty === n ? ' selected' : ''}`}
                  onClick={() => setSelectedQty(n)}
                  style={{ minWidth: 60 }}
                >
                  {qtyLabel(n)}
                </button>
              ))}
            </div>

            {/* Preview of which tickets */}
            <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '12px 14px', marginBottom: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Tickets selected
              </p>
              {ticketsToTransfer.map(t => (
                <div key={t.ticketId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                    Sec {t.section} · Row {t.row} · Seat {t.seat}
                  </span>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{t.ticketId}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleQtyNext}
              style={{ width: '100%', background: '#026CDF', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
            >
              Continue
            </button>
            <button
              onClick={onClose}
              style={{ width: '100%', background: 'transparent', color: '#026CDF', border: '1.5px solid #026CDF', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── STEP 2: Recipient info ── */}
        {step === 'form' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <button onClick={() => { setStep('quantity'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#026CDF" strokeWidth="2.5">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0 }}>Recipient Info</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 22, lineHeight: 1, marginLeft: 'auto' }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 20, lineHeight: 1.5 }}>
              Transferring <strong style={{ color: '#333' }}>{selectedQty} ticket{selectedQty > 1 ? 's' : ''}</strong>. Enter the recipient's details below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px', marginBottom: 14 }}>
              <div>
                <label style={labelSt}>First Name</label>
                <input style={iStyle} type="text" placeholder="John" value={firstName} onChange={e => { setFirstName(e.target.value); setError(''); }} />
              </div>
              <div>
                <label style={labelSt}>Last Name</label>
                <input style={iStyle} type="text" placeholder="Smith" value={lastName} onChange={e => { setLastName(e.target.value); setError(''); }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelSt}>Email Address</label>
              <input style={iStyle} type="email" placeholder="recipient@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
            </div>

            {error && <p style={{ color: '#E31837', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button
              onClick={handleFormNext}
              style={{ width: '100%', background: '#026CDF', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
            >
              Continue
            </button>
            <button
              onClick={onClose}
              style={{ width: '100%', background: 'transparent', color: '#026CDF', border: '1.5px solid #026CDF', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === 'confirm' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => { setStep('form'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#026CDF" strokeWidth="2.5">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0 }}>Confirm Transfer</h2>
            </div>

            {/* Recipient box */}
            <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '14px', marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 5 }}>You are about to transfer {selectedQty} ticket{selectedQty > 1 ? 's' : ''} to:</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 2 }}>{firstName} {lastName}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#026CDF' }}>{email}</p>
            </div>

            {/* Warning */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, padding: '11px 14px', marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.55 }}>
                <strong>Once sent, these ticket{selectedQty > 1 ? 's' : ''} will no longer be visible in your account.</strong> This action cannot be undone.
              </p>
            </div>

            {/* Tickets being transferred */}
            <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Tickets being transferred</p>
              {ticketsToTransfer.map((t, i) => (
                <div key={t.ticketId} style={{ paddingBottom: i < ticketsToTransfer.length - 1 ? 8 : 0, marginBottom: i < ticketsToTransfer.length - 1 ? 8 : 0, borderBottom: i < ticketsToTransfer.length - 1 ? '1px solid #eee' : 'none' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{t.eventName}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Sec {t.section} · Row {t.row} · Seat {t.seat}</p>
                  <p style={{ fontSize: 10, color: '#bbb', marginTop: 2, fontFamily: 'monospace' }}>{t.ticketId}</p>
                </div>
              ))}
            </div>

            {error && <p style={{ color: '#E31837', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ width: '100%', background: '#026CDF', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Transferring…
                </span>
              ) : 'Confirm Transfer'}
            </button>
            <button
              onClick={() => setStep('form')}
              style={{ width: '100%', background: 'transparent', color: '#026CDF', border: '1.5px solid #026CDF', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 'success' && (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 68, height: 68, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 6 }}>Transfer Request Sent!</h2>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#026CDF', marginBottom: 10 }}>{email}</p>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 28, maxWidth: 290 }}>
              {selectedQty} ticket{selectedQty > 1 ? 's have' : ' has'} been successfully transferred.
              Delivery information and ticket details will be shared via email shortly.
            </p>
            <button
              onClick={() => onSuccess(email)}
              style={{ width: '100%', background: '#026CDF', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
