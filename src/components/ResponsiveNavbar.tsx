import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';

const ResponsiveNavbar: React.FC = () => {
  const isMobile = useIsMobile();

  // Mobile: show only mobile navbar (hidden on md+)
  // Desktop: show only desktop navbar (visible on md+)
  return (
    <>
      {/* Mobile navbar - shown only on small screens */}
      <div className="md:hidden">
        <MobileNavbar />
      </div>
      {/* Desktop navbar - shown only on medium+ screens */}
      <div className="hidden md:block">
        <Navbar />
      </div>
    </>
  );
};

export default ResponsiveNavbar;
