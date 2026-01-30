import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../UI/Card';
import ProgressCircle from '../UI/ProgressCircle';

interface MetricData {
  current: number;
  previous: number;
  label: string;
  color: string;
}

interface AdherenceMetricsProps {
  metrics: {
    overall: MetricData;
    supplements: MetricData;
    wellness: MetricData;
    streak: {
      current: number;
      best: number;
    };
  };
}

const AdherenceMetrics: React.FC<AdherenceMetricsProps> = ({ metrics }) => {
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-success" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-error" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendText = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff === 0) return 'No change';
    const direction = diff > 0 ? 'up' : 'down';
    return `${Math.abs(diff)}% ${direction}`;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-success';
    if (current < previous) return 'text-error';
    return 'text-gray-400';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {/* Overall Adherence */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-300">Overall Adherence</h3>
            <p className="text-lg md:text-2xl font-bold text-white">{metrics.overall.current}%</p>
          </div>
          <ProgressCircle
            progress={metrics.overall.current}
            size={50}
            color={metrics.overall.color}
          />
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
          {getTrendIcon(metrics.overall.current, metrics.overall.previous)}
          <span className={getTrendColor(metrics.overall.current, metrics.overall.previous)}>
            {getTrendText(metrics.overall.current, metrics.overall.previous)}
          </span>
          <span className="text-gray-400 hidden md:inline">vs last week</span>
        </div>
      </Card>

      {/* Supplements */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-300">Supplements</h3>
            <p className="text-lg md:text-2xl font-bold text-white">{metrics.supplements.current}%</p>
          </div>
          <ProgressCircle
            progress={metrics.supplements.current}
            size={50}
            color={metrics.supplements.color}
          />
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
          {getTrendIcon(metrics.supplements.current, metrics.supplements.previous)}
          <span className={getTrendColor(metrics.supplements.current, metrics.supplements.previous)}>
            {getTrendText(metrics.supplements.current, metrics.supplements.previous)}
          </span>
          <span className="text-gray-400 hidden md:inline">vs last week</span>
        </div>
      </Card>

      {/* Wellness */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-300">Wellness</h3>
            <p className="text-lg md:text-2xl font-bold text-white">{metrics.wellness.current}%</p>
          </div>
          <ProgressCircle
            progress={metrics.wellness.current}
            size={50}
            color={metrics.wellness.color}
          />
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
          {getTrendIcon(metrics.wellness.current, metrics.wellness.previous)}
          <span className={getTrendColor(metrics.wellness.current, metrics.wellness.previous)}>
            {getTrendText(metrics.wellness.current, metrics.wellness.previous)}
          </span>
          <span className="text-gray-400 hidden md:inline">vs last week</span>
        </div>
      </Card>

      {/* Streak */}
      <Card>
        <div className="mb-4">
          <h3 className="text-xs md:text-sm font-medium text-gray-300">Current Streak</h3>
          <p className="text-lg md:text-2xl font-bold text-white">{metrics.streak.current}</p>
          <p className="text-xs md:text-sm text-gray-400">days</p>
        </div>
        <div className="pt-2 border-t border-surface-raised">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-gray-400">Best streak:</span>
            <span className="text-warning font-medium">{metrics.streak.best} days</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdherenceMetrics;