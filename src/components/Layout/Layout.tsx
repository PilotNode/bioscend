import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-base safe-area-bottom">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar Navigation */}
        <div className="w-64 hidden md:block">
          <Navigation />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Main Content */}
      <div className="md:hidden">
        <main className="p-4 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;