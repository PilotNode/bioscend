import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Pill } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import { useApp } from '../contexts/AppContext';

const Supplements: React.FC = () => {
  const { state, addSupplement, updateSupplement, deleteSupplement } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    quantity: 1,
    daysOfWeek: [] as number[], // empty = every day
    timeOfDay: 'morning',
    specificTime: '',
    useSpecificTime: false
  });

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter(d => d !== dayIndex)
        : [...prev.daysOfWeek, dayIndex].sort()
    }));
  };

  const isEveryDay = (days: number[]) => days.length === 0;

  const formatDays = (days: number[]) => {
    if (isEveryDay(days)) return 'Every day';
    if (days.length === 7) return 'Every day';
    return days.map(d => DAY_LABELS[d]).join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplementData = {
      ...formData,
      // If specific time is set, use it; otherwise use default time for timeOfDay
      specificTime: formData.useSpecificTime ? formData.specificTime : ''
    };
    
    if (editingSupplement) {
      await updateSupplement({ ...editingSupplement, ...supplementData });
    } else {
      await addSupplement(supplementData);
    }
    
    setIsModalOpen(false);
    setEditingSupplement(null);
    setFormData({
      name: '',
      dosage: '',
      quantity: 1,
      daysOfWeek: [],
      timeOfDay: 'morning',
      specificTime: '',
      useSpecificTime: false
    });
  };

  const handleEdit = (supplement: any) => {
    setEditingSupplement(supplement);
    setFormData({
      name: supplement.name,
      dosage: supplement.dosage,
      quantity: supplement.quantity,
      daysOfWeek: supplement.daysOfWeek || [],
      timeOfDay: supplement.timeOfDay,
      specificTime: supplement.specificTime || '',
      useSpecificTime: !!supplement.specificTime
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteSupplement(deleteTarget);
      setDeleteTarget(null);
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
          <h1 className="text-2xl font-bold text-white">Supplements</h1>
          <p className="text-gray-400 mt-1">Manage your supplement routine</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Supplement
        </Button>
      </div>

      {/* Supplements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {state.supplements.map((supplement) => (
          <Card key={supplement.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white">{supplement.name}</h3>
                  <p className="text-sm text-gray-400">{supplement.dosage}</p>
                </div>
              </div>
              <div className="flex space-x-1 md:space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(supplement)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(supplement.id)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-error hover:bg-surface-raised rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{formatDays(supplement.daysOfWeek || [])}</span>
              </div>
            </div>
          </Card>
        ))}
        
        {state.supplements.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Pill className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No supplements yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first supplement to track</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Supplement
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplement(null);
          setFormData({
            name: '',
            dosage: '',
            quantity: 1,
            daysOfWeek: [],
            timeOfDay: 'morning',
            specificTime: '',
            useSpecificTime: false
          });
        }}
        title={editingSupplement ? 'Edit Supplement' : 'Add Supplement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Supplement Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Vitamin D3"
            required
          />
          
          <Input
            label="Dosage"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="e.g., 1000 IU"
            required
          />
          
          <Input
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            min="1"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
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

          {/* Day-of-week picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Days &nbsp;<span className="text-gray-500 font-normal">(leave all off = every day)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    formData.daysOfWeek.includes(i)
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-surface-raised border-surface-overlay text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatDays(formData.daysOfWeek)}</p>
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
              {editingSupplement ? 'Update' : 'Add'} Supplement
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Supplement"
        message="Are you sure you want to delete this supplement? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
      />
    </div>
  );
};

export default Supplements;