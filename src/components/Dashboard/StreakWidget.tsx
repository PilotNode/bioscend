import React, { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Flame, CheckCircle2 } from 'lucide-react';
import Card from '../UI/Card';
import { useApp } from '../../contexts/AppContext';

const StreakWidget: React.FC = () => {
  const { state, getScheduleItemsForDate } = useApp();

  // Calculate the current streak based on consecutive days with ≥1 completion
  const { currentStreak, weekData } = useMemo(() => {
    const today = new Date();
    let streak = 0;

    // Walk backwards from yesterday (today is still in progress)
    // If today has completions, count it too
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayItems = getScheduleItemsForDate(todayStr);
    const todayCompleted = todayItems.filter(i => i.completed).length;
    const todayActive = todayCompleted > 0;

    if (todayActive) {
      streak = 1;
    }

    // Check previous days
    for (let i = 1; i <= 365; i++) {
      const checkDate = subDays(today, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      // Check history entries for this date
      const dayHistory = state.history.filter(entry => entry.date === dateStr);
      
      if (dayHistory.length > 0) {
        streak++;
      } else {
        // If today wasn't active, reset streak for the first gap
        // If today was active but yesterday was a gap, streak is just 1
        if (i === 1 && !todayActive) {
          streak = 0;
        }
        break;
      }
    }

    // Build weekly data for the last 7 days
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayHistory = state.history.filter(entry => entry.date === dateStr);
      const scheduleItems = getScheduleItemsForDate(dateStr);
      const totalTasks = scheduleItems.length;
      const completedTasks = i === 0
        ? scheduleItems.filter(item => item.completed).length
        : dayHistory.length;

      week.push({
        date,
        dayLabel: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        isToday: i === 0,
        hasCompletions: completedTasks > 0,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      });
    }

    return { currentStreak: streak, weekData: week };
  }, [state.history, state.scheduleItems, getScheduleItemsForDate]);

  const streakMessage = currentStreak === 0
    ? 'Start your streak today!'
    : currentStreak === 1
      ? 'Great start! Keep it going.'
      : currentStreak < 7
        ? `${currentStreak} days strong! 💪`
        : currentStreak < 30
          ? `On fire! ${currentStreak} day streak! 🔥`
          : `Legendary ${currentStreak} day streak! 🏆`;

  return (
    <Card className="relative overflow-hidden">
      {/* Subtle gradient overlay for visual flair */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              currentStreak > 0
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-surface-raised'
            }`}>
              <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-white">Streak</h3>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${
              currentStreak > 0 ? 'text-primary-500' : 'text-gray-500'
            }`}>
              {currentStreak}
            </span>
            <span className="text-xs text-gray-400 ml-1">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Weekly Calendar Row */}
        <div className="flex items-center justify-between mb-4">
          {weekData.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-1"
            >
              <span className={`text-[10px] uppercase tracking-wider ${
                day.isToday ? 'text-primary-500 font-bold' : 'text-gray-500'
              }`}>
                {day.dayLabel}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  day.isToday
                    ? day.hasCompletions
                      ? 'bg-primary-500 text-white shadow-glow ring-2 ring-primary-500/30'
                      : 'border-2 border-primary-500 text-primary-500'
                    : day.hasCompletions
                      ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/30'
                      : 'bg-surface-raised text-gray-500'
                }`}
              >
                {day.hasCompletions ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  day.dayNum
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        <p className="text-sm text-gray-400 text-center">{streakMessage}</p>
      </div>
    </Card>
  );
};

export default StreakWidget;
