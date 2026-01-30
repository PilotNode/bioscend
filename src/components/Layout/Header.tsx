import React from 'react';
import { User, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { state, syncData } = useApp();
  const navigate = useNavigate();

  const getSyncIcon = () => {
    switch (state.syncStatus) {
      case 'online':
        return <Wifi className="w-4 h-4 text-success" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-warning animate-spin" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-error" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSyncText = () => {
    switch (state.syncStatus) {
      case 'online':
        return 'Online';
      case 'syncing':
        return 'Syncing...';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <header className="hidden md:block bg-surface-elevated border-b border-surface-raised px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sync Status */}
          <div className="flex items-center space-x-2">
            {getSyncIcon()}
            <span className="text-sm text-gray-400">{getSyncText()}</span>
            {state.syncStatus === 'offline' && (
              <button
                onClick={syncData}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                title="Retry sync"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Profile Menu */}
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            title="Profile"
          >
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;