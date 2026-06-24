import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { Discover } from './pages/Discover';
import { MyTickets } from './pages/MyTickets';
import { OrderDetail } from './pages/OrderDetail';
import { TicketDetail } from './pages/TicketDetail';
import { CreateTicket } from './pages/CreateTicket';
import { Favorites, Account, VerifyTicket } from './pages/Others';
import { Login } from './pages/Login';
import { AcceptTransfer } from './pages/AcceptTransfer';
import { useStore } from './store';

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-shell">
    {children}
    <BottomNav />
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated } = useStore();
  const path = window.location.pathname;

  // These routes are always public — no login required
  const isPublic =
    path.startsWith('/verify/') ||
    path.startsWith('/accept-transfer/');

  if (isPublic) {
    return (
      <Routes>
        <Route path="/verify/:token"          element={<VerifyTicket />} />
        <Route path="/accept-transfer/:token" element={<AcceptTransfer />} />
      </Routes>
    );
  }

  // Everything else requires auth
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      {/* Public routes still accessible when logged in */}
      <Route path="/verify/:token"          element={<VerifyTicket />} />
      <Route path="/accept-transfer/:token" element={<AcceptTransfer />} />

      {/* Protected app routes */}
      <Route path="/*" element={
        <Shell>
          <Routes>
            <Route path="/"               element={<Navigate to="/discover" replace />} />
            <Route path="/discover"       element={<Discover />} />
            <Route path="/favorites"      element={<Favorites />} />
            <Route path="/my-tickets"     element={<MyTickets />} />
            <Route path="/account"        element={<Account />} />
            <Route path="/create-ticket"  element={<CreateTicket />} />
            <Route path="/order/:orderId" element={<OrderDetail />} />
            <Route path="/ticket/:ticketId" element={<TicketDetail />} />
            <Route path="*"               element={<Navigate to="/discover" replace />} />
          </Routes>
        </Shell>
      } />
    </Routes>
  );
};

export default App;
