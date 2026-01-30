import React from 'react';
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
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Onboarding Route wrapper
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user needs onboarding
  if (state.initialized && state.profile && !state.profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

// Public Route wrapper (redirects to dashboard if logged in)
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
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const handleOnboardingComplete = async () => {
    // The onboarding quiz already updates the profile with onboardingCompleted: true
    // This is just a callback to handle any additional logic if needed
    console.log('Onboarding flow completed');
  };
  
  return (
    <Router>
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
          
          {/* Onboarding Route */}
          <Route path="/onboarding" element={
            <OnboardingRoute>
              <AppProvider>
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              </AppProvider>
            </OnboardingRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <AppProvider>
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            </AppProvider>
          }>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="supplements" element={<Supplements />} />
            <Route path="wellness" element={<Wellness />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="history" element={<History />} />
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
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;