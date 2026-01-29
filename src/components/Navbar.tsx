import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Trophy, Users, UserCircle, LogOut, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/promises', label: 'Promises' },
    { path: '/calendar', label: 'Calendar' },
  ];

  const socialItems = [
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/connections', label: 'Connections', icon: Users },
    { path: '/groups', label: 'Groups', icon: UserCircle },
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

            {/* Social Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3 py-1.5 text-sm font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Social
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border">
                {socialItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile & Sign out */}
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              onClick={signOut}
              className="text-xs font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
