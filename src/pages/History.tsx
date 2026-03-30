import React, { useState, useEffect } from 'react';
import { Calendar, Search, CheckCircle2, Clock, Pill, Heart, TrendingUp } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import { useApp } from '../contexts/AppContext';

const History: React.FC = () => {
  const { state, getHistoryForDateRange } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'supplement' | 'wellness'>('all');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);

  useEffect(() => {
    // Calculate date range
    const today = new Date();
    const daysBack = parseInt(dateRange);
    const startDate = format(subDays(today, daysBack), 'yyyy-MM-dd');
    const endDate = format(today, 'yyyy-MM-dd');
    
    // Get history for date range
    let history = getHistoryForDateRange(startDate, endDate);
    
    // Apply filters
    if (searchTerm) {
      history = history.filter(entry => 
        entry.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      history = history.filter(entry => entry.itemType === filterType);
    }
    
    setFilteredHistory(history);
  }, [state.history, searchTerm, filterType, dateRange, getHistoryForDateRange]);

  // Group history by date
  const groupedHistory = filteredHistory.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, any[]>);

  const getTypeIcon = (type: 'supplement' | 'wellness') => {
    return type === 'supplement' ? (
      <Pill className="w-4 h-4 text-primary-500" />
    ) : (
      <Heart className="w-4 h-4 text-secondary-500" />
    );
  };

  const formatCompletionTime = (_completedAt: Date, originalTime: string, actualTime: string, onTime?: boolean) => {
    // If the stored onTime flag is available (new entries), use it
    if (onTime === true) return { text: 'On time', color: 'text-success' };
    if (onTime === false) {
      // Show how late/early they were
      const diff = (new Date(`2000-01-01 ${actualTime}`).getTime() - new Date(`2000-01-01 ${originalTime}`).getTime()) / 60000;
      const absDiff = Math.abs(diff);
      return absDiff >= 60
        ? { text: `${Math.round(absDiff / 60)}h late`, color: 'text-error' }
        : { text: `${Math.round(absDiff)}m late`, color: 'text-warning' };
    }
    // Legacy entries without onTime: fall back to simple 15-minute comparison
    const timeDiff = Math.abs(
      new Date(`2000-01-01 ${actualTime}`).getTime() -
      new Date(`2000-01-01 ${originalTime}`).getTime()
    ) / (1000 * 60);
    if (timeDiff <= 15) return { text: 'On time', color: 'text-success' };
    if (timeDiff <= 60) return { text: `${Math.round(timeDiff)}m late`, color: 'text-warning' };
    return { text: `${Math.round(timeDiff / 60)}h late`, color: 'text-error' };
  };

  // Calculate summary stats
  const totalEntries = filteredHistory.length;
  const supplementEntries = filteredHistory.filter(h => h.itemType === 'supplement').length;
  const wellnessEntries = filteredHistory.filter(h => h.itemType === 'wellness').length;
  const onTimeEntries = filteredHistory.filter(h => h.metadata?.onTime === true).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">History</h1>
        <p className="text-gray-400 mt-1">Review your completed activities and progress</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-white">{totalEntries}</p>
              <p className="text-xs md:text-sm text-gray-400">Total Completed</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Pill className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-white">{supplementEntries}</p>
              <p className="text-xs md:text-sm text-gray-400">Supplements</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-white">{wellnessEntries}</p>
              <p className="text-xs md:text-sm text-gray-400">Wellness</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-success rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-white">
                {totalEntries > 0 ? Math.round((onTimeEntries / totalEntries) * 100) : 0}%
              </p>
              <p className="text-xs md:text-sm text-gray-400">On Time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="supplement">Supplements</option>
              <option value="wellness">Wellness</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setDateRange('30');
              }}
              className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-gray-400 hover:text-white hover:bg-surface-overlay transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* History Items */}
      <div className="space-y-6">
        {(Object.entries(groupedHistory) as [string, any[]][]).map(([date, entries]) => (
          <div key={date}>
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">
                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="flex-1 h-px bg-surface-raised"></div>
              <span className="text-sm text-gray-400">
                {entries.length} completed
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map(entry => {
                const timing = formatCompletionTime(
                  entry.completedAt,
                  entry.metadata.originalTime,
                  entry.metadata.actualCompletionTime,
                  entry.metadata.onTime
                );
                
                return (
                  <Card key={entry.id} hover>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(entry.itemType)}
                          <div>
                            <h4 className="font-medium text-white">{entry.name}</h4>
                            <p className="text-sm text-gray-400">{entry.details}</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">
                            {entry.metadata.actualCompletionTime}
                          </span>
                        </div>
                        <span className={`font-medium ${timing.color}`}>
                          {timing.text}
                        </span>
                      </div>
                      
                      {entry.metadata.dosage && (
                        <div className="text-xs text-gray-500">
                          Dosage: {entry.metadata.dosage}
                          {entry.metadata.quantity && ` • ${entry.metadata.quantity} ${entry.metadata.quantity > 1 ? 'pills' : 'pill'}`}
                        </div>
                      )}
                      
                      {entry.metadata.duration && (
                        <div className="text-xs text-gray-500">
                          Duration: {entry.metadata.duration} minutes
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        
        {Object.keys(groupedHistory).length === 0 && (
          <Card>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No history found</h3>
              <p className="text-gray-500 mb-4">
                {filteredHistory.length === 0 && state.history.length > 0
                  ? 'Try adjusting your filters to see more results'
                  : 'Complete some activities to start building your history'
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;