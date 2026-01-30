import React, { useState } from 'react';
import { Brain, Sparkles, Target, TrendingUp, Calendar, Heart, ChevronRight } from 'lucide-react';
import Button from '../UI/Button';

interface OnboardingWelcomeProps {
  onStart: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onStart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations based on your unique wellness journey and goals.',
      color: 'from-primary-500 to-secondary-500'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Smart Scheduling',
      description: 'Automatically organize your supplements and wellness activities for optimal results.',
      color: 'from-secondary-500 to-purple-500'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Progress Tracking',
      description: 'Monitor your adherence and see detailed analytics of your wellness journey.',
      color: 'from-success to-primary-500'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Holistic Wellness',
      description: 'Track both supplements and wellness activities in one comprehensive platform.',
      color: 'from-error to-warning'
    }
  ];

  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BioScend</h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Your Wellness Journey,<br />
          <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            Perfectly Optimized
          </span>
        </h2>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Effortlessly track and optimize your supplements and wellness routine with AI-powered insights.
        </p>
      </div>

      {/* Feature Showcase */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-surface-elevated border border-surface-raised">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {features.map((feature, index) => (
              <div key={index} className="w-full flex-shrink-0 p-8 md:p-12">
                <div className="text-center max-w-md mx-auto">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 pb-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-primary-500 w-8' 
                    : 'bg-surface-overlay hover:bg-surface-raised'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          
          <div className="text-center">
            <span className="text-sm text-gray-400">
              {currentSlide + 1} of {features.length}
            </span>
          </div>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide === features.length - 1}
            className="p-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center px-4 pb-12">
        <div className="max-w-md mx-auto">
          <Button
            onClick={onStart}
            className="w-full py-4 text-lg font-semibold mb-4"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started
          </Button>
          <p className="text-sm text-gray-500">
            Takes less than 2 minutes to personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWelcome;