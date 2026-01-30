import React, { useState } from 'react';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingQuiz from './OnboardingQuiz';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'quiz'>('welcome');

  const handleStartQuiz = () => {
    setCurrentStep('quiz');
  };

  const handleQuizComplete = (data: any) => {
    console.log('Onboarding completed with data:', data);
    onComplete();
  };

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