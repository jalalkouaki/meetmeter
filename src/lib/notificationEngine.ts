// Native OS & Browser Notifications Engine for rational meeting time checkpoints

export interface ActiveToast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: number;
}

class NotificationEngine {
  private hasRequestedPermission = false;
  private onToastCallback: ((toast: ActiveToast) => void) | null = null;

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasRequestedPermission = true;
      return permission === 'granted';
    }

    return false;
  }

  setToastHandler(callback: (toast: ActiveToast) => void): void {
    this.onToastCallback = callback;
  }

  /**
   * Sends both an OS native notification and an in-app banner toast.
   */
  sendReminder(
    title: string,
    message: string,
    type: 'info' | 'warning' | 'alert' | 'success' = 'info'
  ): void {
    // 1. In-App Banner Toast
    if (this.onToastCallback) {
      this.onToastCallback({
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title,
        message,
        type,
        timestamp: Date.now(),
      });
    }

    // 2. Native OS Notification
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body: message,
          icon: '/vite.svg',
          silent: false,
        });

        // Auto close after 5 seconds
        setTimeout(() => notif.close(), 5000);
      }
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}

export const notificationEngine = new NotificationEngine();
