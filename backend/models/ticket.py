from app import db
from datetime import datetime
import secrets


class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(20), unique=True, nullable=False)
    order_id = db.Column(db.String(20), nullable=False, index=True)
    verification_token = db.Column(db.String(64), unique=True, nullable=False)

    # Event
    event_name = db.Column(db.String(255), nullable=False)
    venue = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    country = db.Column(db.String(50))
    address = db.Column(db.String(255))
    zip_code = db.Column(db.String(20))
    event_date = db.Column(db.String(20))
    event_time = db.Column(db.String(10))
    event_image = db.Column(db.Text)

    # Ticket
    section = db.Column(db.String(20))
    row = db.Column(db.String(10))
    seat = db.Column(db.String(10))
    ticket_type = db.Column(db.String(50))
    entry_info = db.Column(db.String(100))
    timer_hours = db.Column(db.Float, default=24)

    # Purchase
    purchase_date = db.Column(db.String(20))
    purchase_time = db.Column(db.String(10))
    price = db.Column(db.Float, default=0)

    # Transfer
    is_transferred = db.Column(db.Boolean, default=False)
    transferred_to = db.Column(db.String(255))
    holder_id = db.Column(db.String(50))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'ticketId': self.ticket_id,
            'orderId': self.order_id,
            'verificationToken': self.verification_token,
            'eventName': self.event_name,
            'venue': self.venue,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'address': self.address,
            'zipCode': self.zip_code,
            'eventDate': self.event_date,
            'eventTime': self.event_time,
            'eventImage': self.event_image,
            'section': self.section,
            'row': self.row,
            'seat': self.seat,
            'ticketType': self.ticket_type,
            'entryInfo': self.entry_info,
            'timerHours': self.timer_hours,
            'purchaseDate': self.purchase_date,
            'purchaseTime': self.purchase_time,
            'price': self.price,
            'isTransferred': self.is_transferred,
            'transferredTo': self.transferred_to,
            'holderId': self.holder_id,
        }
