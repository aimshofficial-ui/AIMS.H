import { AppNotification, SharedAppData } from '../types';
import { saveAppData } from './storage';

// Check if mobile alerts are enabled by user
export function isMobileAlertsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('aimsh_mobile_alerts_allowed') === 'true') return true;
  if ('Notification' in window && Notification.permission === 'granted') return true;
  return false;
}

// Trigger Mobile Vibration & System Push Notification & Sound Chime
export function triggerMobileAlert(options: {
  title: string;
  message: string;
  vibratePattern?: number[];
  onClick?: () => void;
}) {
  const { title, message, vibratePattern = [300, 150, 300, 150, 500] } = options;

  // 1. Mobile Vibration API
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(vibratePattern);
    } catch (e) {
      // unsupported or blocked
    }
  }

  // 2. Web Push Notification API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body: message,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
        if (options.onClick) {
          notif.onclick = () => {
            window.focus();
            options.onClick!();
          };
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/icon.svg',
            });
          }
        });
      }
    } catch (e) {
      // notification creation blocked in iframe
    }
  }

  // 3. Audio Chime (Synthesizer alert tone)
  if (typeof window !== 'undefined') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      // audio blocked
    }
  }
}

// Request Mobile Notification Permission explicitly & mark as allowed
export async function requestMobilePermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') {
    return 'denied';
  }

  try {
    localStorage.setItem('aimsh_mobile_alerts_allowed', 'true');
  } catch (e) {
    // ignore
  }

  let result: NotificationPermission = 'granted';
  if ('Notification' in window) {
    try {
      result = await Notification.requestPermission();
    } catch (e) {
      // In sandbox / iframe, requestPermission may reject, but we still allow in-app alerts
      result = 'granted';
    }
  }

  triggerMobileAlert({
    title: '🔔 Notifications & Vibration Enabled!',
    message: 'You will now receive instant real-time alerts from your co-founder partner.',
  });

  return result;
}

// Push notification entry to persistent shared state
export function pushAppNotification(
  appData: SharedAppData,
  notification: Omit<AppNotification, 'id' | 'isoTime' | 'isRead'>
): SharedAppData {
  const newNotif: AppNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    isoTime: new Date().toISOString(),
    isRead: false,
  };

  const updated: SharedAppData = {
    ...appData,
    notifications: [newNotif, ...(appData.notifications || [])].slice(0, 50),
  };

  saveAppData(updated, true);

  // Trigger local mobile vibration/sound
  triggerMobileAlert({
    title: newNotif.title,
    message: newNotif.message,
  });

  return updated;
}
