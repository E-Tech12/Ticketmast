import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, Ticket } from '../types';

interface AppState {
  userId: string;
  isAuthenticated: boolean;
  userName: string;
  orders: Order[];
  selectedEvent: { name: string; image: string } | null;
  login: (name: string) => void;
  logout: () => void;
  addOrder: (order: Order) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  updateMultipleTickets: (ticketIds: string[], updates: Partial<Ticket>) => void;
  setSelectedEvent: (event: { name: string; image: string } | null) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getTicketById: (ticketId: string) => Ticket | undefined;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      isAuthenticated: false,
      userName: '',
      orders: [],
      selectedEvent: null,

      login: (name: string) => set({ isAuthenticated: true, userName: name }),
      logout: () => set({ isAuthenticated: false, userName: '' }),

      addOrder: (order) =>
        set((state) => ({ orders: [...state.orders, order] })),

      updateTicket: (ticketId, updates) =>
        set((state) => ({
          orders: state.orders.map((order) => ({
            ...order,
            tickets: order.tickets.map((t) =>
              t.ticketId === ticketId ? { ...t, ...updates } : t
            ),
          })),
        })),

      updateMultipleTickets: (ticketIds, updates) =>
        set((state) => ({
          orders: state.orders.map((order) => ({
            ...order,
            tickets: order.tickets.map((t) =>
              ticketIds.includes(t.ticketId) ? { ...t, ...updates } : t
            ),
          })),
        })),

      setSelectedEvent: (event) => set({ selectedEvent: event }),

      getOrderById: (orderId) =>
        get().orders.find((o) => o.orderId === orderId),

      getTicketById: (ticketId) => {
        for (const order of get().orders) {
          const ticket = order.tickets.find((t) => t.ticketId === ticketId);
          if (ticket) return ticket;
        }
        return undefined;
      },
    }),
    { name: 'ticketvault-storage' }
  )
);
