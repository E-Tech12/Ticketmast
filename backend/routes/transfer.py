import os
import json
import secrets
import smtplib
import urllib.request
import urllib.error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify
from app import db
from models.ticket import Ticket

transfer_bp = Blueprint('transfer', __name__)


# ─────────────────────────────────────────
#  DATE / TIME HELPERS
# ─────────────────────────────────────────
def format_date(date_str: str) -> str:
    if not date_str:
        return ''
    try:
        from datetime import datetime
        d = datetime.strptime(date_str[:10], '%Y-%m-%d')
        return d.strftime('%B %d, %Y')          # August 3, 2026
    except Exception:
        return date_str


def format_time(time_str: str) -> str:
    if not time_str:
        return ''
    try:
        from datetime import datetime
        t = datetime.strptime(time_str[:5], '%H:%M')
        return t.strftime('%I:%M %p').lstrip('0')  # 8:00 PM
    except Exception:
        return time_str


# ─────────────────────────────────────────
#  EMAIL BUILDER — clean, minimal, transactional
# ─────────────────────────────────────────
def build_transfer_email(data: dict) -> str:
    event_name  = data.get('eventName', 'Event')
    venue       = data.get('venue', '')
    city        = data.get('city', '')
    state       = data.get('state', '')
    event_date  = format_date(data.get('eventDate', ''))
    event_time  = format_time(data.get('eventTime', ''))
    section     = data.get('section', '')
    row         = data.get('row', '')
    seat        = data.get('seat', '')
    order_id    = data.get('orderId', '')
    event_image = data.get('eventImage', '')
    first_name  = data.get('firstName', 'there')
    sender_name = data.get('senderName', 'Someone')
    total_tix   = int(data.get('totalTickets', 1))
    token       = data.get('verificationToken', '')
    app_url     = os.environ.get('APP_URL', 'http://localhost:5173')

    # Accept link goes to /accept-transfer/:token
    accept_url  = f"{app_url}/accept-transfer/{token}"

    ticket_word = 'ticket' if total_tix == 1 else 'tickets'

    # Date + time line
    when_str = event_date
    if event_time:
        when_str += f' at {event_time}'

    # Venue line
    venue_str = venue
    if city:
        venue_str += f', {city}'
    if state:
        venue_str += f', {state}'

    # Event image block — only if we have a URL
    img_html = ''
    if event_image:
        img_html = f'''
      <tr>
        <td style="padding:0;line-height:0;font-size:0;">
          <img src="{event_image}" alt="{event_name}"
               width="600"
               style="display:block;width:100%;max-height:250px;
                      object-fit:cover;border:none;outline:none;" />
        </td>
      </tr>'''

    # Detail rows
    detail_rows = [
        ('Event',        event_name),
        ('Date',         when_str),
        ('Venue',        venue_str),
        ('Section',      section),
        ('Row',          row),
        ('Seat',         seat),
        ('Order Number', order_id),
    ]

    rows_html = ''
    for label, value in detail_rows:
        if not value:
            continue
        rows_html += f'''
            <tr>
              <td style="padding:9px 0;border-bottom:1px solid #eeeeee;
                         vertical-align:top;width:38%;">
                <span style="font-size:13px;color:#888888;font-weight:500;">{label}</span>
              </td>
              <td style="padding:9px 0 9px 12px;border-bottom:1px solid #eeeeee;
                         vertical-align:top;">
                <span style="font-size:13px;color:#222222;font-weight:600;">{value}</span>
              </td>
            </tr>'''

    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Ticket Transfer — {event_name}</title>
  <style>
    @media only screen and (max-width: 480px) {{
      .email-wrapper {{ padding: 0 !important; }}
      .email-card    {{ border-radius: 0 !important; }}
      .email-body    {{ padding: 20px 16px !important; }}
      .accept-btn    {{ display: block !important; width: 100% !important;
                        box-sizing: border-box !important; text-align: center !important; }}
    }}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
             Roboto,'Helvetica Neue',Arial,sans-serif;
             -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         class="email-wrapper"
         style="background-color:#f4f4f4;padding:24px 16px;">
    <tr>
      <td align="center">

        <!-- ── Card ── -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               class="email-card"
               style="max-width:600px;background:#ffffff;border-radius:6px;
                      overflow:hidden;border:1px solid #e0e0e0;">

          <!-- ── Header ── -->
          <tr>
            <td style="background-color:#026CDF;padding:14px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:16px;font-weight:800;color:#ffffff;
                                 letter-spacing:-0.3px;">ticketmaster</span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);
                                 text-transform:uppercase;letter-spacing:0.8px;">
                      Ticket Transfer
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {img_html}

          <!-- ── Body ── -->
          <tr>
            <td class="email-body" style="padding:28px 28px 0;">

              <!-- Transfer message -->
              <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111111;">
                {sender_name} sent you {total_tix} {ticket_word}
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#666666;line-height:1.5;">
                {event_name}
              </p>

              <!-- Detail table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="border-top:1px solid #eeeeee;">
                {rows_html}
              </table>

            </td>
          </tr>

          <!-- ── CTA ── -->
          <tr>
            <td class="email-body" style="padding:28px 28px 32px;text-align:center;">
              <a href="{accept_url}" class="accept-btn"
                 style="display:inline-block;background-color:#026CDF;color:#ffffff;
                        text-decoration:none;font-size:14px;font-weight:700;
                        padding:13px 32px;border-radius:4px;
                        letter-spacing:0.2px;mso-padding-alt:0;">
                Accept {ticket_word.capitalize()}
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#aaaaaa;line-height:1.5;">
                This transfer expires in 72 hours. If you did not expect this,
                you can ignore this email.
              </p>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:#f9f9f9;border-top:1px solid #eeeeee;
                       padding:16px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
                      &copy; {2024} Ticketmaster. All rights reserved.<br/>
                      This is an automated message. Do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>"""


# ─────────────────────────────────────────
#  EMAIL SENDERS
# ─────────────────────────────────────────
def send_via_resend(to_email: str, subject: str, html: str,
                    from_name: str = 'Ticketmaster') -> bool:
    api_key = os.environ.get('RESEND_API_KEY', '')
    if not api_key:
        return False

    from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
    payload = json.dumps({
        'from': f'{from_name} <{from_email}>',
        'to': [to_email],
        'subject': subject,
        'html': html,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201)
    except Exception as e:
        print(f'[Resend Error] {e}')
        return False


def send_via_smtp(to_email: str, subject: str, html: str) -> bool:
    smtp_host  = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port  = int(os.environ.get('SMTP_PORT', 587))
    smtp_user  = os.environ.get('SMTP_USER', '')
    smtp_pass  = os.environ.get('SMTP_PASS', '')
    from_name  = os.environ.get('FROM_NAME', 'Ticketmaster')
    from_email = os.environ.get('FROM_EMAIL', smtp_user)

    if not smtp_user or not smtp_pass:
        return False

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = f'{from_name} <{from_email}>'
    msg['To']      = to_email
    msg.attach(MIMEText(html, 'html'))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f'[SMTP Error] {e}')
        return False


def send_transfer_email(to_email: str, data: dict) -> bool:
    total       = int(data.get('totalTickets', 1))
    ticket_word = 'ticket' if total == 1 else 'tickets'
    event_name  = data.get('eventName', 'Event')
    sender_name = data.get('senderName', 'Someone')
    subject     = f'{sender_name} sent you {total} {ticket_word}: {event_name}'
    from_name   = os.environ.get('FROM_NAME', 'Ticketmaster')
    html        = build_transfer_email(data)

    if send_via_resend(to_email, subject, html, from_name):
        print(f'[Email] Sent via Resend → {to_email}')
        return True
    if send_via_smtp(to_email, subject, html):
        print(f'[Email] Sent via SMTP → {to_email}')
        return True

    print(f'[Email] No provider configured. Transfer processed, no email sent.')
    print(f'[Email] Add RESEND_API_KEY to backend/.env (free at resend.com)')
    return False


# ─────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────
@transfer_bp.route('/transfer', methods=['POST'])
def transfer_ticket():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    ticket_id   = data.get('ticketId')
    to_email    = data.get('email')
    first_name  = data.get('firstName', '')
    sender_name = data.get('senderName', 'A Ticketmaster user')

    if not ticket_id or not to_email:
        return jsonify({'error': 'ticketId and email are required'}), 400

    # Update DB if ticket exists
    ticket = Ticket.query.filter_by(ticket_id=ticket_id).first()
    new_token = data.get('verificationToken', secrets.token_urlsafe(32))

    if ticket:
        new_token = secrets.token_urlsafe(32)
        ticket.verification_token = new_token
        ticket.is_transferred     = True
        ticket.transferred_to     = to_email
        db.session.commit()

    email_data = {
        **data,
        'firstName':  first_name,
        'senderName': sender_name,
        'verificationToken': new_token,
    }

    email_sent = send_transfer_email(to_email, email_data)

    return jsonify({
        'success':   True,
        'emailSent': email_sent,
        'message':   f'Transfer processed for {to_email}',
    })


@transfer_bp.route('/accept-transfer/<token>', methods=['GET'])
def get_transfer_info(token: str):
    """
    Called when recipient clicks Accept Tickets.
    Returns ticket info for the frontend accept page.
    """
    ticket = Ticket.query.filter_by(verification_token=token).first()
    if not ticket:
        return jsonify({'error': 'Transfer not found or already accepted'}), 404

    return jsonify({
        'valid':       True,
        'ticketId':    ticket.ticket_id,
        'eventName':   ticket.event_name,
        'venue':       ticket.venue,
        'city':        ticket.city,
        'state':       ticket.state,
        'eventDate':   ticket.event_date,
        'eventTime':   ticket.event_time,
        'eventImage':  ticket.event_image,
        'section':     ticket.section,
        'row':         ticket.row,
        'seat':        ticket.seat,
        'ticketType':  ticket.ticket_type,
        'orderId':     ticket.order_id,
        'token':       token,
    })
