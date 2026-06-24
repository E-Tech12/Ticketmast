import secrets
from flask import Blueprint, request, jsonify
from app import db
from models.ticket import Ticket

tickets_bp = Blueprint('tickets', __name__)


@tickets_bp.route('/tickets', methods=['POST'])
def create_tickets():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    order_id = data.get('orderId')
    tickets_data = data.get('tickets', [])

    created = []
    for t in tickets_data:
        ticket = Ticket(
            ticket_id=t.get('ticketId'),
            order_id=order_id,
            verification_token=t.get('verificationToken', secrets.token_urlsafe(32)),
            event_name=t.get('eventName', ''),
            venue=t.get('venue', ''),
            city=t.get('city', ''),
            state=t.get('state', ''),
            country=t.get('country', ''),
            address=t.get('address', ''),
            zip_code=t.get('zipCode', ''),
            event_date=t.get('eventDate', ''),
            event_time=t.get('eventTime', ''),
            event_image=t.get('eventImage', ''),
            section=t.get('section', ''),
            row=t.get('row', ''),
            seat=t.get('seat', ''),
            ticket_type=t.get('ticketType', ''),
            entry_info=t.get('entryInfo', ''),
            timer_hours=float(t.get('timerHours', 24)),
            purchase_date=t.get('purchaseDate', ''),
            purchase_time=t.get('purchaseTime', ''),
            price=float(t.get('price', 0)),
            holder_id=t.get('holderId', ''),
        )
        db.session.add(ticket)
        created.append(ticket.to_dict())

    db.session.commit()
    return jsonify({'tickets': created}), 201


@tickets_bp.route('/verify/<token>')
def verify_ticket(token):
    ticket = Ticket.query.filter_by(verification_token=token).first()

    if not ticket:
        return jsonify({'valid': False, 'message': 'Ticket not found'}), 404

    if ticket.is_transferred:
        return jsonify({'valid': False, 'message': 'This ticket has been transferred and is no longer valid'}), 400

    return jsonify({
        'valid': True,
        'eventName': ticket.event_name,
        'ticketId': ticket.ticket_id,
        'section': ticket.section,
        'row': ticket.row,
        'seat': ticket.seat,
        'holder': ticket.holder_id,
        'status': 'VALID',
    })


@tickets_bp.route('/tickets/<ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    ticket = Ticket.query.filter_by(ticket_id=ticket_id).first()
    if not ticket:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(ticket.to_dict())
