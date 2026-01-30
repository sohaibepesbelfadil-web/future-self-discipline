import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu, User, Trophy, Users, UserCircle, LogOut, Calendar, LayoutDashboard, FileCheck } from 'lucide-react';

const MobileNavbar: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/promises', label: 'Promises', icon: FileCheck },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  const socialItems = [
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/connections', label: 'Connections', icon: Users },
    { path: '/groups', label: 'Groups', icon: UserCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border md:hidden">
      <div className="px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/dashboard" className="font-bold tracking-tight text-sm">
            FUTURE YOU
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-l border-border p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <span className="font-bold tracking-tight">FUTURE YOU</span>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-auto py-4">
                  <div className="px-4 mb-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      Main
                    </span>
                  </div>
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-mono transition-colors ${
                          location.pathname === item.path
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
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-mono transition-colors ${
                          location.pathname === item.path
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
                      Account
                    </span>
                  </div>
                  <SheetClose asChild>
                    <Link
                      to="/profile"
                      className={`flex items-center gap-3 px-6 py-3 text-sm font-mono transition-colors ${
                        location.pathname === '/profile'
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </SheetClose>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-2 py-3 text-sm font-mono text-muted-foreground hover:text-destructive transition-colors"
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
