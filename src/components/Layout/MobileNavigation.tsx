import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Pill, 
  Heart, 
  BarChart3, 
  History, 
  Settings,
  Brain,
  Menu,
  X,
  User
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/supplements', icon: Pill, label: 'Supplements' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-surface-elevated border-b border-surface-raised px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">BioScend</h1>
            {state.aiEnabled && (
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-primary-500">AI Active</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Profile Button */}
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-surface-elevated border-l border-surface-raised">
            {/* Menu Header */}
            <div className="p-6 border-b border-surface-raised">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">BioScend</h2>
                    <p className="text-sm text-gray-400">{user?.email?.split('@')[0]}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="py-6">
              <ul className="space-y-2 px-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-surface-raised"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Status */}
            {state.aiEnabled && (
              <div className="absolute bottom-6 left-4 right-4">
                <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-primary-500">AI Assistant Active</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Getting personalized insights and recommendations
                  </p>
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