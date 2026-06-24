# TicketVault v4 — Ticketmaster Clone

## What's new in v4
- **Redesigned transfer email** — clean, minimal, transactional. No emojis, no big cards.
  Subject line: `Eric Adeyemi sent you 3 tickets: Ariana Grande`
  CTA links to `/accept-transfer/:token` (not the QR verify page)
- **Accept Transfer page** — recipient clicks Accept Tickets in email → lands on
  `/accept-transfer/:token`. Shows confirm → accepted → full ticket view with QR code.
- **Login gate** — Name + Access Key (`Ticket1122`)
- **Transfer quantity selector** — 1, 2, or All
- **Fully responsive** — 320px to desktop

---

## Quick Start

### Frontend
```bash
cd frontend
cp .env.example .env          # add VITE_TM_API_KEY
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env          # add keys below
pip install -r requirements.txt
python app.py
```

---

## Login
- **Name:** anything
- **Access Key:** `Ticket1122`

---

## Email (pick one — no app password needed for Option 1)

### Option 1 — Resend (recommended, free)
```
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```
Sign up free at https://resend.com · 100 emails/day

### Option 2 — Gmail SMTP
```
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password
```

Transfer completes even if no email provider is configured.

---

## Environment Variables

### frontend/.env
```
VITE_TM_API_KEY=your_ticketmaster_api_key
```

### backend/.env
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticketvault
SECRET_KEY=change-me
TM_API_KEY=your_ticketmaster_api_key
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
FROM_NAME=Ticketmaster
APP_URL=http://localhost:5173
```

---

## Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Login | Login page |
| `/discover` | Yes | Search events |
| `/my-tickets` | Yes | My Events — UPCOMING/PAST |
| `/order/:id` | Yes | Order detail + Transfer/Sell bar |
| `/ticket/:id` | Yes | Ticket detail with QR |
| `/create-ticket` | Yes | Ticket generation form |
| `/account` | Yes | Profile + sign out |
| `/accept-transfer/:token` | No | Email CTA landing page |
| `/verify/:token` | No | QR scan verification |

---

## Transfer Flow (end to end)
1. Open order → tap Transfer
2. Choose quantity (1, 2, All)
3. Enter recipient name + email
4. Confirm
5. Backend sends email: `[Sender] sent you [N] tickets: [Event]`
6. Recipient clicks **Accept Tickets** in email
7. Lands on `/accept-transfer/:token` — sees event details
8. Taps **Accept Ticket** — sees success + seat summary
9. Taps **View Ticket** — sees full TM-style ticket with QR code
10. QR links to `/verify/:token` — shows VALID / INVALID
