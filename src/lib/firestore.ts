import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Firestore service for real-time data sync
export const firestoreService = {
  // Supplements
  async addSupplement(userId: string, supplement: any) {
    try {
      const docRef = await addDoc(collection(db, 'supplements'), {
        ...supplement,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding supplement to Firestore:', error);
      throw error;
    }
  },

  async updateSupplement(id: string, supplement: any) {
    try {
      const docRef = doc(db, 'supplements', id);
      await updateDoc(docRef, {
        ...supplement,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating supplement in Firestore:', error);
      throw error;
    }
  },

  async deleteSupplement(id: string) {
    try {
      await deleteDoc(doc(db, 'supplements', id));
    } catch (error) {
      console.error('Error deleting supplement from Firestore:', error);
      throw error;
    }
  },

  subscribeToSupplements(userId: string, callback: (supplements: any[]) => void) {
    try {
      const q = query(
        collection(db, 'supplements'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const supplements = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        callback(supplements);
      }, (error) => {
        console.error('Error in supplements subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up supplements subscription:', error);
      throw error;
    }
  },

  // Wellness
  async addWellness(userId: string, wellness: any) {
    try {
      const docRef = await addDoc(collection(db, 'wellness'), {
        ...wellness,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding wellness to Firestore:', error);
      throw error;
    }
  },

  async updateWellness(id: string, wellness: any) {
    try {
      const docRef = doc(db, 'wellness', id);
      await updateDoc(docRef, {
        ...wellness,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating wellness in Firestore:', error);
      throw error;
    }
  },

  async deleteWellness(id: string) {
    try {
      await deleteDoc(doc(db, 'wellness', id));
    } catch (error) {
      console.error('Error deleting wellness from Firestore:', error);
      throw error;
    }
  },

  subscribeToWellness(userId: string, callback: (wellness: any[]) => void) {
    try {
      const q = query(
        collection(db, 'wellness'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const wellness = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        callback(wellness);
      }, (error) => {
        console.error('Error in wellness subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up wellness subscription:', error);
      throw error;
    }
  },

  // History Collection - New comprehensive tracking
  async addHistoryEntry(userId: string, historyEntry: any) {
    try {
      // Explicitly structure the document to ensure userId is always set correctly
      const documentData = {
        itemType: historyEntry.itemType,
        itemId: historyEntry.itemId,
        name: historyEntry.name,
        details: historyEntry.details || '',
        date: historyEntry.date,
        completedAt: historyEntry.completedAt instanceof Date ? Timestamp.fromDate(historyEntry.completedAt) : Timestamp.now(),
        scheduleItemId: historyEntry.scheduleItemId,
        metadata: historyEntry.metadata || {},
        // Ensure userId is always set from the parameter, not from historyEntry
        userId: userId,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'history'), documentData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding history entry to Firestore:', error);
      throw error;
    }
  },

  async updateHistoryEntry(id: string, historyEntry: any) {
    try {
      const docRef = doc(db, 'history', id);
      await updateDoc(docRef, {
        ...historyEntry,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating history entry in Firestore:', error);
      throw error;
    }
  },

  async deleteHistoryEntry(id: string) {
    try {
      const docRef = doc(db, 'history', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting history entry from Firestore:', error);
      throw error;
    }
  },

  async getCompletions(userId: string) {
    const q = query(
      collection(db, 'users', userId, 'completions'),
      orderBy('completedAt', 'desc'),
      limit(100) // Limit to last 100 completions for performance
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as any);
  },

  async addMemory(userId: string, memory: any) {
    // Ensure memory has an ID
    const memoryId = memory.id || `memory-${Date.now()}`;
    const memoryRef = doc(db, 'users', userId, 'memories', memoryId);
    await setDoc(memoryRef, { ...memory, id: memoryId, updatedAt: new Date() });
  },

  async getMemories(userId: string) {
    const q = query(collection(db, 'users', userId, 'memories'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as any);
  },

  subscribeToMemories(userId: string, callback: (memories: any[]) => void) {
    try {
      const q = query(
        collection(db, 'users', userId, 'memories'),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const memories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        callback(memories);
      }, (error) => {
        console.error('Error in memories subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up memories subscription:', error);
      throw error;
    }
  },

  subscribeToHistory(userId: string, callback: (history: any[]) => void) {
    try {
      const q = query(
        collection(db, 'history'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        callback(history);
      }, (error) => {
        console.error('Error in history subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up history subscription:', error);
      throw error;
    }
  },

  // Schedule Items (renamed from completions)
  async addScheduleItem(userId: string, scheduleItem: any) {
    try {
      // Use the provided ID to prevent duplicates
      const docRef = doc(db, 'schedule', scheduleItem.id);
      await setDoc(docRef, {
        ...scheduleItem,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return scheduleItem.id;
    } catch (error) {
      console.error('Error adding schedule item to Firestore:', error);
      throw error;
    }
  },

  async updateScheduleItem(id: string, scheduleItem: any) {
    try {
      const docRef = doc(db, 'schedule', id);
      await setDoc(docRef, {
        ...scheduleItem,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating schedule item in Firestore:', error);
      throw error;
    }
  },

  async deleteScheduleItem(id: string) {
    try {
      await deleteDoc(doc(db, 'schedule', id));
    } catch (error) {
      console.error('Error deleting schedule item from Firestore:', error);
      throw error;
    }
  },

  subscribeToScheduleItems(userId: string, callback: (scheduleItems: any[]) => void) {
    try {
      const q = query(
        collection(db, 'schedule'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        orderBy('time', 'asc')
      );

      return onSnapshot(q, (snapshot) => {
        const scheduleItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        callback(scheduleItems);
      }, (error) => {
        console.error('Error in schedule items subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up schedule items subscription:', error);
      throw error;
    }
  },

  // Legacy Completions (for backward compatibility)
  async addCompletion(userId: string, completion: any) {
    try {
      const docRef = await addDoc(collection(db, 'completions'), {
        ...completion,
        userId,
        completedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding completion to Firestore:', error);
      throw error;
    }
  },

  subscribeToCompletions(userId: string, callback: (completions: any[]) => void) {
    try {
      const q = query(
        collection(db, 'completions'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const completions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate(),
        }));
        callback(completions);
      }, (error) => {
        console.error('Error in completions subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up completions subscription:', error);
      throw error;
    }
  },

  // Settings
  async updateSettings(userId: string, settings: any) {
    try {
      const docRef = doc(db, 'settings', userId);
      await setDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating settings in Firestore:', error);
      throw error;
    }
  },

  subscribeToSettings(userId: string, callback: (settings: any) => void) {
    try {
      const docRef = doc(db, 'settings', userId);

      return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            id: doc.id,
            ...data,
            updatedAt: data.updatedAt?.toDate()
          });
        } else {
          // Create default settings if none exist
          const defaultSettings = {
            userId,
            aiEnabled: true,
            darkMode: true,
            notifications: true,
            timezone: 'UTC',
            updatedAt: new Date()
          };
          callback(defaultSettings);
        }
      }, (error) => {
        console.error('Error in settings subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up settings subscription:', error);
      throw error;
    }
  },

  // Profile
  async updateProfile(userId: string, profile: any) {
    try {
      const docRef = doc(db, 'profiles', userId);
      await setDoc(docRef, {
        ...profile,
        userId,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating profile in Firestore:', error);
      throw error;
    }
  },

  async getProfile(userId: string) {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting profile from Firestore:', error);
      throw error;
    }
  },

  subscribeToProfile(userId: string, callback: (profile: any) => void) {
    try {
      const docRef = doc(db, 'profiles', userId);

      return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          });
        } else {
          // Create default profile if none exists
          const defaultProfile = {
            userId,
            firstName: '',
            lastName: '',
            age: '',
            height: '',
            weight: '',
            goals: '',
            timezone: 'UTC',
            onboardingCompleted: false,
            updatedAt: new Date()
          };
          callback(defaultProfile);
        }
      }, (error) => {
        console.error('Error in profile subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error setting up profile subscription:', error);
      throw error;
    }
  }
};