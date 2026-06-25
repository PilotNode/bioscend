import React, { useState, useEffect } from 'react';
import { User, Edit2, Save, X, TrendingUp, Target, Award, Calendar, ChevronRight } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import ProgressCircle from '../components/UI/ProgressCircle';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/* ── Reusable read-only field ────────────────────────────────────────────── */
const ReadField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm md:text-base text-white font-medium">
      {value || <span className="text-gray-500 italic font-normal">Not set</span>}
    </p>
  </div>
);

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
    schedulePreference: '',
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
        schedulePreference: state.profile.schedulePreference || '',
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
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = state.completions.filter(c => c.date === dateStr);
      const dayAdherence = totalTasks > 0 ? (dayCompletions.length / totalTasks) * 100 : 0;
      if (dayAdherence >= 80) streak++;
      else break;
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
        schedulePreference: state.profile.schedulePreference || '',
      });
    }
  };

  const displayName = profileData.firstName || profileData.lastName
    ? `${profileData.firstName} ${profileData.lastName}`.trim()
    : user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 mt-1">Manage your personal information</p>
        </div>

        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-1.5" />
            <span>Edit</span>
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">

          {/* Identity Card */}
          <Card>
            {/* Avatar + name row */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-glow flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{displayName}</h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-1 flex items-center text-xs text-primary-400 hover:text-primary-300 transition-colors touch-manipulation"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit profile
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
                <Input
                  label="Age"
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">Greenwich Mean Time</option>
                    <option value="IST">India Standard Time</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
                  <select
                    value={profileData.ageGroup}
                    onChange={(e) => setProfileData({ ...profileData, ageGroup: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <ReadField label="First Name" value={profileData.firstName} />
                <ReadField label="Last Name" value={profileData.lastName} />
                <ReadField label="Age" value={profileData.age} />
                <ReadField label="Timezone" value={profileData.timezone} />
                <div className="col-span-2">
                  <ReadField label="Age Group" value={profileData.ageGroup} />
                </div>
              </div>
            )}
          </Card>

          {/* Health Metrics */}
          <Card>
            <h3 className="text-base md:text-lg font-semibold text-white mb-4">Health Metrics</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Height (cm)"
                  type="number"
                  value={profileData.height}
                  onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay text-center">
                  <p className="text-2xl font-bold text-white">{profileData.height || '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">Height (cm)</p>
                </div>
                <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay text-center">
                  <p className="text-2xl font-bold text-white">{profileData.weight || '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">Weight (kg)</p>
                </div>
              </div>
            )}
          </Card>

          {/* Wellness Goals */}
          <Card>
            <h3 className="text-base md:text-lg font-semibold text-white mb-4">Wellness Goals</h3>
            {isEditing ? (
              <textarea
                value={profileData.goals}
                onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe your wellness goals..."
                rows={4}
              />
            ) : (
              <div className="bg-surface-raised rounded-xl p-4 border border-surface-overlay">
                {profileData.goals ? (
                  <p className="text-gray-300 text-sm leading-relaxed">{profileData.goals}</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 italic text-sm">No goals set yet</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-xs text-primary-400 hover:text-primary-300 transition-colors touch-manipulation"
                    >
                      Add goals <ChevronRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Preferences */}
          <Card>
            <h3 className="text-base md:text-lg font-semibold text-white mb-4">Wellness Preferences</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Supplement Level</label>
                    <select
                      value={profileData.currentSupplementLevel}
                      onChange={(e) => setProfileData({ ...profileData, currentSupplementLevel: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      <option value="none">No supplements</option>
                      <option value="few">A few (1-3)</option>
                      <option value="many">Many (4+)</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Preference</label>
                    <select
                      value={profileData.schedulePreference}
                      onChange={(e) => setProfileData({ ...profileData, schedulePreference: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-raised border border-surface-overlay rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Preference</option>
                      <option value="morning">Morning Person</option>
                      <option value="evening">Evening Person</option>
                      <option value="throughout">Throughout the Day</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                <Input
                  label="Preferred Activities"
                  value={profileData.preferredActivities}
                  onChange={(e) => setProfileData({ ...profileData, preferredActivities: e.target.value })}
                  placeholder="e.g., Meditation, Exercise, Journaling"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <ReadField label="Supplement Level" value={profileData.currentSupplementLevel} />
                <ReadField label="Schedule Preference" value={profileData.schedulePreference} />
                <div className="col-span-2">
                  <ReadField label="Preferred Activities" value={profileData.preferredActivities} />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Today's Progress */}
          <Card>
            <div className="text-center">
              <h3 className="text-base md:text-lg font-semibold text-white mb-4">Today's Progress</h3>
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
            <h3 className="text-base md:text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, label: 'Current Streak', value: `${currentStreak} days`, color: 'text-primary-500' },
                { icon: Target, label: 'Supplements', value: String(state.supplements.length), color: 'text-secondary-500' },
                { icon: Award, label: 'Wellness Activities', value: String(state.wellness.length), color: 'text-success' },
                { icon: Calendar, label: 'Total Completions', value: String(state.completions.length), color: 'text-warning' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                  <span className="text-sm text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Account Info */}
          <Card>
            <h3 className="text-base md:text-lg font-semibold text-white mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wider">Member since</span>
                <p className="text-white mt-0.5">{format(new Date(), 'MMMM yyyy')}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wider">Account type</span>
                <p className="text-white mt-0.5">Free</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wider">Data sync</span>
                <p className="text-white capitalize mt-0.5">{state.syncStatus}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;