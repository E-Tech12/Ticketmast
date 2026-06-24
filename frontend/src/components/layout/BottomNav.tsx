import React from 'react';
import { NavLink } from 'react-router-dom';

const DiscoverIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#026CDF' : '#888'} strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FavoritesIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#026CDF' : 'none'} stroke={active ? '#026CDF' : '#888'} strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const TicketsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#026CDF' : '#888'} strokeWidth="1.8">
    <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
  </svg>
);

const AccountIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#026CDF' : 'none'} stroke={active ? '#026CDF' : '#888'} strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const BottomNav: React.FC = () => (
  <nav className="bottom-nav">
    {[
      { to: '/discover', label: 'Discover', Icon: DiscoverIcon },
      { to: '/favorites', label: 'Favorites', Icon: FavoritesIcon },
      { to: '/my-tickets', label: 'My Tickets', Icon: TicketsIcon },
      { to: '/account', label: 'My Account', Icon: AccountIcon },
    ].map(({ to, label, Icon }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
        {({ isActive }) => (
          <>
            <Icon active={isActive} />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);
