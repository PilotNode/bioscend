import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

// Minimal ScheduleItem shape expected by the service
interface ScheduleItemLike {
  id: string;
  name: string;
  details: string;
  time: string;       // "HH:mm" format, e.g. "08:00"
  date: string;       // "yyyy-MM-dd" format
  itemType: 'supplement' | 'wellness';
  completed: boolean;
}

/**
 * Cross-platform notification service.
 *
 * On native (Capacitor): uses @capacitor/local-notifications for reliable,
 * background-capable alarms.
 *
 * On web: uses the browser Notification API. Notifications only fire while
 * the tab is open or the PWA Service Worker is active. True push notifications
 * would require a backend (e.g. Firebase Cloud Messaging) which is out of
 * scope for this milestone.
 */
class NotificationService {
  private isNative: boolean;
  private webTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private permissionGranted: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  // ─── Permissions ─────────────────────────────────────────────

  async requestPermissions(): Promise<boolean> {
    try {
      if (this.isNative) {
        const result = await LocalNotifications.requestPermissions();
        this.permissionGranted = result.display === 'granted';
      } else {
        // Web Notification API
        if (!('Notification' in window)) {
          console.warn('NotificationService: browser does not support notifications');
          this.permissionGranted = false;
          return false;
        }
        const result = await Notification.requestPermission();
        this.permissionGranted = result === 'granted';
      }
    } catch (error) {
      console.error('NotificationService: permission request failed', error);
      this.permissionGranted = false;
    }
    return this.permissionGranted;
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (this.isNative) {
        const result = await LocalNotifications.checkPermissions();
        this.permissionGranted = result.display === 'granted';
      } else {
        if (!('Notification' in window)) return false;
        this.permissionGranted = Notification.permission === 'granted';
      }
    } catch {
      this.permissionGranted = false;
    }
    return this.permissionGranted;
  }

  // ─── Scheduling ──────────────────────────────────────────────

  /**
   * Syncs local notifications to match the given schedule items.
   * Cancels all existing notifications first, then schedules new ones
   * for every *incomplete* item whose time has not yet passed today.
   */
  async syncNotifications(items: ScheduleItemLike[]): Promise<void> {
    if (!this.permissionGranted) {
      const granted = await this.checkPermissions();
      if (!granted) return;
    }

    // Cancel everything first for a clean slate
    await this.cancelAll();

    const now = new Date();
    const upcomingItems = items.filter(item => {
      if (item.completed) return false;
      const itemDate = this.parseScheduleDateTime(item.date, item.time);
      return itemDate > now;
    });

    if (upcomingItems.length === 0) return;

    if (this.isNative) {
      await this.scheduleNative(upcomingItems);
    } else {
      this.scheduleWeb(upcomingItems);
    }
  }

  /**
   * Schedule a single reminder (used when a new item is added).
   */
  async scheduleOne(item: ScheduleItemLike): Promise<void> {
    if (!this.permissionGranted) return;
    if (item.completed) return;

    const fireDate = this.parseScheduleDateTime(item.date, item.time);
    if (fireDate <= new Date()) return;

    if (this.isNative) {
      await this.scheduleNative([item]);
    } else {
      this.scheduleWeb([item]);
    }
  }

  // ─── Native (Capacitor) ──────────────────────────────────────

  private async scheduleNative(items: ScheduleItemLike[]): Promise<void> {
    const notifications: ScheduleOptions['notifications'] = items.map((item) => {
      const fireDate = this.parseScheduleDateTime(item.date, item.time);
      const content = this.generateNotificationContent(item);
      
      return {
        id: this.generateNumericId(item.id),
        title: content.title,
        body: content.body,
        schedule: { at: fireDate },
        sound: undefined,
        smallIcon: 'ic_stat_icon_config_sample', // Android default
        iconColor: '#20C997',
      };
    });

    try {
      await LocalNotifications.schedule({ notifications });
      console.log(`NotificationService: scheduled ${notifications.length} native notifications`);
    } catch (error) {
      console.error('NotificationService: failed to schedule native notifications', error);
    }
  }

  // ─── Web (Browser) ───────────────────────────────────────────

  private scheduleWeb(items: ScheduleItemLike[]): void {
    for (const item of items) {
      const fireDate = this.parseScheduleDateTime(item.date, item.time);
      const delay = fireDate.getTime() - Date.now();
      if (delay <= 0) continue;

      const content = this.generateNotificationContent(item);

      const timer = setTimeout(() => {
        try {
          new Notification(content.title, {
            body: content.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: item.id, // Replaces existing notification with same tag
          });
        } catch (error) {
          console.error('NotificationService: web notification failed', error);
        }
        this.webTimers.delete(item.id);
      }, delay);

      this.webTimers.set(item.id, timer);
    }

    console.log(`NotificationService: scheduled ${items.length} web notifications`);
  }

  // ─── Cancel ──────────────────────────────────────────────────

  async cancelAll(): Promise<void> {
    // Cancel web timers
    for (const timer of this.webTimers.values()) {
      clearTimeout(timer);
    }
    this.webTimers.clear();

    // Cancel native notifications
    if (this.isNative) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }
      } catch (error) {
        console.error('NotificationService: failed to cancel native notifications', error);
      }
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────

  private parseScheduleDateTime(dateStr: string, timeStr: string, bufferMinutes = 5): Date {
    // dateStr: "2026-03-15", timeStr: "08:00" or "14:30"
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Create base date
    const date = new Date(year, month - 1, day, hours || 8, minutes || 0, 0);
    // Subtract buffer time (e.g. 5 minutes before)
    date.setMinutes(date.getMinutes() - bufferMinutes);
    return date;
  }

  /**
   * Capacitor local notifications require a numeric ID.
   * We generate a stable int32 hash from the string ID.
   */
  private generateNumericId(stringId: string): number {
    let hash = 0;
    for (let i = 0; i < stringId.length; i++) {
      const char = stringId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32-bit int
    }
    return Math.abs(hash);
  }

  /**
   * Generates dynamic, engaging titles and bodies for notifications
   * instead of boilerplate text.
   */
  private generateNotificationContent(item: ScheduleItemLike): { title: string; body: string; emoji: string } {
    const isSupplement = item.itemType === 'supplement';
    
    // Determine time of day purely for contextual copy
    const hour = parseInt(item.time.split(':')[0], 10) || 8;
    let timeContext = '';
    if (hour >= 5 && hour < 12) timeContext = 'Morning';
    else if (hour >= 12 && hour < 17) timeContext = 'Afternoon';
    else if (hour >= 17 && hour < 22) timeContext = 'Evening';
    else timeContext = 'Night';

    const supplementTitles = [
      `Time to refuel!`,
      `Your ${timeContext} boost is ready!`,
      `Don't skip your stack!`,
      `Stay consistent!`,
      `Health check-in:`
    ];

    const wellnessTitles = [
      `Time for yourself!`,
      `Take a breather.`,
      `Your ${timeContext} wellness moment!`,
      `Self-care o'clock!`,
      `Ready to recharge?`
    ];

    const emoji = isSupplement ? '💊' : '🧘';
    
    // Pick a deterministic random copy based on the item ID so it doesn't flicker on quick re-syncs
    const hash = this.generateNumericId(item.id + item.date);
    const titlePool = isSupplement ? supplementTitles : wellnessTitles;
    const randomTitle = titlePool[hash % titlePool.length];
    
    const title = `${emoji} ${randomTitle}`;
    
    let body = `It's time for ${item.name}.`;
    if (item.details) {
      if (isSupplement) {
         body += ` Take ${item.details}.`;
      } else {
         body += ` (${item.details}).`;
      }
    }
    
    const extraMotivations = [
      " Keep your streak alive! 🚀",
      " You've got this! 💪",
      " Your baseline is depending on it! ✨",
      " Small habits, big results! 📈",
      " Consistency is key! 🔑"
    ];
    body += extraMotivations[hash % extraMotivations.length];

    return { title, body, emoji };
  }
}

export const notificationService = new NotificationService();
