import React, { useState } from 'react';
import { Palette, Brain, Shield, LogOut } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { state, toggleAI, dispatch } = useApp();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNotificationToggle = async () => {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: !state.notifications });
    // Save to storage
  };

  const handleDarkModeToggle = async () => {
    dispatch({ type: 'SET_DARK_MODE', payload: !state.darkMode });
    // Save to storage
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Customize your BioScend experience</p>
      </div>

      {/* AI Settings */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Brain className="w-6 h-6 text-secondary-500" />
          <h2 className="text-base md:text-lg font-semibold text-white">AI Features</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-base font-medium text-white">AI Functionality</h3>
              <p className="text-sm text-gray-400">Enable AI-powered insights and recommendations</p>
            </div>
            <button
              onClick={toggleAI}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 touch-manipulation ${
                state.aiEnabled 
                  ? 'bg-primary-500 shadow-glow' 
                  : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-200 ${
                  state.aiEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {state.aiEnabled && (
            <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary-500">AI Active</span>
              </div>
              <p className="text-sm text-gray-400">
                AI features are currently enabled. You'll receive personalized insights, 
                recommendations, and smart scheduling suggestions.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-6 h-6 bg-warning rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🔔</span>
          </div>
          <h2 className="text-base md:text-lg font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-base font-medium text-white">Push Notifications</h3>
              <p className="text-sm text-gray-400">Receive reminders for supplements and wellness activities</p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 touch-manipulation ${
                state.notifications 
                  ? 'bg-primary-500 shadow-glow' 
                  : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-200 ${
                  state.notifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Palette className="w-6 h-6 text-success" />
          <h2 className="text-base md:text-lg font-semibold text-white">Appearance</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-base font-medium text-white">Dark Mode</h3>
              <p className="text-sm text-gray-400">Use dark theme for better readability</p>
            </div>
            <button
              onClick={handleDarkModeToggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 touch-manipulation ${
                state.darkMode 
                  ? 'bg-primary-500 shadow-glow' 
                  : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-200 ${
                  state.darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Shield className="w-6 h-6 text-error" />
          <h2 className="text-base md:text-lg font-semibold text-white">Privacy & Security</h2>
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Export Data
          </Button>
          <Button variant="ghost" className="w-full text-error hover:text-error">
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Account Actions */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <LogOut className="w-6 h-6 text-warning" />
          <h2 className="text-base md:text-lg font-semibold text-white">Account</h2>
        </div>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full text-warning border-warning hover:bg-warning hover:text-white"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to sign out? You'll need to sign in again to access your data.
          </p>
          <div className="flex space-x-3">
            <Button 
              onClick={handleLogout}
              className="flex-1 bg-warning hover:bg-warning/80"
            >
              Yes, Sign Out
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowLogoutModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;