import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/promises', label: 'Promises' },
    { path: '/calendar', label: 'Calendar' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/dashboard" className="font-bold tracking-tight">
            FUTURE YOU
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-sm font-mono uppercase tracking-widest transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="text-xs font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
