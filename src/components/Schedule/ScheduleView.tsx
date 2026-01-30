import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { useApp } from '../../contexts/AppContext';
import { useState } from 'react';

interface ScheduleViewProps {
  view: 'day' | 'week' | 'month' | 'list';
  selectedDate: Date;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ view, selectedDate }) => {
  const { generateScheduleForDate, getScheduleItemsForDate, toggleScheduleItemCompletion, state, getTimeBlock } = useApp();
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const scheduleItems = getScheduleItemsForDate(dateStr);

  // Generate schedule items when date changes and we have data
  useEffect(() => {
    // Only generate if we have supplements or wellness data and the app is initialized
    if (state.initialized && (state.supplements.length > 0 || state.wellness.length > 0)) {
      console.log('Generating schedule for date:', dateStr);
      generateScheduleForDate(dateStr);
    }
  }, [dateStr, state.initialized, state.supplements.length, state.wellness.length, generateScheduleForDate]);

  const handleToggleCompletion = async (item: any) => {
    if (item.completed) {
      // Show confirmation modal for undoing
      setSelectedItem(item);
      setShowUndoModal(true);
    } else {
      // Mark as completed immediately
      await toggleScheduleItemCompletion(item.id);
    }
  };

  const handleUndoCompletion = async () => {
    if (!selectedItem) return;
    
    await toggleScheduleItemCompletion(selectedItem.id);
    
    setShowUndoModal(false);
    setSelectedItem(null);
  };

  const getTimeBlocks = () => {
    // Group items by their time block (morning, afternoon, evening)
    // but use the actual time for sorting within each block
    const morning = scheduleItems.filter(item => {
      const timeBlock = getTimeBlock(item.time);
      return timeBlock === 'morning';
    });
    
    const afternoon = scheduleItems.filter(item => {
      const timeBlock = getTimeBlock(item.time);
      return timeBlock === 'afternoon';
    });
    
    const evening = scheduleItems.filter(item => {
      const timeBlock = getTimeBlock(item.time);
      return timeBlock === 'evening';
    });

    // Sort each block by actual time
    morning.sort((a, b) => a.time.localeCompare(b.time));
    afternoon.sort((a, b) => a.time.localeCompare(b.time));
    evening.sort((a, b) => a.time.localeCompare(b.time));

    return { morning, afternoon, evening };
  };

  const renderTimeBlock = (title: string, items: any[], icon: React.ReactNode) => (
    <Card className="mb-6">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-base md:text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400">
          {items.filter(i => i.completed).length}/{items.length} completed
        </span>
      </div>
      
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">No activities scheduled</p>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className={`flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl border transition-all duration-200 ${
                item.completed
                  ? 'bg-surface-raised border-primary-500/30 opacity-75'
                  : 'bg-surface-base border-surface-overlay hover:border-surface-raised'
              }`}
            >
              <button
                onClick={() => handleToggleCompletion(item)}
                className="flex-shrink-0"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 hover:text-primary-500 transition-colors" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm md:text-base font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {item.name}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.itemType === 'supplement' 
                      ? 'bg-primary-500/20 text-primary-400' 
                      : 'bg-secondary-500/20 text-secondary-400'
                  }`}>
                    {item.itemType}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{item.details}</p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );

  if (view === 'list') {
    return (
      <div className="space-y-4">
        {scheduleItems.map(item => (
          <Card key={item.id} hover>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleToggleCompletion(item)}
                className="flex-shrink-0"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 hover:text-primary-500 transition-colors" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {item.name}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.itemType === 'supplement' 
                      ? 'bg-primary-500/20 text-primary-400' 
                      : 'bg-secondary-500/20 text-secondary-400'
                  }`}>
                    {item.itemType}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{item.details}</p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{item.time}</span>
              </div>
            </div>
          </Card>
        ))}
        
        {scheduleItems.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No schedule for this day</h3>
              <p className="text-gray-500 mb-4">Add supplements or wellness activities to get started</p>
            </div>
          </Card>
        )}

        {/* Undo Completion Modal */}
        <Modal
          isOpen={showUndoModal}
          onClose={() => setShowUndoModal(false)}
          title="Mark as Undone"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to mark "{selectedItem?.name}" as undone?
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={handleUndoCompletion}
                className="flex-1"
              >
                Yes, Mark Undone
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowUndoModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  const { morning, afternoon, evening } = getTimeBlocks();

  return (
    <div className="space-y-6">
      {renderTimeBlock(
        'Morning',
        morning,
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-white" />
        </div>
      )}
      
      {renderTimeBlock(
        'Afternoon',
        afternoon,
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-white" />
        </div>
      )}
      
      {renderTimeBlock(
        'Evening',
        evening,
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Undo Completion Modal */}
      <Modal
        isOpen={showUndoModal}
        onClose={() => setShowUndoModal(false)}
        title="Mark as Undone"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to mark "{selectedItem?.name}" as undone?
          </p>
          <div className="flex space-x-3">
            <Button 
              onClick={handleUndoCompletion}
              className="flex-1"
            >
              Yes, Mark Undone
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowUndoModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleView;