import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu, User, Trophy, Users, UserCircle, LogOut, Calendar, LayoutDashboard, FileCheck, FileText, CalendarCheck, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNavbar: React.FC = () => {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const location = useLocation();

  const mainItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/tasks', label: 'Tasks', icon: CalendarCheck },
    { path: '/community', label: 'Community', icon: MessageSquare },
  ];

  const promiseItems = [
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border md:hidden">
      <div className="px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/dashboard" className="font-bold tracking-tight text-sm">
            FUTURE YOU
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/50">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-card border-l border-border p-0">
              <div className="flex flex-col h-full">
                {/* Header with Profile */}
                <div className="p-6 border-b border-border">
                  <SheetClose asChild>
                    <Link to="/profile" className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-12 h-12 rounded-xl overflow-hidden border-2 border-border flex items-center justify-center bg-muted"
                      >
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground" />
                        )}
                      </motion.div>
                      <div>
                        <p className="font-semibold text-sm">
                          {profile?.real_name || profile?.display_name || profile?.username || 'Anonymous'}
                        </p>
                        {profile?.username && (
                          <p className="text-xs text-muted-foreground">@{profile.username}</p>
                        )}
                      </div>
                    </Link>
                  </SheetClose>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-auto py-4">
                  <div className="px-4 mb-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      Main
                    </span>
                  </div>
                  {mainItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="px-4 mt-6 mb-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      Promises
                    </span>
                  </div>
                  {promiseItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="px-4 mt-6 mb-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      Social
                    </span>
                  </div>
                  {socialItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-2 py-3 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default MobileNavbar;
