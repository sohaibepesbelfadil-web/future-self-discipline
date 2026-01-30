import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';

const ResponsiveNavbar: React.FC = () => {
  const isMobile = useIsMobile();

  // Show mobile navbar for mobile, desktop navbar otherwise
  // useIsMobile returns undefined initially, so we render both and hide via CSS for smooth transition
  return (
    <>
      <MobileNavbar />
      <div className="hidden md:block">
        <Navbar />
      </div>
    </>
  );
};

export default ResponsiveNavbar;
