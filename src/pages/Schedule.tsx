import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, List, BarChart3 } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import ScheduleView from '../components/Schedule/ScheduleView';

const Schedule: React.FC = () => {
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'list'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const viewTabs = [
    { key: 'day', label: 'Day', icon: Calendar },
    { key: 'week', label: 'Week', icon: BarChart3 },
    { key: 'month', label: 'Month', icon: BarChart3 },
    { key: 'list', label: 'List', icon: List }
  ];

  const navigateDate = (direction: 'prev' | 'next') => {
    if (currentView === 'day') {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
    } else if (currentView === 'week') {
      setSelectedDate(direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1));
    }
  };

  const getDateRangeText = () => {
    switch (currentView) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'list':
        return 'All Activities';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Schedule</h1>
          <p className="text-gray-400 mt-1">Manage your daily routine</p>
        </div>
        
        {/* View Tabs */}
        <div className="hidden md:flex bg-surface-raised rounded-xl p-1">
          {viewTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentView === tab.key
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Mobile View Selector */}
        <div className="md:hidden">
          <select
            value={currentView}
            onChange={(e) => setCurrentView(e.target.value as any)}
            className="px-3 py-2 bg-surface-raised border border-surface-overlay rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {viewTabs.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors touch-manipulation"
              disabled={currentView === 'list'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-sm md:text-lg font-semibold text-white min-w-[150px] md:min-w-[200px] text-center">
              {getDateRangeText()}
            </h2>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors touch-manipulation"
              disabled={currentView === 'list'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
            disabled={currentView === 'list'}
          >
            Today
          </Button>
        </div>
      </Card>

      {/* Schedule Content */}
      <ScheduleView view={currentView} selectedDate={selectedDate} />
    </div>
  );
};

export default Schedule;