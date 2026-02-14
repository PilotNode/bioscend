import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingQuiz from './OnboardingQuiz';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'quiz' | 'processing' | 'success';

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const { updateProfile } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    setCurrentStep('quiz');
  };

  const handleQuizComplete = async (data: any) => {
    // If user is not authenticated, save to local storage and redirect to register
    if (!user) {
      console.log('User not logged in, saving to local storage');
      try {
        localStorage.setItem('onboarding_data', JSON.stringify(data));
        toast.success('Progress saved! Create an account to continue.');
        navigate('/register');
      } catch (error) {
        console.error('Failed to save to local storage:', error);
        toast.error('Something went wrong. Please try again.');
      }
      return;
    }

    setCurrentStep('processing');

    // Create the full profile data
    const profileData = {
      ...data,
      onboardingCompleted: true,
      completedAt: new Date()
    };

    try {
      // Save data to Firestore/Local
      await updateProfile(profileData);

      // Update successful, show success screen
      setCurrentStep('success');
      toast.success('Onboarding complete!');

      // Wait a moment before notifying completion (which might trigger redirects)
      setTimeout(() => {
        onComplete();
        // Force navigation to dashboard just in case the OnboardingRoute doesn't catch it immediately
        navigate('/', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      toast.error('Failed to save profile. Please try again.');
      // Go back to quiz so they can try submitting again
      setCurrentStep('quiz');
    }
  };

  if (currentStep === 'processing' || currentStep === 'success') {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${currentStep === 'success'
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 animate-bounce-subtle'
            : 'bg-surface-raised animate-pulse'
            }`}>
            {currentStep === 'success' ? (
              <Check className="w-10 h-10 text-white" />
            ) : (
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            {currentStep === 'success' ? 'Welcome to BioScend!' : 'Personalizing...'}
          </h1>

          <p className="text-gray-400 mb-6">
            {currentStep === 'success'
              ? "You're all set! We've personalized your experience based on your preferences."
              : "Setting up your dashboard and generating insights..."}
          </p>

          {currentStep === 'success' && (
            <div className="flex items-center justify-center space-x-2 text-primary-500">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Redirecting to dashboard...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {currentStep === 'welcome' && (
        <OnboardingWelcome onStart={handleStartQuiz} />
      )}
      {currentStep === 'quiz' && (
        <OnboardingQuiz onComplete={handleQuizComplete} />
      )}
    </>
  );
};

export default OnboardingFlow;