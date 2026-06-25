import React, { useState } from 'react';
import { Palette, Brain, Shield, LogOut } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Toggle from '../components/UI/Toggle';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const AI_MODELS = [
  { value: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'Nvidia Nemotron 30B (Free)' },
  { value: 'google/gemini-2.0-flash-lite-preview-02-05:free', label: 'Gemini 2.0 Flash Lite (Free)' },
  { value: 'google/gemini-2.0-pro-exp-02-05:free', label: 'Gemini 2.0 Pro Exp (Free)' },
  { value: 'meta-llama/llama-3-8b-instruct:free', label: 'Llama 3 8B Instruct (Free)' },
  { value: 'microsoft/phi-3-mini-128k-instruct:free', label: 'Phi-3 Mini (Free)' },
];

const Settings: React.FC = () => {
  const { state, toggleAI, dispatch, enableNotifications } = useApp();
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('nvidia/nemotron-3-nano-30b-a3b:free');

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      await enableNotifications();
    } else {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: false });
    }
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    dispatch({ type: 'SET_DARK_MODE', payload: enabled });
  };

  const handleModelChange = async (value: string) => {
    setSelectedModel(value);
    const { openRouterService } = await import('../lib/openrouter');
    openRouterService.setModel(value);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLogoutLoading(false);
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
        <div className="space-y-5">
          <Toggle
            enabled={state.aiEnabled}
            onChange={toggleAI}
            label="AI Functionality"
            description="Enable AI-powered insights and recommendations"
            id="toggle-ai"
          />

          {state.aiEnabled && (
            <div className="space-y-4 pt-1">
              <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-primary-500">AI Active</span>
                </div>
                <p className="text-sm text-gray-400">
                  You'll receive personalised insights, recommendations, and smart scheduling suggestions.
                </p>
              </div>

              {/* Model Selection */}
              <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  AI Model
                </label>
                <div className="space-y-2">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.value}
                      onClick={() => handleModelChange(model.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all touch-manipulation ${
                        selectedModel === model.value
                          ? 'bg-primary-500/15 border-primary-500/40 text-white'
                          : 'bg-surface-base border-surface-overlay text-gray-300 hover:border-surface-raised'
                      }`}
                    >
                      <span className="text-sm font-medium">{model.label}</span>
                      {selectedModel === model.value && (
                        <span className="ml-2 text-xs text-primary-400">✓ Active</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Select the AI model used for generating insights and recommendations.
                </p>
              </div>
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
        <Toggle
          enabled={state.notifications}
          onChange={handleNotificationToggle}
          label="Push Notifications"
          description="Receive reminders for supplements and wellness activities"
          id="toggle-notifications"
        />
      </Card>

      {/* Appearance Settings */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Palette className="w-6 h-6 text-success" />
          <h2 className="text-base md:text-lg font-semibold text-white">Appearance</h2>
        </div>
        <Toggle
          enabled={state.darkMode}
          onChange={handleDarkModeToggle}
          label="Dark Mode"
          description="Use dark theme for better readability"
          id="toggle-dark-mode"
        />
      </Card>

      {/* Privacy & Security */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Shield className="w-6 h-6 text-error" />
          <h2 className="text-base md:text-lg font-semibold text-white">Privacy & Security</h2>
        </div>
        <div className="space-y-3">
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
        <Button
          variant="outline"
          className="w-full text-warning border-warning hover:bg-warning hover:text-white"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </Card>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to sign in again to access your data."
        confirmLabel="Yes, Sign Out"
        cancelLabel="Cancel"
        variant="warning"
        loading={logoutLoading}
      />
    </div>
  );
};

export default Settings;