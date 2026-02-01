import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { offlineStorage } from '../lib/indexedDB';
import { firestoreService } from '../lib/firestore';
import { firebaseGeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ScheduleItem {
  id: string;
  itemId: string;
  itemType: 'supplement' | 'wellness';
  name: string;
  details: string;
  time: string;
  date: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HistoryEntry {
  id: string;
  itemId: string;
  itemType: 'supplement' | 'wellness';
  name: string;
  details: string;
  date: string;
  completedAt: Date;
  scheduleItemId?: string;
  metadata: {
    dosage?: string;
    quantity?: number;
    duration?: number;
    timeOfDay: string;
    originalTime: string;
    actualCompletionTime: string;
  };
  userId: string;
  createdAt: Date;
}

interface AppState {
  aiEnabled: boolean;
  darkMode: boolean;
  notifications: boolean;
  supplements: any[];
  wellness: any[];
  completions: any[]; // Legacy - will be phased out
  history: HistoryEntry[]; // New comprehensive history
  scheduleItems: ScheduleItem[];
  profile: any;
  loading: boolean;
  syncStatus: 'online' | 'offline' | 'syncing';
  initialized: boolean;
  aiInsights: any | null;
  aiLoading: boolean;
}

type AppAction = 
  | { type: 'SET_AI_ENABLED'; payload: boolean }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: boolean }
  | { type: 'SET_SUPPLEMENTS'; payload: any[] }
  | { type: 'SET_WELLNESS'; payload: any[] }
  | { type: 'SET_COMPLETIONS'; payload: any[] }
  | { type: 'SET_HISTORY'; payload: HistoryEntry[] }
  | { type: 'SET_SCHEDULE_ITEMS'; payload: ScheduleItem[] }
  | { type: 'SET_PROFILE'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNC_STATUS'; payload: 'online' | 'offline' | 'syncing' }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_AI_INSIGHTS'; payload: any }
  | { type: 'SET_AI_LOADING'; payload: boolean }
  | { type: 'ADD_SUPPLEMENT'; payload: any }
  | { type: 'UPDATE_SUPPLEMENT'; payload: any }
  | { type: 'DELETE_SUPPLEMENT'; payload: string }
  | { type: 'ADD_WELLNESS'; payload: any }
  | { type: 'UPDATE_WELLNESS'; payload: any }
  | { type: 'DELETE_WELLNESS'; payload: string }
  | { type: 'ADD_COMPLETION'; payload: any }
  | { type: 'ADD_HISTORY_ENTRY'; payload: HistoryEntry }
  | { type: 'REMOVE_HISTORY_ENTRY'; payload: string }
  | { type: 'UPDATE_SCHEDULE_ITEM'; payload: ScheduleItem }
  | { type: 'ADD_SCHEDULE_ITEM'; payload: ScheduleItem }
  | { type: 'REMOVE_SCHEDULE_ITEMS'; payload: string[] }
  | { type: 'CLEAR_SCHEDULE_ITEMS'; payload: void };

const initialState: AppState = {
  aiEnabled: true,
  darkMode: true,
  notifications: true,
  supplements: [],
  wellness: [],
  completions: [],
  history: [],
  scheduleItems: [],
  profile: {
    firstName: '',
    lastName: '',
    age: '',
    height: '',
    weight: '',
    goals: '',
    timezone: 'UTC'
  },
  loading: false,
  syncStatus: 'offline',
  initialized: false,
  aiInsights: null,
  aiLoading: false
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_AI_ENABLED':
      return { ...state, aiEnabled: action.payload };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_SUPPLEMENTS':
      return { ...state, supplements: action.payload };
    case 'SET_WELLNESS':
      return { ...state, wellness: action.payload };
    case 'SET_COMPLETIONS':
      return { ...state, completions: action.payload };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'SET_SCHEDULE_ITEMS':
      return { ...state, scheduleItems: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_AI_INSIGHTS':
      return { ...state, aiInsights: action.payload };
    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.payload };
    case 'ADD_SUPPLEMENT':
      return { ...state, supplements: [...state.supplements, action.payload] };
    case 'UPDATE_SUPPLEMENT':
      return {
        ...state,
        supplements: state.supplements.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    case 'DELETE_SUPPLEMENT':
      return {
        ...state,
        supplements: state.supplements.filter(s => s.id !== action.payload)
      };
    case 'ADD_WELLNESS':
      return { ...state, wellness: [...state.wellness, action.payload] };
    case 'UPDATE_WELLNESS':
      return {
        ...state,
        wellness: state.wellness.map(w => 
          w.id === action.payload.id ? action.payload : w
        )
      };
    case 'DELETE_WELLNESS':
      return {
        ...state,
        wellness: state.wellness.filter(w => w.id !== action.payload)
      };
    case 'ADD_COMPLETION':
      return { ...state, completions: [...state.completions, action.payload] };
    case 'ADD_HISTORY_ENTRY':
      return { ...state, history: [...state.history, action.payload] };
    case 'REMOVE_HISTORY_ENTRY':
      return { 
        ...state, 
        history: state.history.filter(entry => entry.id !== action.payload) 
      };
    case 'UPDATE_SCHEDULE_ITEM':
      return {
        ...state,
        scheduleItems: state.scheduleItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'ADD_SCHEDULE_ITEM':
      // Prevent duplicates by checking if item already exists
      const existingItem = state.scheduleItems.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state;
      }
      return {
        ...state,
        scheduleItems: [...state.scheduleItems, action.payload]
      };
    case 'REMOVE_SCHEDULE_ITEMS':
      return {
        ...state,
        scheduleItems: state.scheduleItems.filter(item => !action.payload.includes(item.id))
      };
    case 'CLEAR_SCHEDULE_ITEMS':
      return {
        ...state,
        scheduleItems: []
      };
    default:
      return state;
  }
};

// Helper function to get time based on timeOfDay or specific time
const getTimeForSchedule = (timeOfDay: string, specificTime?: string): string => {
  // If specific time is provided, use it
  if (specificTime) {
    return specificTime;
  }
  
  // Otherwise use default times for time of day
  const timeMap: { [key: string]: string } = {
    morning: '08:00',
    afternoon: '13:00',
    evening: '19:00'
  };
  return timeMap[timeOfDay] || '08:00';
};

// Helper function to determine which time block a time belongs to
const getTimeBlock = (time: string): 'morning' | 'afternoon' | 'evening' => {
  const hour = parseInt(time.split(':')[0]);
  
  if (hour < 12) {
    return 'morning';
  } else if (hour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addSupplement: (supplement: any) => Promise<void>;
  updateSupplement: (supplement: any) => Promise<void>;
  deleteSupplement: (id: string) => Promise<void>;
  addWellness: (wellness: any) => Promise<void>;
  updateWellness: (wellness: any) => Promise<void>;
  deleteWellness: (id: string) => Promise<void>;
  addCompletion: (completion: any) => Promise<void>;
  updateProfile: (profile: any) => Promise<void>;
  generateAIInsights: () => Promise<any>;
  generateSupplementRecommendations: () => Promise<any>;
  askAIQuestion: (question: string) => Promise<string>;
  toggleAI: () => Promise<void>;
  syncData: () => Promise<void>;
  generateScheduleForDate: (date: string) => Promise<void>;
  toggleScheduleItemCompletion: (scheduleItemId: string) => Promise<void>;
  getScheduleItemsForDate: (date: string) => ScheduleItem[];
  regenerateSchedules: () => Promise<void>;
  getHistoryForDateRange: (startDate: string, endDate: string) => HistoryEntry[];
  getAnalyticsData: (days: number) => any;
  getTimeBlock: (time: string) => 'morning' | 'afternoon' | 'evening';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();
  const generatedDatesRef = useRef<Set<string>>(new Set());
  const isGeneratingRef = useRef<Set<string>>(new Set());
  const scheduleRegenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousSupplementsRef = useRef<any[]>([]);
  const previousWellnessRef = useRef<any[]>([]);

  // Initialize Firebase AI on app start
  useEffect(() => {
    firebaseGeminiService.initialize().then((initialized) => {
      if (initialized) {
        console.log('Firebase AI Logic is ready');
      } else {
        console.log('Firebase AI Logic not available, using fallback');
      }
    });
  }, []);

  // Firestore listeners with proper cleanup
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_INITIALIZED', payload: false });
      return;
    }

    let unsubscribeSupplements: (() => void) | undefined;
    let unsubscribeWellness: (() => void) | undefined;
    let unsubscribeCompletions: (() => void) | undefined;
    let unsubscribeHistory: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeScheduleItems: (() => void) | undefined;

    const setupFirestoreListeners = async () => {
      try {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

        // Subscribe to supplements
        unsubscribeSupplements = firestoreService.subscribeToSupplements(user.uid, (supplements) => {
          console.log('Received supplements from Firestore:', supplements.length);
          dispatch({ type: 'SET_SUPPLEMENTS', payload: supplements });
          // Cache locally
          supplements.forEach(supplement => offlineStorage.addSupplement(supplement).catch(() => {}));
        });

        // Subscribe to wellness
        unsubscribeWellness = firestoreService.subscribeToWellness(user.uid, (wellness) => {
          console.log('Received wellness from Firestore:', wellness.length);
          dispatch({ type: 'SET_WELLNESS', payload: wellness });
          // Cache locally
          wellness.forEach(w => offlineStorage.addWellness(w).catch(() => {}));
        });

        // Subscribe to history (new comprehensive tracking)
        unsubscribeHistory = firestoreService.subscribeToHistory(user.uid, (history) => {
          console.log('Received history from Firestore:', history.length);
          dispatch({ type: 'SET_HISTORY', payload: history });
        });

        // Subscribe to completions (legacy - for backward compatibility)
        unsubscribeCompletions = firestoreService.subscribeToCompletions(user.uid, (completions) => {
          const formattedCompletions = completions.map(c => ({
            ...c,
            date: c.completedAt ? c.completedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }));
          console.log('Received completions from Firestore:', formattedCompletions.length);
          dispatch({ type: 'SET_COMPLETIONS', payload: formattedCompletions });
          // Cache locally
          formattedCompletions.forEach(c => offlineStorage.addCompletion(c).catch(() => {}));
        });

        // Subscribe to schedule items
        unsubscribeScheduleItems = firestoreService.subscribeToScheduleItems(user.uid, (scheduleItems) => {
          console.log('Received schedule items from Firestore:', scheduleItems.length);
          dispatch({ type: 'SET_SCHEDULE_ITEMS', payload: scheduleItems });
          
          // Track which dates have been generated
          const dates = new Set(scheduleItems.map(item => item.date));
          generatedDatesRef.current = dates;
        });

        // Subscribe to settings
        unsubscribeSettings = firestoreService.subscribeToSettings(user.uid, (settings) => {
          if (settings) {
            dispatch({ type: 'SET_AI_ENABLED', payload: settings.aiEnabled ?? true });
            dispatch({ type: 'SET_DARK_MODE', payload: settings.darkMode ?? true });
            dispatch({ type: 'SET_NOTIFICATIONS', payload: settings.notifications ?? true });
          }
        });

        // Subscribe to profile
        unsubscribeProfile = firestoreService.subscribeToProfile(user.uid, (profile) => {
          if (profile) {
            dispatch({ type: 'SET_PROFILE', payload: profile });
          }
        });

        dispatch({ type: 'SET_SYNC_STATUS', payload: 'online' });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        toast.success('Data synced successfully');
      } catch (error) {
        console.error('Firestore connection failed, using offline data:', error);
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'offline' });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        await loadOfflineData();
        toast.error('Using offline data - some features may be limited');
      }
    };

    const loadOfflineData = async () => {
      try {
        const [supplements, wellness, completions, settings] = await Promise.all([
          offlineStorage.getSupplements(user.uid),
          offlineStorage.getWellness(user.uid),
          offlineStorage.getCompletions(user.uid),
          offlineStorage.getSettings(user.uid)
        ]);

        dispatch({ type: 'SET_SUPPLEMENTS', payload: supplements });
        dispatch({ type: 'SET_WELLNESS', payload: wellness });
        dispatch({ type: 'SET_COMPLETIONS', payload: completions });
        
        if (settings) {
          dispatch({ type: 'SET_AI_ENABLED', payload: settings.aiEnabled });
          dispatch({ type: 'SET_DARK_MODE', payload: settings.darkMode });
          dispatch({ type: 'SET_NOTIFICATIONS', payload: settings.notifications });
        }
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    };

    setupFirestoreListeners();

    return () => {
      unsubscribeSupplements?.();
      unsubscribeWellness?.();
      unsubscribeCompletions?.();
      unsubscribeHistory?.();
      unsubscribeSettings?.();
      unsubscribeProfile?.();
      unsubscribeScheduleItems?.();
    };
  }, [user]);

  // Auto-generate AI insights when data changes
  useEffect(() => {
    if (state.aiEnabled && state.initialized && user) {
      const hasData = state.supplements.length > 0 || state.wellness.length > 0 || state.history.length > 0;
      if (hasData) {
        // Debounce AI insights generation
        const timeoutId = setTimeout(() => {
          generateAIInsights();
        }, 2000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [state.supplements, state.wellness, state.history, state.aiEnabled, state.initialized, user]);

  // Smart schedule synchronization when supplements/wellness change
  useEffect(() => {
    if (!state.initialized || !user) return;

    const currentSupplements = state.supplements;
    const currentWellness = state.wellness;
    const previousSupplements = previousSupplementsRef.current;
    const previousWellness = previousWellnessRef.current;

    // Check if this is the initial load
    if (previousSupplements.length === 0 && previousWellness.length === 0) {
      previousSupplementsRef.current = currentSupplements;
      previousWellnessRef.current = currentWellness;
      return;
    }

    // Detect changes
    const supplementChanges = detectChanges(previousSupplements, currentSupplements);
    const wellnessChanges = detectChanges(previousWellness, currentWellness);

    if (supplementChanges.hasChanges || wellnessChanges.hasChanges) {
      console.log('Detected changes in supplements/wellness:', {
        supplements: supplementChanges,
        wellness: wellnessChanges
      });

      // Clear any existing timeout
      if (scheduleRegenerationTimeoutRef.current) {
        clearTimeout(scheduleRegenerationTimeoutRef.current);
      }

      // Set a new timeout to handle changes after they settle
      scheduleRegenerationTimeoutRef.current = setTimeout(async () => {
        await handleSourceItemChanges(supplementChanges, wellnessChanges);
      }, 1000);
    }

    // Update refs for next comparison
    previousSupplementsRef.current = currentSupplements;
    previousWellnessRef.current = currentWellness;

    return () => {
      if (scheduleRegenerationTimeoutRef.current) {
        clearTimeout(scheduleRegenerationTimeoutRef.current);
      }
    };
  }, [state.supplements, state.wellness, state.initialized, user]);

  // Helper function to detect changes between arrays
  const detectChanges = (previous: any[], current: any[]) => {
    const added = current.filter(curr => !previous.find(prev => prev.id === curr.id));
    const removed = previous.filter(prev => !current.find(curr => curr.id === prev.id));
    const updated = current.filter(curr => {
      const prev = previous.find(p => p.id === curr.id);
      return prev && (
        prev.name !== curr.name ||
        prev.dosage !== curr.dosage ||
        prev.duration !== curr.duration ||
        prev.timeOfDay !== curr.timeOfDay ||
        prev.specificTime !== curr.specificTime ||
        prev.schedule !== curr.schedule
      );
    });

    return {
      hasChanges: added.length > 0 || removed.length > 0 || updated.length > 0,
      added,
      removed,
      updated
    };
  };

  // Handle changes to source items (supplements/wellness)
  const handleSourceItemChanges = async (supplementChanges: any, wellnessChanges: any) => {
    if (!user) return;

    try {
      console.log('Processing source item changes...');

      // Handle deletions first - remove schedule items for deleted source items
      const deletedSupplementIds = supplementChanges.removed.map((s: any) => s.id);
      const deletedWellnessIds = wellnessChanges.removed.map((w: any) => w.id);
      const allDeletedIds = [...deletedSupplementIds, ...deletedWellnessIds];

      if (allDeletedIds.length > 0) {
        const scheduleItemsToRemove = state.scheduleItems.filter(item => 
          allDeletedIds.includes(item.itemId)
        );

        console.log(`Removing ${scheduleItemsToRemove.length} schedule items for deleted source items`);

        // Remove from Firestore
        if (state.syncStatus === 'online') {
          for (const item of scheduleItemsToRemove) {
            try {
              await firestoreService.deleteScheduleItem(item.id);
            } catch (error) {
              console.error('Failed to delete schedule item:', error);
            }
          }
        }

        // Remove from local state
        const idsToRemove = scheduleItemsToRemove.map(item => item.id);
        dispatch({ type: 'REMOVE_SCHEDULE_ITEMS', payload: idsToRemove });
      }

      // Handle updates - update schedule items for modified source items
      const updatedSupplements = supplementChanges.updated;
      const updatedWellness = wellnessChanges.updated;
      const allUpdated = [...updatedSupplements, ...updatedWellness];

      if (allUpdated.length > 0) {
        console.log(`Updating schedule items for ${allUpdated.length} modified source items`);

        for (const sourceItem of allUpdated) {
          const relatedScheduleItems = state.scheduleItems.filter(item => 
            item.itemId === sourceItem.id
          );

          for (const scheduleItem of relatedScheduleItems) {
            const updatedScheduleItem = {
              ...scheduleItem,
              name: sourceItem.name,
              details: sourceItem.dosage 
                ? `${sourceItem.dosage} • ${sourceItem.quantity} ${sourceItem.quantity > 1 ? 'pills' : 'pill'}`
                : `${sourceItem.duration} minutes`,
              time: getTimeForSchedule(sourceItem.timeOfDay, sourceItem.specificTime),
              updatedAt: new Date()
            };

            // Update in Firestore
            if (state.syncStatus === 'online') {
              try {
                await firestoreService.updateScheduleItem(scheduleItem.id, updatedScheduleItem);
              } catch (error) {
                console.error('Failed to update schedule item:', error);
              }
            }

            // Update local state
            dispatch({ type: 'UPDATE_SCHEDULE_ITEM', payload: updatedScheduleItem });
          }
        }
      }

      // Handle additions - regenerate schedules to include new items
      if (supplementChanges.added.length > 0 || wellnessChanges.added.length > 0) {
        console.log('Regenerating schedules for new items');
        await regenerateSchedules();
      }

      console.log('Source item changes processed successfully');
    } catch (error) {
      console.error('Failed to handle source item changes:', error);
    }
  };

  const regenerateSchedules = useCallback(async () => {
    if (!user) return;

    console.log('Starting schedule regeneration...');
    
    try {
      // Clear generated dates cache to force regeneration
      generatedDatesRef.current.clear();
      
      // Generate schedule for today and next 6 days (7 days total)
      const today = new Date();
      const promises = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = format(date, 'yyyy-MM-dd');
        promises.push(generateScheduleForDate(dateStr));
      }
      
      await Promise.all(promises);
      console.log('Schedule regeneration completed');
      
      // Force a re-render by updating a timestamp
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to regenerate schedules:', error);
    }
  }, [user]);

  const addSupplement = useCallback(async (supplement: any) => {
    if (!user) return;
    
    const newSupplement = {
      ...supplement,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      if (state.syncStatus === 'online') {
        const id = await firestoreService.addSupplement(user.uid, newSupplement);
        newSupplement.id = id;
        // The Firestore subscription will automatically update the state
        // and trigger schedule regeneration via the useEffect
      } else {
        newSupplement.id = Date.now().toString();
        await offlineStorage.addSupplement(newSupplement);
        dispatch({ type: 'ADD_SUPPLEMENT', payload: newSupplement });
      }
    } catch (error) {
      console.error('Failed to add supplement:', error);
      newSupplement.id = Date.now().toString();
      await offlineStorage.addSupplement(newSupplement);
      dispatch({ type: 'ADD_SUPPLEMENT', payload: newSupplement });
      toast.error('Added locally - will sync when online');
    }
  }, [user, state.syncStatus]);

  const updateSupplement = useCallback(async (supplement: any) => {
    const updatedSupplement = {
      ...supplement,
      updatedAt: new Date()
    };

    try {
      if (state.syncStatus === 'online') {
        await firestoreService.updateSupplement(supplement.id, updatedSupplement);
        // The Firestore subscription will automatically update the state
        // and trigger schedule regeneration via the useEffect
      } else {
        await offlineStorage.updateSupplement(updatedSupplement);
        dispatch({ type: 'UPDATE_SUPPLEMENT', payload: updatedSupplement });
      }
    } catch (error) {
      console.error('Failed to update supplement:', error);
      await offlineStorage.updateSupplement(updatedSupplement);
      dispatch({ type: 'UPDATE_SUPPLEMENT', payload: updatedSupplement });
      toast.error('Updated locally - will sync when online');
    }
  }, [state.syncStatus]);

  const deleteSupplement = useCallback(async (id: string) => {
    try {
      if (state.syncStatus === 'online') {
        await firestoreService.deleteSupplement(id);
        // The Firestore subscription will automatically update the state
        // and trigger schedule regeneration via the useEffect
      } else {
        await offlineStorage.deleteSupplement(id);
        dispatch({ type: 'DELETE_SUPPLEMENT', payload: id });
      }
    } catch (error) {
      console.error('Failed to delete supplement:', error);
      await offlineStorage.deleteSupplement(id);
      dispatch({ type: 'DELETE_SUPPLEMENT', payload: id });
      toast.error('Deleted locally - will sync when online');
    }
  }, [state.syncStatus]);

  const addWellness = useCallback(async (wellness: any) => {
    if (!user) return;
    
    const newWellness = {
      ...wellness,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      if (state.syncStatus === 'online') {
        const id = await firestoreService.addWellness(user.uid, newWellness);
        newWellness.id = id;
        // The Firestore subscription will automatically update the state
        // and trigger schedule regeneration via the useEffect
      } else {
        newWellness.id = Date.now().toString();
        await offlineStorage.addWellness(newWellness);
        dispatch({ type: 'ADD_WELLNESS', payload: newWellness });
      }
    } catch (error) {
      console.error('Failed to add wellness:', error);
      newWellness.id = Date.now().toString();
      await offlineStorage.addWellness(newWellness);
      dispatch({ type: 'ADD_WELLNESS', payload: newWellness });
      toast.error('Added locally - will sync when online');
    }
  }, [user, state.syncStatus]);

  const updateWellness = useCallback(async (wellness: any) => {
    const updatedWellness = {
      ...wellness,
      updatedAt: new Date()
    };

    try {
      if (state.syncStatus === 'online') {
        await firestoreService.updateWellness(wellness.id, updatedWellness);
        // The Firestore subscription will automatically update the state
        // and trigger schedule regeneration via the useEffect
      } else {
        await offlineStorage.updateWellness(updatedWellness);
        dispatch({ type: 'UPDATE_WELLNESS', payload: updatedWellness });
      }
    } catch (error) {
      console.error('Failed to update wellness:', error);
      await offlineStorage.updateWellness(updatedWellness);
      dispatch({ type: 'UPDATE_WELLNESS', payload: updatedWellness });
      toast.error('Updated locally - will sync when online');
    }
  }, [state.syncStatus]);

  const deleteWellness = useCallback(async (id: string) => {
    try {
      if (state.syncStatus === 'online') {
        await firestoreService.deleteWellness(id);
        // The Firestore subscription will automatically update the state
        // and trigger schedule regeneration via the useEffect
      } else {
        await offlineStorage.deleteWellness(id);
        dispatch({ type: 'DELETE_WELLNESS', payload: id });
      }
    } catch (error) {
      console.error('Failed to delete wellness:', error);
      await offlineStorage.deleteWellness(id);
      dispatch({ type: 'DELETE_WELLNESS', payload: id });
      toast.error('Deleted locally - will sync when online');
    }
  }, [state.syncStatus]);

  const addCompletion = useCallback(async (completion: any) => {
    if (!user) return;
    
    const newCompletion = {
      ...completion,
      id: `temp-${Date.now()}-${Math.random()}`,
      userId: user.uid,
      completedAt: new Date(),
      date: completion.date || new Date().toISOString().split('T')[0]
    };

    try {
      if (state.syncStatus === 'online') {
        const firestoreId = await firestoreService.addCompletion(user.uid, newCompletion);
        newCompletion.id = firestoreId;
      } else {
        await offlineStorage.addCompletion(newCompletion);
        toast.error('Completion saved locally - will sync when online');
      }
      
      dispatch({ type: 'ADD_COMPLETION', payload: newCompletion });
    } catch (error) {
      console.error('Failed to add completion:', error);
      await offlineStorage.addCompletion(newCompletion);
      dispatch({ type: 'ADD_COMPLETION', payload: newCompletion });
      toast.error('Completion saved locally - will sync when online');
    }
  }, [user, state.syncStatus]);

  const updateProfile = useCallback(async (profile: any) => {
    if (!user) throw new Error('User not authenticated');

    const updatedProfile = {
      ...state.profile,
      ...profile,
      userId: user.uid,
      updatedAt: new Date()
    };

    dispatch({ type: 'SET_PROFILE', payload: updatedProfile });

    try {
      if (state.syncStatus === 'online') {
        await firestoreService.updateProfile(user.uid, updatedProfile);
        console.log('Profile saved to Firestore');
      } else {
        throw new Error('Offline - profile will sync when online');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [user, state.syncStatus, state.profile]);

  const generateAIInsights = useCallback(async () => {
    if (!state.aiEnabled || !user) return null;
    
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    
    try {
      const userContext = {
        goals: [state.profile?.goals || 'General wellness'],
        supplements: state.supplements,
        wellness: state.wellness,
        completions: state.completions,
        history: state.history,
        profile: { ...state.profile, userId: user.uid }
      };
      
      const insights = await firebaseGeminiService.generateInsights(userContext);
      dispatch({ type: 'SET_AI_INSIGHTS', payload: insights });
      return insights;
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      // Fallback to mock insights
      const mockInsights = {
        adherenceScore: 85,
        insights: [
          'Your supplement adherence has been consistent this week',
          'Consider adding a midday wellness check-in for better consistency'
        ],
        recommendations: [
          'Try taking your supplements with meals for better absorption'
        ]
      };
      dispatch({ type: 'SET_AI_INSIGHTS', payload: mockInsights });
      return mockInsights;
    } finally {
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  }, [state.aiEnabled, user, state.supplements, state.wellness, state.completions, state.history, state.profile]);

  const generateSupplementRecommendations = useCallback(async () => {
    if (!state.aiEnabled || !user) return null;
    
    try {
      const userContext = {
        goals: [state.profile?.goals || 'General wellness'],
        supplements: state.supplements,
        wellness: state.wellness,
        completions: state.completions,
        history: state.history,
        profile: { ...state.profile, userId: user.uid }
      };
      
      console.log('Requesting supplement recommendations for user context:', {
        supplementsCount: userContext.supplements.length,
        wellnessCount: userContext.wellness.length,
        historyCount: userContext.history.length,
        goals: userContext.goals
      });
      
      return await firebaseGeminiService.generateSupplementRecommendations(userContext);
    } catch (error) {
      console.error('Failed to generate supplement recommendations:', error);
      // Re-throw the error so the UI can handle it appropriately
      throw error;
    }
  }, [state.aiEnabled, user, state.supplements, state.wellness, state.completions, state.history, state.profile]);

  const askAIQuestion = useCallback(async (question: string): Promise<string> => {
    if (!state.aiEnabled || !user) {
      return "AI features are currently disabled. Please enable AI in settings to ask questions.";
    }
    
    try {
      const userContext = {
        goals: [state.profile?.goals || 'General wellness'],
        supplements: state.supplements,
        wellness: state.wellness,
        completions: state.completions,
        history: state.history,
        profile: { ...state.profile, userId: user.uid }
      };
      
      return await firebaseGeminiService.generateTextResponse(question, userContext);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      return "I'm having trouble processing your question right now. Please try again later.";
    }
  }, [state.aiEnabled, user, state.supplements, state.wellness, state.completions, state.history, state.profile]);

  const toggleAI = useCallback(async () => {
    if (!user) return;
    
    const newAIState = !state.aiEnabled;
    dispatch({ type: 'SET_AI_ENABLED', payload: newAIState });
    
    const settings = {
      userId: user.uid,
      aiEnabled: newAIState,
      darkMode: state.darkMode,
      notifications: state.notifications,
      timezone: 'UTC',
      updatedAt: new Date()
    };

    try {
      if (state.syncStatus === 'online') {
        await firestoreService.updateSettings(user.uid, settings);
      } else {
        await offlineStorage.updateSettings(settings);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      await offlineStorage.updateSettings(settings);
    }
  }, [user, state.aiEnabled, state.darkMode, state.notifications, state.syncStatus]);

  const syncData = useCallback(async () => {
    if (!user || state.syncStatus !== 'offline') return;

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      
      const [localSupplements, localWellness, localCompletions] = await Promise.all([
        offlineStorage.getSupplements(user.uid),
        offlineStorage.getWellness(user.uid),
        offlineStorage.getCompletions(user.uid)
      ]);

      for (const supplement of localSupplements) {
        if (!supplement.synced) {
          await firestoreService.addSupplement(user.uid, supplement);
        }
      }

      for (const wellness of localWellness) {
        if (!wellness.synced) {
          await firestoreService.addWellness(user.uid, wellness);
        }
      }

      for (const completion of localCompletions) {
        if (!completion.synced) {
          await firestoreService.addCompletion(user.uid, completion);
        }
      }

      dispatch({ type: 'SET_SYNC_STATUS', payload: 'online' });
      toast.success('Data synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'offline' });
      toast.error('Sync failed - will retry later');
    }
  }, [user, state.syncStatus]);

  const generateScheduleForDate = useCallback(async (date: string) => {
    // Prevent duplicate generation
    if (generatedDatesRef.current.has(date) || isGeneratingRef.current.has(date)) {
      console.log('Schedule already generated or being generated for date:', date);
      return;
    }

    // Check if we have any supplements or wellness items to schedule
    if (state.supplements.length === 0 && state.wellness.length === 0) {
      console.log('No supplements or wellness items to schedule');
      return;
    }

    console.log('Generating schedule for date:', date);
    isGeneratingRef.current.add(date);
    
    try {
      const newItems: ScheduleItem[] = [];

      // Generate items for supplements
      state.supplements.forEach(supplement => {
        const newItem: ScheduleItem = {
          id: `schedule-${supplement.id}-${date}-supplement`,
          itemId: supplement.id,
          itemType: 'supplement',
          name: supplement.name,
          details: `${supplement.dosage} • ${supplement.quantity} ${supplement.quantity > 1 ? 'pills' : 'pill'}`,
          time: getTimeForSchedule(supplement.timeOfDay, supplement.specificTime),
          date,
          completed: false,
          userId: user?.uid || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        newItems.push(newItem);
      });

      // Generate items for wellness
      state.wellness.forEach(wellnessItem => {
        const newItem: ScheduleItem = {
          id: `schedule-${wellnessItem.id}-${date}-wellness`,
          itemId: wellnessItem.id,
          itemType: 'wellness',
          name: wellnessItem.name,
          details: `${wellnessItem.duration} minutes`,
          time: getTimeForSchedule(wellnessItem.timeOfDay, wellnessItem.specificTime),
          date,
          completed: false,
          userId: user?.uid || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        newItems.push(newItem);
      });

      // Add new items to Firestore (state will be updated via subscription)
      for (const item of newItems) {
        if (state.syncStatus === 'online' && user) {
          try {
            await firestoreService.addScheduleItem(user.uid, item);
          } catch (error) {
            console.error('Failed to add schedule item to Firestore:', error);
          }
        } else {
          // Add to local state if offline
          dispatch({ type: 'ADD_SCHEDULE_ITEM', payload: item });
        }
      }

      // Mark this date as generated
      generatedDatesRef.current.add(date);
    } finally {
      isGeneratingRef.current.delete(date);
    }
  }, [state.supplements, state.wellness, state.syncStatus, user]);

  const toggleScheduleItemCompletion = useCallback(async (scheduleItemId: string) => {
    const scheduleItem = state.scheduleItems.find(item => item.id === scheduleItemId);
    if (!scheduleItem || !user) return;

    const updatedItem = {
      ...scheduleItem,
      completed: !scheduleItem.completed,
      updatedAt: new Date(),
      userId: user.uid // Explicitly ensure userId is set for Firestore permissions
    };

    // Update local state immediately
    dispatch({ type: 'UPDATE_SCHEDULE_ITEM', payload: updatedItem });

    try {
      if (state.syncStatus === 'online') {
        await firestoreService.updateScheduleItem(scheduleItemId, updatedItem);
        
        // Handle history entry creation/deletion
        if (updatedItem.completed) {
          // Create history entry when marking as completed
          const sourceItem = scheduleItem.itemType === 'supplement' 
            ? state.supplements.find(s => s.id === scheduleItem.itemId)
            : state.wellness.find(w => w.id === scheduleItem.itemId);

          if (sourceItem) {
            // Create metadata object with only defined values
            const metadata: any = {
              timeOfDay: sourceItem.timeOfDay || 'morning',
              originalTime: scheduleItem.time,
              actualCompletionTime: format(new Date(), 'HH:mm')
            };

            // Only add fields that exist and are not undefined
            if (scheduleItem.itemType === 'supplement') {
              if (sourceItem.dosage !== undefined) {
                metadata.dosage = sourceItem.dosage;
              }
              if (sourceItem.quantity !== undefined) {
                metadata.quantity = sourceItem.quantity;
              }
            } else if (scheduleItem.itemType === 'wellness') {
              if (sourceItem.duration !== undefined) {
                metadata.duration = sourceItem.duration;
              }
            }

            const historyEntry: HistoryEntry = {
              id: `history-${scheduleItemId}-${Date.now()}`,
              itemId: scheduleItem.itemId,
              itemType: scheduleItem.itemType,
              name: scheduleItem.name,
              details: scheduleItem.details,
              date: scheduleItem.date,
              completedAt: new Date(),
              scheduleItemId: scheduleItemId,
              metadata,
              userId: user.uid,
              createdAt: new Date()
            };

            await firestoreService.addHistoryEntry(user.uid, historyEntry);
          }
        } else {
          // Remove history entry when marking as undone
          const existingHistoryEntry = state.history.find(entry => 
            entry.scheduleItemId === scheduleItemId
          );
          
          if (existingHistoryEntry) {
            // Verify the history entry belongs to the current user before attempting deletion
            if (existingHistoryEntry.userId === user.uid) {
              try {
                await firestoreService.deleteHistoryEntry(existingHistoryEntry.id);
              } catch (error) {
                console.error('Failed to delete history entry:', error);
                // Don't show error to user as this is expected behavior for permission issues
                console.log('History entry deletion failed - this may be due to Firestore rules or data inconsistency');
              }
            } else {
              console.warn('History entry has incorrect userId, skipping delete');
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update schedule item:', error);
      // Revert the change if Firestore update failed
      dispatch({ type: 'UPDATE_SCHEDULE_ITEM', payload: scheduleItem });
      toast.error('Failed to update completion status');
    }
  }, [state.scheduleItems, state.supplements, state.wellness, state.history, state.syncStatus, user]);

  const getScheduleItemsForDate = useCallback((date: string): ScheduleItem[] => {
    return state.scheduleItems
      .filter(item => item.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [state.scheduleItems]);

  const getHistoryForDateRange = useCallback((startDate: string, endDate: string): HistoryEntry[] => {
    return state.history.filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    ).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }, [state.history]);

  const getAnalyticsData = useCallback((days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Get history entries for this date
      const dayHistory = state.history.filter(entry => entry.date === dateStr);
      
      // Get scheduled items for this date
      const daySchedule = state.scheduleItems.filter(item => item.date === dateStr);
      
      const totalTasks = daySchedule.length;
      const completedTasks = dayHistory.length;
      const adherencePercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const supplementsCompleted = dayHistory.filter(h => h.itemType === 'supplement').length;
      const wellnessCompleted = dayHistory.filter(h => h.itemType === 'wellness').length;
      
      const supplementsScheduled = daySchedule.filter(s => s.itemType === 'supplement').length;
      const wellnessScheduled = daySchedule.filter(s => s.itemType === 'wellness').length;
      
      const supplementsPercent = supplementsScheduled > 0 ? Math.round((supplementsCompleted / supplementsScheduled) * 100) : 0;
      const wellnessPercent = wellnessScheduled > 0 ? Math.round((wellnessCompleted / wellnessScheduled) * 100) : 0;

      data.push({
        date: format(date, 'MMM dd'),
        adherence: adherencePercent,
        supplements: supplementsPercent,
        wellness: wellnessPercent,
        completed: completedTasks,
        total: totalTasks,
        history: dayHistory
      });
    }
    
    return data;
  }, [state.history, state.scheduleItems]);

  const value = {
    state,
    dispatch,
    addSupplement,
    updateSupplement,
    deleteSupplement,
    addWellness,
    updateWellness,
    deleteWellness,
    addCompletion,
    updateProfile,
    generateAIInsights,
    generateSupplementRecommendations,
    askAIQuestion,
    toggleAI,
    syncData,
    generateScheduleForDate,
    toggleScheduleItemCompletion,
    getScheduleItemsForDate,
    regenerateSchedules,
    getHistoryForDateRange,
    getAnalyticsData,
    getTimeBlock
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};