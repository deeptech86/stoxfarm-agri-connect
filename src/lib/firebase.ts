/**
 * Firebase Configuration and Initialization
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// VAPID key for web push notifications
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Firebase app instance
let app: FirebaseApp | null = null;

// Firebase messaging instance
let messaging: Messaging | null = null;

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

/**
 * Initialize Firebase app
 */
export const initializeFirebase = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured. Push notifications will be disabled.');
    return null;
  }

  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return null;
    }
  }

  return app;
};

/**
 * Get Firebase Messaging instance
 * Returns null if messaging is not supported or Firebase is not configured
 */
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  // Check if messaging is supported in this browser
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser.');
    return null;
  }

  if (!messaging) {
    const firebaseApp = initializeFirebase();
    if (!firebaseApp) {
      return null;
    }

    try {
      messaging = getMessaging(firebaseApp);
    } catch (error) {
      console.error('Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }

  return messaging;
};

/**
 * Get the Firebase app instance
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  return app;
};

export default {
  initializeFirebase,
  getFirebaseMessaging,
  getFirebaseApp,
  isFirebaseConfigured,
  VAPID_KEY,
};
