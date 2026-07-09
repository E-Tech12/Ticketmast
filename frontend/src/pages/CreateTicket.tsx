import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { TicketFormData, Order, Ticket } from '../types';
import { TmEvent } from '../types';

const generateOrderId = () => {
  const n1 = Math.floor(Math.random() * 90 + 10);
  const n2 = Math.floor(Math.random() * 90000 + 10000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const s = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${n1}-${n2}/${s}`;
};
const generateTicketId = () => `TKT-${Math.floor(Math.random() * 9000000 + 1000000)}`;
const generateToken = () => Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);

/* ── Shared field component ── */
const Field: React.FC<{
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string; placeholder?: string; hint?: string; required?: boolean;
  half?: boolean;
}> = ({ label, name, value, onChange, type = 'text', placeholder, hint, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#444', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#E31837' }}>*</span>}
    </label>
    <input
      className="form-input-card"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{ display: 'block' }}
    />
    {hint && <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{hint}</p>}
  </div>
);

const SelectField: React.FC<{
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options: string[]; required?: boolean;
}> = ({ label, name, value, onChange, options, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#444', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#E31837' }}>*</span>}
    </label>
    <select
      className="form-input-card"
      name={name}
      value={value}
      onChange={onChange}
      style={{ appearance: 'none', display: 'block' }}
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const SectionDivider: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ textAlign: 'center', padding: '14px 0 10px', borderTop: '1px solid #dce0ed', borderBottom: '1px solid #dce0ed', marginBottom: 16, marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16 }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: '#026CDF', letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</p>
  </div>
);

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addOrder, userId } = useStore();
  const event = location.state?.event as TmEvent | undefined;

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState<TicketFormData>({
    eventName: event?.name || '',
    venue: event?.venue || '',
    city: event?.city || '',
    state: event?.state || '',
    country: 'US',
    address: '',
    zipCode: '',
    eventDate: event?.date ? event.date.split('T')[0] : '',
    eventTime: event?.time || '',
    eventImage: event?.image || '',
    section: '',
    row: '',
    seatNumber: '',
    ticketType: 'Verified Resale Ticket',
    entryInfo: 'Mobile Entry',
    timerHours: '0',
    purchaseDate: today,
    purchaseTime: nowTime,
    price: '',
    numberOfSeats: '1',
  });

  const [tab, setTab] = useState<'original' | 'custom'>('original');
  const [customImage, setCustomImage] = useState('');

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.eventName || !form.venue || !form.section || !form.row || !form.seatNumber) {
      alert('Please fill in all required fields (Event Name, Venue, Section, Row, Seat).');
      return;
    }
    const count = parseInt(form.numberOfSeats) || 1;
    const startSeat = parseInt(form.seatNumber);
    const orderId = generateOrderId();
    const imageToUse = tab === 'custom' && customImage ? customImage : (form.eventImage || '');

    const tickets: Ticket[] = Array.from({ length: count }, (_, i) => ({
      id: generateToken(),
      ticketId: generateTicketId(),
      orderId,
      verificationToken: generateToken(),
      eventName: form.eventName,
      venue: form.venue,
      city: form.city,
      state: form.state,
      country: form.country,
      address: form.address,
      zipCode: form.zipCode,
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      eventImage: imageToUse,
      section: form.section,
      row: form.row,
      seat: isNaN(startSeat) ? form.seatNumber : String(startSeat + i),
      ticketType: form.ticketType,
      entryInfo: form.entryInfo,
      timerHours: parseFloat(form.timerHours) || 0,
      purchaseDate: form.purchaseDate,
      purchaseTime: form.purchaseTime,
      price: parseFloat(form.price) || 0,
      isTransferred: false,
      holderId: userId,
    }));

    const order: Order = {
      orderId,
      eventName: form.eventName,
      eventImage: imageToUse,
      venue: form.venue,
      city: form.city,
      state: form.state,
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      tickets,
      createdAt: new Date().toISOString(),
      holderId: userId,
    };

    addOrder(order);
    navigate('/my-tickets');
  };

  return (
    <div className="page-content" style={{ background: '#eef1f8' }}>
      {/* Header */}
      <div style={{ background: '#eef1f8', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #dce0ed' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#026CDF', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#026CDF" strokeWidth="2.5">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Back
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Event Details</p>
        <button
          onClick={() => navigate('/my-tickets')}
          style={{ width: 30, height: 30, borderRadius: '50%', background: '#ccd0dc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Event image preview + Original / Custom Image toggle */}
      {form.eventImage && (
        <div>
          <img
            src={tab === 'custom' && customImage ? customImage : form.eventImage}
            alt={form.eventName}
            style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/430x180/111/444?text=Event'; }}
          />
          <div style={{ padding: '10px 16px', background: '#eef1f8', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Toggle pills */}
            <div style={{ display: 'flex', background: '#dde1ee', borderRadius: 10, padding: 3, flex: 1 }}>
              {(['original', 'custom'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: tab === t ? '#026CDF' : 'transparent',
                    color: tab === t ? '#fff' : '#888',
                    fontSize: 13, fontWeight: 700,
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {t === 'original' ? 'Original' : 'Custom Image'}
                </button>
              ))}
            </div>
          </div>
          {tab === 'original' && (
            <p style={{ fontSize: 11, color: '#999', padding: '0 16px 8px' }}>Custom: 16:9 ratio, min 640×360</p>
          )}
          {tab === 'custom' && (
            <div style={{ padding: '0 16px 10px' }}>
              <input
                className="form-input-card"
                type="url"
                placeholder="Paste custom image URL..."
                value={customImage}
                onChange={e => setCustomImage(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '16px 16px 0' }}>
        {/* EVENT DETAILS */}
        <SectionDivider title="Event Details" />

        <Field label="Event Name" name="eventName" value={form.eventName} onChange={handle} required placeholder="e.g. Ariana Grande – The Eternal Sunshine Tour" />
        <Field label="Venue" name="venue" value={form.venue} onChange={handle} required placeholder="e.g. United Center" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="City" name="city" value={form.city} onChange={handle} placeholder="Chicago" />
          <Field label="State" name="state" value={form.state} onChange={handle} placeholder="Illinois" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="Country" name="country" value={form.country} onChange={handle} required placeholder="US" hint="2-letter code e.g. US" />
          <Field label="Event Date" name="eventDate" value={form.eventDate} onChange={handle} type="date" required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="Event Time" name="eventTime" value={form.eventTime} onChange={handle} type="time" required hint="HH:MM:SS · 24-hour" />
          <Field label="End Date" name="endDate" value="" onChange={() => {}} placeholder="NA" hint="NA or YYYY-MM-DD" />
        </div>

        <Field label="Address" name="address" value={form.address} onChange={handle} placeholder="e.g. 1901 W Madison" />
        <Field label="Zip Code" name="zipCode" value={form.zipCode} onChange={handle} placeholder="e.g. 60612" />

        {!form.eventImage && (
          <Field label="Event Image URL" name="eventImage" value={form.eventImage} onChange={handle} type="url" placeholder="https://..." />
        )}

        {/* TICKET DETAILS */}
        <SectionDivider title="Ticket Details" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="Section" name="section" value={form.section} onChange={handle} required placeholder="e.g. Floor A" />
          <Field label="Row" name="row" value={form.row} onChange={handle} required placeholder="e.g. 12" />
        </div>

        <SelectField
          label="Ticket Type"
          name="ticketType"
          value={form.ticketType}
          onChange={handle}
          required
          options={['Verified Resale Ticket', 'General Admission', 'VIP', 'Floor', 'Balcony', 'Reserved Seating', 'Standing', 'Premium', 'Early Entry', 'Verified Fan Onsale']}
        />

        <Field label="Entry Info" name="entryInfo" value={form.entryInfo} onChange={handle} required placeholder="e.g. Gate 1, Verizon Gate" />

        <Field
          label="Timer (Hours)"
          name="timerHours"
          value={form.timerHours}
          onChange={handle}
          type="number"
          placeholder="0"
          hint="0 disables the countdown"
        />

        {/* PURCHASE INFO */}
        <SectionDivider title="Purchase Info" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="Purchase Date" name="purchaseDate" value={form.purchaseDate} onChange={handle} required hint="mm-dd-yyyy" />
          <Field label="Purchase Time" name="purchaseTime" value={form.purchaseTime} onChange={handle} required hint="HH:MM · 24-hour" />
        </div>

        <Field label="Price" name="price" value={form.price} onChange={handle} type="number" required placeholder="250" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="Seat No." name="seatNumber" value={form.seatNumber} onChange={handle} required placeholder="10" hint="Numbers only" />
          <Field label="No. of Seats" name="numberOfSeats" value={form.numberOfSeats} onChange={handle} type="number" required placeholder="3" hint="Min 1 · Max 8" />
        </div>

        {/* Seat preview */}
        {parseInt(form.numberOfSeats) > 1 && form.seatNumber && (
          <div style={{ background: '#e0e8f8', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <p style={{ width: '100%', fontSize: 11, fontWeight: 700, color: '#026CDF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>Seats that will be created</p>
            {Array.from({ length: Math.min(parseInt(form.numberOfSeats) || 0, 8) }, (_, i) => {
              const start = parseInt(form.seatNumber);
              return (
                <span key={i} style={{ background: '#026CDF', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                  Seat {isNaN(start) ? form.seatNumber : start + i}
                </span>
              );
            })}
          </div>
        )}

        {/* Create button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
