export interface TmEvent {
  id: string;
  name: string;
  image: string;
  venue: string;
  city: string;
  state: string;
  date: string;
  time: string;
  url?: string;
}

export interface TicketFormData {
  // Event Details
  eventName: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  address: string;
  zipCode: string;
  eventDate: string;
  eventTime: string;
  eventImage?: string;
  // Ticket Details
  section: string;
  row: string;
  seatNumber: string;
  ticketType: string;
  entryInfo: string;
  timerHours: string;
  // Purchase Details
  purchaseDate: string;
  purchaseTime: string;
  price: string;
  numberOfSeats: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  orderId: string;
  verificationToken: string;
  // Event
  eventName: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  address: string;
  zipCode: string;
  eventDate: string;
  eventTime: string;
  eventImage: string;
  // Ticket
  section: string;
  row: string;
  seat: string;
  ticketType: string;
  entryInfo: string;
  timerHours: number;
  // Purchase
  purchaseDate: string;
  purchaseTime: string;
  price: number;
  // Transfer
  isTransferred: boolean;
  transferredTo?: string;
  holderId: string;
}

export interface Order {
  orderId: string;
  eventName: string;
  eventImage: string;
  venue: string;
  city: string;
  state: string;
  eventDate: string;
  eventTime: string;
  tickets: Ticket[];
  createdAt: string;
  holderId: string;
}

export interface TransferRequest {
  ticketId: string;
  firstName: string;
  lastName: string;
  email: string;
}
