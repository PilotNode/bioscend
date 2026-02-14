import React, { useState, useEffect } from 'react';
import { User, Edit2, Save, X, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import ProgressCircle from '../components/UI/ProgressCircle';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { state, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    height: '',
    weight: '',
    goals: '',
    timezone: 'UTC',
    ageGroup: '',
    currentSupplementLevel: '',
    preferredActivities: '',
    schedulePreference: ''
  });

  // Load profile data from state when it changes
  useEffect(() => {
    if (state.profile) {
      setProfileData({
        firstName: state.profile.firstName || '',
        lastName: state.profile.lastName || '',
        age: state.profile.age || '',
        height: state.profile.height || '',
        weight: state.profile.weight || '',
        goals: state.profile.goals || '',
        timezone: state.profile.timezone || 'UTC',
        ageGroup: state.profile.ageGroup || '',
        currentSupplementLevel: state.profile.currentSupplementLevel || '',
        preferredActivities: state.profile.preferredActivities || '',
        schedulePreference: state.profile.schedulePreference || ''
      });
    }
  }, [state.profile]);

  // Calculate stats
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayCompletions = state.completions.filter(c => c.date === todayStr);
  const totalTasks = state.supplements.length + state.wellness.length;
  const completedTasks = todayCompletions.length;
  const adherencePercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = state.completions.filter(c => c.date === dateStr);
      const dayAdherence = totalTasks > 0 ? (dayCompletions.length / totalTasks) * 100 : 0;

      if (dayAdherence >= 80) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const handleSave = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current state
    if (state.profile) {
      setProfileData({
        firstName: state.profile.firstName || '',
        lastName: state.profile.lastName || '',
        age: state.profile.age || '',
        height: state.profile.height || '',
        weight: state.profile.weight || '',
        goals: state.profile.goals || '',
        timezone: state.profile.timezone || 'UTC',
        ageGroup: state.profile.ageGroup || '',
        currentSupplementLevel: state.profile.currentSupplementLevel || '',
        preferredActivities: state.profile.preferredActivities || '',
        schedulePreference: state.profile.schedulePreference || ''
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 mt-1">Manage your personal information and track your progress</p>
        </div>

        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        ) : (
          <div className="flex space-x-1 md:space-x-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {profileData.firstName || profileData.lastName
                    ? `${profileData.firstName} ${profileData.lastName}`.trim()
                    : user?.email?.split('@')[0] || 'User'
                  }
                </h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Age"
                type="number"
                value={profileData.age}
                onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                disabled={!isEditing}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
                <select
                  value={profileData.ageGroup}
                  onChange={(e) => setProfileData({ ...profileData, ageGroup: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select Age Group</option>
                  <option value="18-25">18-25 years</option>
                  <option value="26-35">26-35 years</option>
                  <option value="36-45">36-45 years</option>
                  <option value="46-55">46-55 years</option>
                  <option value="55+">55+ years</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Health Metrics */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Health Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Height (cm)"
                type="number"
                value={profileData.height}
                onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Weight (kg)"
                type="number"
                value={profileData.weight}
                onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </Card>

          {/* Goals */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Wellness Goals</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Goals</label>
              <textarea
                value={profileData.goals}
                onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                placeholder="Describe your wellness goals..."
                rows={4}
              />
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Wellness Preferences</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Supplement Level</label>
                  <select
                    value={profileData.currentSupplementLevel}
                    onChange={(e) => setProfileData({ ...profileData, currentSupplementLevel: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Select Level</option>
                    <option value="none">No supplements</option>
                    <option value="few">A few supplements (1-3)</option>
                    <option value="many">Many supplements (4+)</option>
                    <option value="unsure">Not sure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Preference</label>
                  <select
                    value={profileData.schedulePreference}
                    onChange={(e) => setProfileData({ ...profileData, schedulePreference: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Select Preference</option>
                    <option value="morning">Morning Person</option>
                    <option value="evening">Evening Person</option>
                    <option value="throughout">Throughout the Day</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Activities</label>
                <Input
                  value={profileData.preferredActivities}
                  onChange={(e) => setProfileData({ ...profileData, preferredActivities: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Meditation, Exercise, Journaling"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Today's Progress */}
          <Card>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Today's Progress</h3>
              <ProgressCircle
                progress={adherencePercent}
                size={120}
                color="#20C997"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{adherencePercent}%</div>
                  <div className="text-xs text-gray-400">Complete</div>
                </div>
              </ProgressCircle>
              <p className="text-sm text-gray-400 mt-4">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-300">Current Streak</span>
                </div>
                <span className="text-white font-semibold">{currentStreak} days</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-secondary-500" />
                  <span className="text-gray-300">Supplements</span>
                </div>
                <span className="text-white font-semibold">{state.supplements.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-success" />
                  <span className="text-gray-300">Wellness Activities</span>
                </div>
                <span className="text-white font-semibold">{state.wellness.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-warning" />
                  <span className="text-gray-300">Total Completions</span>
                </div>
                <span className="text-white font-semibold">{state.completions.length}</span>
              </div>
            </div>
          </Card>

          {/* Account Info */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Member since:</span>
                <p className="text-white">{format(new Date(), 'MMMM yyyy')}</p>
              </div>
              <div>
                <span className="text-gray-400">Account type:</span>
                <p className="text-white">Free</p>
              </div>
              <div>
                <span className="text-gray-400">Data sync:</span>
                <p className="text-white capitalize">{state.syncStatus}</p>
              </div>
            </div>
          </Card>
        </div>
      </div >
    </div >
  );
};

export default Profile;