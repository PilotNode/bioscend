import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Mobile Navigation (top header + bottom tab bar) */}
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

      {/* Mobile Main Content
          pb-[calc(56px+env(safe-area-inset-bottom))] accounts for:
          - 56px bottom tab bar height
          - safe-area-inset-bottom (notch devices)
      */}
      <div className="md:hidden">
        <main
          className="p-4 overflow-y-auto"
          style={{
            paddingBottom: 'calc(56px + env(safe-area-inset-bottom) + 16px)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;