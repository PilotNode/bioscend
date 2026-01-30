import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Pill, 
  Heart, 
  BarChart3, 
  History, 
  Settings,
  Brain
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Navigation: React.FC = () => {
  const { state } = useApp();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/supplements', icon: Pill, label: 'Supplements' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="bg-surface-elevated border-r border-surface-raised">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-surface-raised">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">BioScend</h1>
              {state.aiEnabled && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary-500">AI Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'text-gray-400 hover:text-white hover:bg-surface-raised'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;