import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Pill,
  Heart,
  MoreHorizontal,
  BarChart3,
  History,
  Settings,
  FlaskConical,
  X,
  User,
  Brain,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

/** Primary tabs shown in the bottom bar */
const PRIMARY_TABS = [
  { path: '/', icon: Home, label: 'Home', exactMatch: true },
  { path: '/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/supplements', icon: Pill, label: 'Supps' },
  { path: '/wellness', icon: Heart, label: 'Wellness' },
];

/** Overflow items accessible via the "More" sheet */
const MORE_ITEMS = [
  { path: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-primary-500' },
  { path: '/history', icon: History, label: 'History', color: 'text-secondary-500' },
  { path: '/analysis', icon: FlaskConical, label: 'Analysis', color: 'text-amber-400' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'text-gray-400' },
];

const MobileNavigation: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const { state } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string, exactMatch?: boolean) => {
    if (exactMatch) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isMoreActive = MORE_ITEMS.some(item => location.pathname.startsWith(item.path));

  const handleNavigate = (path: string) => {
    setShowMore(false);
    navigate(path);
  };

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header className="md:hidden bg-surface-elevated/95 backdrop-blur-md border-b border-surface-raised/80 px-4 flex items-center justify-between safe-area-pt" style={{ paddingTop: `calc(env(safe-area-inset-top) + 10px)`, paddingBottom: '10px' }}>
        {/* Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">BioScend</span>
            {state.aiEnabled && (
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-primary-400 font-medium">AI Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-glow touch-manipulation"
          aria-label="Profile"
        >
          <User className="w-4 h-4 text-white" />
        </button>
      </header>

      {/* ── Bottom Tab Bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-elevated/95 backdrop-blur-md border-t border-surface-raised/80 bottom-tab-bar"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch h-14">
          {/* Primary tabs */}
          {PRIMARY_TABS.map((tab) => {
            const active = isActive(tab.path, tab.exactMatch);
            return (
              <button
                key={tab.path}
                onClick={() => handleNavigate(tab.path)}
                className="flex-1 flex flex-col items-center justify-center space-y-0.5 touch-manipulation relative"
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Active indicator pill */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                )}
                <tab.icon
                  className={`w-5 h-5 transition-all duration-150 ${
                    active ? 'text-primary-500 scale-110' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-150 ${
                    active ? 'text-primary-500' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center space-y-0.5 touch-manipulation relative"
            aria-label="More options"
          >
            {isMoreActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
            )}
            <MoreHorizontal
              className={`w-5 h-5 transition-all duration-150 ${
                isMoreActive ? 'text-primary-500' : 'text-gray-500'
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors duration-150 ${
                isMoreActive ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ── "More" Bottom Sheet ── */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in"
            onClick={() => setShowMore(false)}
          />

          {/* Sheet */}
          <div className="relative bg-surface-elevated rounded-t-3xl border-t border-surface-raised/80 animate-sheet-up safe-area-pb">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-surface-overlay rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-surface-raised/60">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">BioScend</p>
                  {user?.email && (
                    <p className="text-xs text-gray-500">{user.email.split('@')[0]}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors touch-manipulation"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav items */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {MORE_ITEMS.map((item) => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all touch-manipulation ${
                      active
                        ? 'bg-primary-500/15 border border-primary-500/30'
                        : 'bg-surface-raised hover:bg-surface-overlay border border-transparent'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-400' : item.color}`} />
                    <span className={`font-medium text-sm ${active ? 'text-white' : 'text-gray-300'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* AI status badge */}
            {state.aiEnabled && (
              <div className="mx-4 mb-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl px-4 py-3 flex items-center space-x-2.5">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary-400">AI Assistant Active</p>
                  <p className="text-xs text-gray-500 mt-0.5">Getting personalised insights</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;