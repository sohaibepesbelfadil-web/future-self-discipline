import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Trophy, Users, UserCircle, LogOut, ChevronDown, FileText, CalendarCheck, MessageSquare, Home, FileCheck, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const location = useLocation();

  const mainNavItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/tasks', label: 'Tasks', icon: CalendarCheck },
    { path: '/community', label: 'Community', icon: MessageSquare },
  ];

  const promiseNavItems = [
    { path: '/promises', label: 'Promises', icon: FileCheck },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  const socialItems = [
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/connections', label: 'Connections', icon: Users },
    { path: '/groups', label: 'Groups', icon: UserCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border hidden md:block">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="font-bold tracking-tight text-lg">
            FUTURE YOU
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-xl flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}

            {/* Promises Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`px-4 py-2 text-sm font-medium transition-colors rounded-xl flex items-center gap-2 ${
                promiseNavItems.some(item => isActive(item.path))
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}>
                <FileCheck className="w-4 h-4" />
                Promises
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="glass-card border-border min-w-[160px]">
                {promiseNavItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 text-sm"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Social Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`px-4 py-2 text-sm font-medium transition-colors rounded-xl flex items-center gap-2 ${
                socialItems.some(item => isActive(item.path))
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}>
                <Users className="w-4 h-4" />
                Social
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="glass-card border-border min-w-[160px]">
                {socialItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 text-sm"
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
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                isActive('/profile')
                  ? 'bg-primary/10'
                  : 'hover:bg-muted/50'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </motion.div>
              <span className="text-sm font-medium hidden lg:inline">
                {profile?.username || 'Profile'}
              </span>
            </Link>
            <button
              onClick={signOut}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
