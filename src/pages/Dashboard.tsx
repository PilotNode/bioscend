import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Target, Award, Plus, BarChart3, History, MessageCircle, Lightbulb, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import ProgressCircle from '../components/UI/ProgressCircle';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useApp } from '../contexts/AppContext';

const Dashboard: React.FC = () => {
  const { 
    state, 
    generateAIInsights, 
    generateSupplementRecommendations,
    askAIQuestion,
    addSupplement, 
    addWellness, 
    getScheduleItemsForDate 
  } = useApp();
  const navigate = useNavigate();
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'supplement' | 'wellness'>('supplement');
  const [quickAddData, setQuickAddData] = useState({
    name: '',
    dosage: '',
    duration: 10,
    timeOfDay: 'morning'
  });

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Calculate today's progress using schedule items
  const todayScheduleItems = getScheduleItemsForDate(todayStr);
  const totalTasks = todayScheduleItems.length;
  const completedTasks = todayScheduleItems.filter(item => item.completed).length;
  const adherencePercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const supplementsCompleted = todayScheduleItems.filter(item => item.itemType === 'supplement' && item.completed).length;
  const wellnessCompleted = todayScheduleItems.filter(item => item.itemType === 'wellness' && item.completed).length;
  
  const supplementsTotal = todayScheduleItems.filter(item => item.itemType === 'supplement').length;
  const wellnessTotal = todayScheduleItems.filter(item => item.itemType === 'wellness').length;
  
  const supplementsPercent = supplementsTotal > 0 ? Math.round((supplementsCompleted / supplementsTotal) * 100) : 0;
  const wellnessPercent = wellnessTotal > 0 ? Math.round((wellnessCompleted / wellnessTotal) * 100) : 0;

  const handleQuickAdd = async () => {
    if (quickAddType === 'supplement') {
      await addSupplement({
        name: quickAddData.name,
        dosage: quickAddData.dosage,
        quantity: 1,
        schedule: 'daily',
        timeOfDay: quickAddData.timeOfDay
      });
    } else {
      await addWellness({
        name: quickAddData.name,
        description: `Quick added ${quickAddData.name}`,
        duration: quickAddData.duration,
        schedule: 'daily',
        timeOfDay: quickAddData.timeOfDay
      });
    }
    
    setShowQuickAddModal(false);
    setQuickAddData({
      name: '',
      dosage: '',
      duration: 10,
      timeOfDay: 'morning'
    });
  };

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await askAIQuestion(aiQuestion);
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Sorry, I encountered an error processing your question.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const recs = await generateSupplementRecommendations();
      setRecommendations(recs);
      setShowRecommendationsModal(true);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      // Show error state but still open modal with fallback content
      setRecommendations({
        error: true,
        message: 'Unable to generate AI recommendations at this time. Please try again later.'
      });
      setShowRecommendationsModal(true);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Calendar,
      label: 'View Schedule',
      color: 'text-primary-500',
      action: () => navigate('/schedule')
    },
    {
      icon: Plus,
      label: 'Quick Add',
      color: 'text-secondary-500',
      action: () => setShowQuickAddModal(true)
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      color: 'text-success',
      action: () => navigate('/analytics')
    },
    {
      icon: History,
      label: 'History',
      color: 'text-warning',
      action: () => navigate('/history')
    }
  ];

  // AI-specific actions
  const aiActions = [
    {
      icon: MessageCircle,
      label: 'Ask AI',
      color: 'text-primary-500',
      action: () => setShowAIModal(true),
      disabled: !state.aiEnabled
    },
    {
      icon: Lightbulb,
      label: 'Get Recommendations',
      color: 'text-secondary-500',
      action: handleGetRecommendations,
      disabled: !state.aiEnabled,
      loading: recommendationsLoading
    }
  ];

  // Show loading state if not initialized
  if (!state.initialized) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">Supplements</h3>
              <p className="text-2xl font-bold text-primary-500">
                {supplementsCompleted}/{supplementsTotal}
              </p>
              <p className="text-sm text-gray-400">Completed today</p>
            </div>
            <ProgressCircle
              progress={supplementsPercent}
              size={60}
              color="#20C997"
            >
              <span className="text-xs md:text-sm font-semibold text-white">
                {supplementsPercent}%
              </span>
            </ProgressCircle>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">Wellness</h3>
              <p className="text-2xl font-bold text-secondary-500">
                {wellnessCompleted}/{wellnessTotal}
              </p>
              <p className="text-sm text-gray-400">Completed today</p>
            </div>
            <ProgressCircle
              progress={wellnessPercent}
              size={60}
              color="#845EF7"
            >
              <span className="text-xs md:text-sm font-semibold text-white">
                {wellnessPercent}%
              </span>
            </ProgressCircle>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">Adherence</h3>
              <p className="text-2xl font-bold text-success">
                {adherencePercent}%
              </p>
              <p className="text-sm text-gray-400">Overall completion</p>
            </div>
            <ProgressCircle
              progress={adherencePercent}
              size={60}
              color="#37B24D"
            >
              <span className="text-xs md:text-sm font-semibold text-white">
                {adherencePercent}%
              </span>
            </ProgressCircle>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      {state.aiEnabled && state.aiInsights && (
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            {state.aiLoading && (
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {state.aiInsights.insights?.map((insight: string, index: number) => (
                  <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {state.aiInsights.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex flex-col items-center space-y-2 p-3 md:p-4 bg-surface-raised rounded-xl hover:bg-surface-overlay transition-colors group"
            >
              <action.icon className={`w-5 h-5 md:w-6 md:h-6 ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs md:text-sm text-gray-400 group-hover:text-white text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* AI Actions */}
      {state.aiEnabled && (
        <Card>
          <h3 className="text-base md:text-lg font-semibold text-white mb-4">AI Assistant</h3>
          <div className="grid grid-cols-2 gap-4">
            {aiActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={action.disabled || action.loading || aiLoading}
                className="flex flex-col items-center space-y-2 p-3 md:p-4 bg-surface-raised rounded-xl hover:bg-surface-overlay transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {action.loading ? (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <action.icon className={`w-5 h-5 md:w-6 md:h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                )}
                <span className="text-xs md:text-sm text-gray-400 group-hover:text-white text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Add Modal */}
      <Modal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        title="Quick Add"
      >
        <div className="space-y-4">
          <div className="flex bg-surface-raised rounded-xl p-1">
            <button
              onClick={() => setQuickAddType('supplement')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                quickAddType === 'supplement'
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Supplement
            </button>
            <button
              onClick={() => setQuickAddType('wellness')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                quickAddType === 'wellness'
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Wellness
            </button>
          </div>

          <Input
            label="Name"
            value={quickAddData.name}
            onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
            placeholder={quickAddType === 'supplement' ? 'e.g., Vitamin D3' : 'e.g., Morning Walk'}
            required
          />

          {quickAddType === 'supplement' ? (
            <Input
              label="Dosage"
              value={quickAddData.dosage}
              onChange={(e) => setQuickAddData({ ...quickAddData, dosage: e.target.value })}
              placeholder="e.g., 1000 IU"
              required
            />
          ) : (
            <Input
              label="Duration (minutes)"
              type="number"
              value={quickAddData.duration}
              onChange={(e) => setQuickAddData({ ...quickAddData, duration: parseInt(e.target.value) })}
              min="1"
              required
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time of Day</label>
            <select
              value={quickAddData.timeOfDay}
              onChange={(e) => setQuickAddData({ ...quickAddData, timeOfDay: e.target.value })}
              className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleQuickAdd} className="flex-1">
              Add {quickAddType === 'supplement' ? 'Supplement' : 'Activity'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowQuickAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Question Modal */}
      <Modal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="Ask AI Assistant"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Question</label>
            <textarea
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ask about your supplements, wellness routine, or get personalized advice..."
              rows={3}
            />
          </div>

          {aiResponse && (
            <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay">
              <h4 className="text-sm font-medium text-gray-300 mb-2">AI Response:</h4>
              <p className="text-gray-300 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button 
              onClick={handleAIQuestion} 
              loading={aiLoading}
              disabled={!aiQuestion.trim()}
              className="flex-1"
            >
              Ask AI
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAIModal(false);
                setAiQuestion('');
                setAiResponse('');
              }}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Recommendations Modal */}
      <Modal
        isOpen={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        title="AI Supplement Recommendations"
        size="lg"
      >
        {recommendationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Generating personalized recommendations...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        ) : recommendations?.error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Recommendations Unavailable</h3>
            <p className="text-gray-400 mb-6">{recommendations.message}</p>
            <div className="flex space-x-3">
              <Button
                onClick={handleGetRecommendations}
                loading={recommendationsLoading}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowRecommendationsModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        ) : recommendations && (
          <div className="space-y-6">
            {/* AI Status Indicator */}
            <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">AI-Powered Analysis</h4>
                  <p className="text-sm text-gray-400">Based on your current routine and wellness goals</p>
                </div>
              </div>
            </div>

            {recommendations.gaps && recommendations.gaps.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Potential Gaps</h4>
                <p className="text-sm text-gray-400 mb-4">Areas where your current routine might benefit from additional support</p>
                <ul className="space-y-2">
                  {recommendations.gaps.map((gap: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-300">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.optimizations && recommendations.optimizations.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Optimizations</h4>
                <p className="text-sm text-gray-400 mb-4">Ways to improve your current supplement routine</p>
                <ul className="space-y-2">
                  {recommendations.optimizations.map((opt: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-300">{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.newSuggestions && recommendations.newSuggestions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">New Suggestions</h4>
                <p className="text-sm text-gray-400 mb-4">Evidence-based supplements that align with your goals</p>
                <div className="space-y-3">
                  {recommendations.newSuggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="bg-surface-raised rounded-xl p-4 border border-surface-overlay">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-white">{suggestion.name}</h5>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setQuickAddType('supplement');
                            setQuickAddData({
                              name: suggestion.name,
                              dosage: suggestion.dosage || '',
                              duration: 10,
                              timeOfDay: suggestion.timing || 'morning'
                            });
                            setShowRecommendationsModal(false);
                            setShowQuickAddModal(true);
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{suggestion.reason}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {suggestion.timing && <span>Timing: {suggestion.timing}</span>}
                        {suggestion.dosage && <span>Dosage: {suggestion.dosage}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No recommendations case */}
            {(!recommendations.gaps || recommendations.gaps.length === 0) &&
             (!recommendations.optimizations || recommendations.optimizations.length === 0) &&
             (!recommendations.newSuggestions || recommendations.newSuggestions.length === 0) && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Great Job!</h3>
                <p className="text-gray-400">Your current supplement routine looks well-balanced. Keep up the excellent work!</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4 border-t border-surface-raised">
              <Button
                onClick={handleGetRecommendations}
                variant="outline"
                loading={recommendationsLoading}
                className="flex-1"
              >
                Refresh Recommendations
              </Button>
              <Button
                onClick={() => setShowRecommendationsModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;