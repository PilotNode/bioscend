import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BioScendDB extends DBSchema {
  supplements: {
    key: string;
    value: {
      id: string;
      name: string;
      dosage: string;
      quantity: number;
      schedule: string;
      timeOfDay: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 'userId': string };
  };
  wellness: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      duration: number;
      schedule: string;
      timeOfDay: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 'userId': string };
  };
  completions: {
    key: string;
    value: {
      id: string;
      itemId: string;
      itemType: 'supplement' | 'wellness';
      completedAt: Date;
      userId: string;
      date: string;
    };
    indexes: { 'userId': string; 'date': string };
  };
  history: {
    key: string;
    value: {
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
    };
    indexes: { 'userId': string; 'date': string; 'itemId': string; 'completedAt': Date };
  };
  schedule: {
    key: string;
    value: {
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
    };
    indexes: { 'userId': string; 'date': string; 'itemId': string };
  };
  settings: {
    key: string;
    value: {
      userId: string;
      aiEnabled: boolean;
      darkMode: boolean;
      notifications: boolean;
      timezone: string;
      updatedAt: Date;
    };
  };
  memories: {
    key: string;
    value: {
      id: string;
      userId: string;
      content: string;
      type: 'user_preference' | 'conversation_context' | 'important_fact';
      createdAt: Date;
      updatedAt: Date;
      synced?: boolean;
    };
    indexes: { 'userId': string; 'key': string };
  };
}

let dbPromise: Promise<IDBPDatabase<BioScendDB>>;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<BioScendDB>('bioscend-db', 3, {
      upgrade(db, oldVersion) {
        // Create object stores
        if (!db.objectStoreNames.contains('supplements')) {
          const supplementStore = db.createObjectStore('supplements', { keyPath: 'id' });
          supplementStore.createIndex('userId', 'userId');
        }

        if (!db.objectStoreNames.contains('wellness')) {
          const wellnessStore = db.createObjectStore('wellness', { keyPath: 'id' });
          wellnessStore.createIndex('userId', 'userId');
        }

        if (!db.objectStoreNames.contains('completions')) {
          const completionStore = db.createObjectStore('completions', { keyPath: 'id' });
          completionStore.createIndex('userId', 'userId', { unique: false });
          completionStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('memories')) {
          const memoryStore = db.createObjectStore('memories', { keyPath: 'id' });
          memoryStore.createIndex('userId', 'userId', { unique: false });
          memoryStore.createIndex('key', 'key', { unique: false });
        }

        // Add history store in version 3
        if (oldVersion < 3 && !db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('userId', 'userId');
          historyStore.createIndex('date', 'date');
          historyStore.createIndex('itemId', 'itemId');
          historyStore.createIndex('completedAt', 'completedAt');
        }

        // Add schedule store in version 2
        if (oldVersion < 2 && !db.objectStoreNames.contains('schedule')) {
          const scheduleStore = db.createObjectStore('schedule', { keyPath: 'id' });
          scheduleStore.createIndex('userId', 'userId');
          scheduleStore.createIndex('date', 'date');
          scheduleStore.createIndex('itemId', 'itemId');
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'userId' });
        }
      }
    });
  }
  return dbPromise;
};

export const offlineStorage = {
  async addSupplement(supplement: any) {
    const db = await getDB();
    await db.add('supplements', supplement);
  },

  async getSupplements(userId: string) {
    const db = await getDB();
    return db.getAllFromIndex('supplements', 'userId', userId);
  },

  async updateSupplement(supplement: any) {
    const db = await getDB();
    await db.put('supplements', supplement);
  },

  async deleteSupplement(id: string) {
    const db = await getDB();
    await db.delete('supplements', id);
  },

  async addWellness(wellness: any) {
    const db = await getDB();
    await db.add('wellness', wellness);
  },

  async getWellness(userId: string) {
    const db = await getDB();
    return db.getAllFromIndex('wellness', 'userId', userId);
  },

  async updateWellness(wellness: any) {
    const db = await getDB();
    await db.put('wellness', wellness);
  },

  async deleteWellness(id: string) {
    const db = await getDB();
    await db.delete('wellness', id);
  },

  async addCompletion(completion: any) {
    const db = await getDB();
    await db.add('completions', completion);
  },

  async getCompletions(userId: string, date?: string) {
    const db = await getDB();
    if (date) {
      return db.getAllFromIndex('completions', 'date', date);
    }
    return db.getAllFromIndex('completions', 'userId', userId);
  },

  // History methods
  async addHistoryEntry(historyEntry: any) {
    const db = await getDB();
    await db.put('history', historyEntry);
  },

  async getHistory(userId: string, startDate?: string, endDate?: string) {
    const db = await getDB();
    if (startDate && endDate) {
      // For date range queries, we'll get all and filter
      const allHistory = await db.getAllFromIndex('history', 'userId', userId);
      return allHistory.filter(entry => entry.date >= startDate && entry.date <= endDate);
    }
    return db.getAllFromIndex('history', 'userId', userId);
  },

  async updateHistoryEntry(historyEntry: any) {
    const db = await getDB();
    await db.put('history', historyEntry);
  },

  async deleteHistoryEntry(id: string) {
    const db = await getDB();
    await db.delete('history', id);
  },

  // Schedule methods
  async addScheduleItem(scheduleItem: any) {
    const db = await getDB();
    await db.put('schedule', scheduleItem);
  },

  async getScheduleItems(userId: string, date?: string) {
    const db = await getDB();
    if (date) {
      return db.getAllFromIndex('schedule', 'date', date);
    }
    return db.getAllFromIndex('schedule', 'userId', userId);
  },

  async updateScheduleItem(scheduleItem: any) {
    const db = await getDB();
    await db.put('schedule', scheduleItem);
  },

  async deleteScheduleItem(id: string) {
    const db = await getDB();
    await db.delete('schedule', id);
  },

  async getSettings(userId: string) {
    const db = await getDB();
    return db.get('settings', userId);
  },

  async updateSettings(settings: any) {
    const db = await getDB();
    await db.put('settings', settings);
  },

  // Memory methods
  async addMemory(memory: any) {
    const db = await getDB();
    await db.put('memories', memory);
  },

  async getMemories(userId: string) {
    const db = await getDB();
    return db.getAllFromIndex('memories', 'userId', userId);
  }
};