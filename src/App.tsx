import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Supplements from './pages/Supplements';
import Wellness from './pages/Wellness';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Analysis from './pages/Analysis';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Landing from './pages/Landing';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};



// Root Route wrapper - handles initial redirection
const RootRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const { state } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, render Landing page
  if (!user) {
    return <Landing />;
  }

  // Check if we're still initializing or syncing profile
  // If we have a user but no profile yet, and we are NOT "offline" (which implies we might never get one if it doesn't exist locally),
  // we should wait. However, if initialized is true, we should have a profile if one exists.
  if (!state.initialized && state.syncStatus !== 'offline') {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, check profile for onboarding status
  if (state.profile) {
    if (state.profile.onboardingCompleted === true) {
      return <Layout />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Fallback: If initialized but no profile found (rare edge case), likely new user or error.
  // We can default to onboarding to be safe, or layout if we assume error.
  // Given the auth flow creates a profile shell, this shouldn't happen often.
  return <Navigate to="/onboarding" replace />;
};

const AppContent: React.FC = () => {
  const handleOnboardingComplete = async () => {
    // The onboarding quiz already updates the profile with onboardingCompleted: true
    // This is just a callback to handle any additional logic if needed
    console.log('Onboarding flow completed');
  };

  return (
    <AppProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-surface-base">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Onboarding Route - Accessible to everyone */}
            <Route path="/onboarding" element={
              <OnboardingFlow onComplete={handleOnboardingComplete} />
            } />

            {/* Root Route - Handles redirection based on auth status */}
            <Route path="/" element={<RootRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="supplements" element={<Supplements />} />
              <Route path="wellness" element={<Wellness />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="history" element={<History />} />
              <Route path="interactions" element={<Analysis />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1E1E1E',
                color: '#fff',
                border: '1px solid #333333',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#20C997',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#F03E3E',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
};

export default App;