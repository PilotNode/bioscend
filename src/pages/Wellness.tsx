import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Heart } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { useApp } from '../contexts/AppContext';

const Wellness: React.FC = () => {
  const { state, addWellness, updateWellness, deleteWellness } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWellness, setEditingWellness] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 10,
    schedule: 'daily',
    timeOfDay: 'morning',
    specificTime: '',
    useSpecificTime: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const wellnessData = {
      ...formData,
      // If specific time is set, use it; otherwise use default time for timeOfDay
      specificTime: formData.useSpecificTime ? formData.specificTime : ''
    };
    
    if (editingWellness) {
      await updateWellness({ ...editingWellness, ...wellnessData });
    } else {
      await addWellness(wellnessData);
    }
    
    setIsModalOpen(false);
    setEditingWellness(null);
    setFormData({
      name: '',
      description: '',
      duration: 10,
      schedule: 'daily',
      timeOfDay: 'morning',
      specificTime: '',
      useSpecificTime: false
    });
  };

  const handleEdit = (wellness: any) => {
    setEditingWellness(wellness);
    setFormData({
      name: wellness.name,
      description: wellness.description,
      duration: wellness.duration,
      schedule: wellness.schedule,
      timeOfDay: wellness.timeOfDay,
      specificTime: wellness.specificTime || '',
      useSpecificTime: !!wellness.specificTime
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this wellness activity?')) {
      await deleteWellness(id);
    }
  };

  const handleTimeToggle = (useSpecific: boolean) => {
    setFormData({
      ...formData,
      useSpecificTime: useSpecific,
      specificTime: useSpecific ? formData.specificTime : ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wellness</h1>
          <p className="text-gray-400 mt-1">Manage your wellness activities</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Wellness Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {state.wellness.map((wellness) => (
          <Card key={wellness.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white">{wellness.name}</h3>
                  <p className="text-sm text-gray-400">{wellness.duration} minutes</p>
                </div>
              </div>
              <div className="flex space-x-1 md:space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(wellness)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(wellness.id)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-error hover:bg-surface-raised rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-400">{wellness.description}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="capitalize">{wellness.schedule}</span>
                <span>•</span>
                <span className="capitalize">
                  {wellness.specificTime ? (
                    <span className="text-secondary-400 font-medium">
                      {wellness.specificTime} ({wellness.timeOfDay})
                    </span>
                  ) : (
                    wellness.timeOfDay
                  )}
                </span>
              </div>
            </div>
          </Card>
        ))}
        
        {state.wellness.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No wellness activities yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first wellness activity</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Activity
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWellness(null);
          setFormData({
            name: '',
            description: '',
            duration: 10,
            schedule: 'daily',
            timeOfDay: 'morning',
            specificTime: '',
            useSpecificTime: false
          });
        }}
        title={editingWellness ? 'Edit Wellness Activity' : 'Add Wellness Activity'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Activity Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning Meditation"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief description of the activity"
              rows={3}
            />
          </div>
          
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            min="1"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time of Day</label>
              <select
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          {/* Specific Time Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="useSpecificTime"
                checked={formData.useSpecificTime}
                onChange={(e) => handleTimeToggle(e.target.checked)}
                className="w-4 h-4 text-primary-500 bg-surface-raised border-surface-overlay rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="useSpecificTime" className="text-sm font-medium text-gray-300">
                Set specific time
              </label>
            </div>
            
            {formData.useSpecificTime && (
              <div>
                <Input
                  label="Specific Time"
                  type="time"
                  value={formData.specificTime}
                  onChange={(e) => setFormData({ ...formData, specificTime: e.target.value })}
                  required={formData.useSpecificTime}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will override the default time for "{formData.timeOfDay}" but still appear in the {formData.timeOfDay} section
                </p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingWellness ? 'Update' : 'Add'} Activity
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Wellness;