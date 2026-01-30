import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, User, Target, Clock, Activity, Pill, Heart, Sparkles } from 'lucide-react';
import Button from '../UI/Button';
import { useApp } from '../../contexts/AppContext';

interface QuizAnswer {
  id: string;
  text: string;
  description?: string;
  icon?: React.ReactNode;
}

interface QuizQuestion {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multiple';
  answers: QuizAnswer[];
}

interface OnboardingQuizProps {
  onComplete: (data: any) => void;
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete }) => {
  const { updateProfile } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const questions: QuizQuestion[] = [
    {
      id: 'age_group',
      title: 'What\'s your age group?',
      subtitle: 'This helps us personalize your wellness recommendations',
      type: 'single',
      answers: [
        { id: '18-25', text: '18-25 years', icon: <User className="w-5 h-5" /> },
        { id: '26-35', text: '26-35 years', icon: <User className="w-5 h-5" /> },
        { id: '36-45', text: '36-45 years', icon: <User className="w-5 h-5" /> },
        { id: '46-55', text: '46-55 years', icon: <User className="w-5 h-5" /> },
        { id: '55+', text: '55+ years', icon: <User className="w-5 h-5" /> }
      ]
    },
    {
      id: 'wellness_goals',
      title: 'What are your primary wellness goals?',
      subtitle: 'Select all that apply to you',
      type: 'multiple',
      answers: [
        { id: 'energy', text: 'Boost Energy', description: 'Feel more energized throughout the day', icon: <Sparkles className="w-5 h-5" /> },
        { id: 'sleep', text: 'Better Sleep', description: 'Improve sleep quality and duration', icon: <Clock className="w-5 h-5" /> },
        { id: 'stress', text: 'Reduce Stress', description: 'Manage stress and anxiety better', icon: <Heart className="w-5 h-5" /> },
        { id: 'fitness', text: 'Physical Fitness', description: 'Enhance physical performance', icon: <Activity className="w-5 h-5" /> },
        { id: 'immunity', text: 'Immune Support', description: 'Strengthen immune system', icon: <Pill className="w-5 h-5" /> },
        { id: 'focus', text: 'Mental Clarity', description: 'Improve focus and cognitive function', icon: <Target className="w-5 h-5" /> }
      ]
    },
    {
      id: 'current_supplements',
      title: 'Do you currently take any supplements?',
      subtitle: 'This helps us avoid duplicate recommendations',
      type: 'single',
      answers: [
        { id: 'none', text: 'No supplements', description: 'I don\'t currently take any supplements' },
        { id: 'few', text: 'A few supplements', description: 'I take 1-3 supplements regularly' },
        { id: 'many', text: 'Many supplements', description: 'I take 4+ supplements regularly' },
        { id: 'unsure', text: 'Not sure', description: 'I take some but not consistently' }
      ]
    },
    {
      id: 'wellness_activities',
      title: 'Which wellness activities interest you?',
      subtitle: 'We\'ll suggest routines based on your preferences',
      type: 'multiple',
      answers: [
        { id: 'meditation', text: 'Meditation', description: 'Mindfulness and breathing exercises', icon: <Heart className="w-5 h-5" /> },
        { id: 'exercise', text: 'Exercise', description: 'Physical workouts and movement', icon: <Activity className="w-5 h-5" /> },
        { id: 'journaling', text: 'Journaling', description: 'Reflection and gratitude practices', icon: <Target className="w-5 h-5" /> },
        { id: 'stretching', text: 'Stretching', description: 'Flexibility and mobility work', icon: <Activity className="w-5 h-5" /> },
        { id: 'breathing', text: 'Breathing Exercises', description: 'Focused breathing techniques', icon: <Heart className="w-5 h-5" /> }
      ]
    },
    {
      id: 'schedule_preference',
      title: 'When do you prefer to focus on wellness?',
      subtitle: 'We\'ll schedule your activities at optimal times',
      type: 'single',
      answers: [
        { id: 'morning', text: 'Morning Person', description: 'I\'m most motivated in the morning', icon: <Clock className="w-5 h-5" /> },
        { id: 'evening', text: 'Evening Person', description: 'I prefer evening routines', icon: <Clock className="w-5 h-5" /> },
        { id: 'throughout', text: 'Throughout the Day', description: 'I like spreading activities across the day', icon: <Clock className="w-5 h-5" /> },
        { id: 'flexible', text: 'Flexible', description: 'I can adapt to any schedule', icon: <Clock className="w-5 h-5" /> }
      ]
    }
  ];

  const handleAnswer = (questionId: string, answerId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    setIsAnimating(true);

    if (question.type === 'single') {
      setAnswers(prev => ({ ...prev, [questionId]: answerId }));
      
      // Auto-advance for single choice questions
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          handleComplete();
        }
        setIsAnimating(false);
      }, 300);
    } else {
      // Multiple choice - toggle selection
      setAnswers(prev => {
        const currentAnswers = (prev[questionId] as string[]) || [];
        const newAnswers = currentAnswers.includes(answerId)
          ? currentAnswers.filter(id => id !== answerId)
          : [...currentAnswers, answerId];
        return { ...prev, [questionId]: newAnswers };
      });
      setIsAnimating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsAnimating(true);
    
    // Process answers into profile data
    const profileData = {
      ageGroup: answers.age_group,
      goals: Array.isArray(answers.wellness_goals) 
        ? answers.wellness_goals.join(', ') 
        : answers.wellness_goals || '',
      currentSupplementLevel: answers.current_supplements,
      preferredActivities: Array.isArray(answers.wellness_activities)
        ? answers.wellness_activities.join(', ')
        : answers.wellness_activities || '',
      schedulePreference: answers.schedule_preference,
      onboardingCompleted: true,
      completedAt: new Date()
    };

    try {
      await updateProfile(profileData);
      
      setTimeout(() => {
        setShowCompletion(true);
        setIsAnimating(false);
        
        // Complete onboarding after showing success message
        setTimeout(() => {
          onComplete(profileData);
        }, 2000);
      }, 500);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      setIsAnimating(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isMultipleChoice = currentQuestion?.type === 'multiple';
  const hasMultipleAnswers = isMultipleChoice && Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).length > 0;

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to BioScend!</h1>
          <p className="text-gray-400 mb-6">
            You're all set! We've personalized your experience based on your preferences.
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary-500">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Setting up your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-surface-elevated border-b border-surface-raised">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-surface-raised rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          {/* Question Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {currentQuestion?.title}
            </h1>
            {currentQuestion?.subtitle && (
              <p className="text-gray-400 text-lg">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion?.answers.map((answer, index) => {
              const isSelected = isMultipleChoice 
                ? (answers[currentQuestion.id] as string[] || []).includes(answer.id)
                : answers[currentQuestion.id] === answer.id;

              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswer(currentQuestion.id, answer.id)}
                  className={`w-full p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                      : 'border-surface-overlay bg-surface-elevated hover:border-surface-raised hover:bg-surface-raised'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    {answer.icon && (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-surface-raised text-gray-400 group-hover:text-white'
                      }`}>
                        {answer.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold transition-colors ${
                          isSelected ? 'text-primary-400' : 'text-white'
                        }`}>
                          {answer.text}
                        </h3>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      {answer.description && (
                        <p className="text-gray-400 text-sm mt-1">
                          {answer.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          {isMultipleChoice && (
            <div className="flex justify-center">
              <Button
                onClick={handleNext}
                disabled={!hasMultipleAnswers}
                className="px-8 py-3 text-lg"
              >
                {currentStep === questions.length - 1 ? 'Complete Setup' : 'Continue'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;