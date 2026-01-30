import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { format, subDays } from 'date-fns';
import Card from '../components/UI/Card';
import ProgressChart from '../components/Analytics/ProgressChart';
import AdherenceMetrics from '../components/Analytics/AdherenceMetrics';
import { useApp } from '../contexts/AppContext';

const Analytics: React.FC = () => {
  const { state, getAnalyticsData } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    generateAnalyticsData();
  }, [state.history, state.scheduleItems, timeRange, getAnalyticsData]);

  const generateAnalyticsData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const data = getAnalyticsData(days);
    
    setChartData(data);
    
    // Calculate metrics for current vs previous period
    const currentPeriodData = data.slice(-7); // Last 7 days
    const previousPeriodData = data.slice(-14, -7); // Previous 7 days
    
    const calculateAverage = (periodData: any[], key: string) => {
      if (periodData.length === 0) return 0;
      return Math.round(periodData.reduce((sum, day) => sum + day[key], 0) / periodData.length);
    };
    
    const currentAdherence = calculateAverage(currentPeriodData, 'adherence');
    const previousAdherence = calculateAverage(previousPeriodData, 'adherence');
    
    const currentSupplements = calculateAverage(currentPeriodData, 'supplements');
    const previousSupplements = calculateAverage(previousPeriodData, 'supplements');
    
    const currentWellness = calculateAverage(currentPeriodData, 'wellness');
    const previousWellness = calculateAverage(previousPeriodData, 'wellness');
    
    // Calculate streak from history
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].adherence >= 80) {
        tempStreak++;
        if (i === data.length - 1) currentStreak = tempStreak;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
    
    setMetrics({
      overall: {
        current: currentAdherence,
        previous: previousAdherence,
        label: 'Overall',
        color: '#20C997'
      },
      supplements: {
        current: currentSupplements,
        previous: previousSupplements,
        label: 'Supplements',
        color: '#20C997'
      },
      wellness: {
        current: currentWellness,
        previous: previousWellness,
        label: 'Wellness',
        color: '#845EF7'
      },
      streak: {
        current: currentStreak,
        best: bestStreak
      }
    });
  };

  const timeRangeOptions = [
    { key: 'week', label: '7 Days' },
    { key: 'month', label: '30 Days' },
    { key: 'quarter', label: '90 Days' }
  ];

  // Calculate additional insights from history
  const totalCompletions = state.history.length;
  const supplementCompletions = state.history.filter(h => h.itemType === 'supplement').length;
  const wellnessCompletions = state.history.filter(h => h.itemType === 'wellness').length;
  
  // Calculate on-time completion rate
  const onTimeCompletions = state.history.filter(h => {
    const timeDiff = Math.abs(
      new Date(`2000-01-01 ${h.metadata.actualCompletionTime}`).getTime() - 
      new Date(`2000-01-01 ${h.metadata.originalTime}`).getTime()
    ) / (1000 * 60);
    return timeDiff <= 15;
  }).length;
  
  const onTimeRate = totalCompletions > 0 ? Math.round((onTimeCompletions / totalCompletions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Track your progress and insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-surface-raised rounded-xl p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeRange(option.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                timeRange === option.key
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && <AdherenceMetrics metrics={metrics} />}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{totalCompletions}</p>
            <p className="text-sm text-gray-400">Total Completions</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{onTimeRate}%</p>
            <p className="text-sm text-gray-400">On-Time Rate</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{supplementCompletions}</p>
            <p className="text-sm text-gray-400">Supplements Taken</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{wellnessCompletions}</p>
            <p className="text-sm text-gray-400">Wellness Sessions</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherence Trend */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Adherence Trend</h3>
          </div>
          <ProgressChart
            data={chartData}
            type="line"
            dataKey="adherence"
            color="#20C997"
            title="Adherence"
          />
        </Card>

        {/* Completion Breakdown */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Daily Completions</h3>
          </div>
          <ProgressChart
            data={chartData}
            type="bar"
            dataKey="completed"
            color="#845EF7"
            title="Tasks Completed"
          />
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplements Trend */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Supplements Progress</h3>
          </div>
          <ProgressChart
            data={chartData}
            type="line"
            dataKey="supplements"
            color="#20C997"
            title="Supplements"
          />
        </Card>

        {/* Wellness Trend */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Wellness Progress</h3>
          </div>
          <ProgressChart
            data={chartData}
            type="line"
            dataKey="wellness"
            color="#845EF7"
            title="Wellness"
          />
        </Card>
      </div>
    </div>
  );
};

export default Analytics;