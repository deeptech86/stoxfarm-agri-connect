/**
 * Firebase Cloud Messaging Service
 * Handles push notification permissions, tokens, and message handling
 */

import { getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { getFirebaseMessaging, VAPID_KEY, isFirebaseConfigured } from '@/lib/firebase';
import api from '@/lib/api';

export interface FcmTokenRegistration {
  fcm_token: string;
  device_name?: string;
  platform: 'web' | 'ios' | 'android';
}

export interface FcmMessage {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

// Store the current FCM token
let currentToken: string | null = null;

// Store the unsubscribe function for foreground messages
let messageUnsubscribe: Unsubscribe | null = null;

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Get the current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isPushNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Register the Firebase messaging service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    // Pass Firebase config to service worker via query params or postMessage
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    console.log('Firebase messaging service worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Failed to register service worker:', error);
    return null;
  }
};

/**
 * Get FCM token for this device
 */
export const getFcmToken = async (): Promise<string | null> => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured');
    return null;
  }

  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  const permission = getNotificationPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return null;
    }

    // Get the service worker registration
    const swRegistration = await navigator.serviceWorker.getRegistration('/');

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      currentToken = token;
      console.log('FCM token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Register FCM token with the backend
 */
export const registerFcmTokenWithBackend = async (token: string): Promise<boolean> => {
  try {
    const deviceInfo: FcmTokenRegistration = {
      fcm_token: token,
      device_name: getBrowserInfo(),
      platform: 'web',
    };

    await api.post('/devices/fcm-token', deviceInfo);
    console.log('FCM token registered with backend');
    return true;
  } catch (error) {
    console.error('Failed to register FCM token with backend:', error);
    return false;
  }
};

/**
 * Unregister FCM token from the backend
 */
export const unregisterFcmToken = async (): Promise<boolean> => {
  if (!currentToken) {
    return true;
  }

  try {
    await api.delete('/devices/fcm-token', {
      body: JSON.stringify({ fcm_token: currentToken }),
    });
    currentToken = null;
    console.log('FCM token unregistered from backend');
    return true;
  } catch (error) {
    console.error('Failed to unregister FCM token:', error);
    return false;
  }
};

/**
 * Initialize FCM and set up message handling
 * Returns the FCM token if successful
 */
export const initializeFcm = async (
  onForegroundMessage?: (message: FcmMessage) => void
): Promise<string | null> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping FCM initialization');
    return null;
  }

  // Request permission (silently handle denial - polling fallback is used)
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    // This is normal - user may have denied or browser blocked. System uses polling fallback.
    return null;
  }

  // Register service worker
  await registerServiceWorker();

  // Get FCM token
  const token = await getFcmToken();
  if (!token) {
    return null;
  }

  // Register token with backend
  await registerFcmTokenWithBackend(token);

  // Set up foreground message handler
  if (onForegroundMessage) {
    await setupForegroundMessageHandler(onForegroundMessage);
  }

  return token;
};

/**
 * Set up handler for foreground messages
 */
export const setupForegroundMessageHandler = async (
  onMessage_: (message: FcmMessage) => void
): Promise<void> => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return;
  }

  // Clean up any existing subscription
  if (messageUnsubscribe) {
    messageUnsubscribe();
  }

  messageUnsubscribe = onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    onMessage_({
      notification: payload.notification,
      data: payload.data,
    });
  });
};

/**
 * Clean up FCM subscriptions
 */
export const cleanupFcm = async (): Promise<void> => {
  if (messageUnsubscribe) {
    messageUnsubscribe();
    messageUnsubscribe = null;
  }

  await unregisterFcmToken();
  currentToken = null;
};

/**
 * Get current FCM token (if already obtained)
 */
export const getCurrentToken = (): string | null => {
  return currentToken;
};

/**
 * Get browser information for device name
 */
const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown Browser';

  if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
  } else if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
  } else if (userAgent.includes('Opera')) {
    browserName = 'Opera';
  }

  const platform = navigator.platform || 'Unknown Platform';
  return `${browserName} on ${platform}`;
};

export default {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  getFcmToken,
  registerFcmTokenWithBackend,
  unregisterFcmToken,
  initializeFcm,
  setupForegroundMessageHandler,
  cleanupFcm,
  getCurrentToken,
};
