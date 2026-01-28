/**
 * Firebase Messaging Service Worker
 * Handles background push notifications
 */

/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration for service worker
const firebaseConfig = {
  apiKey: 'AIzaSyADecnOGgK3YXNSD6Gwn9C1G1Hk96GIQ1E',
  authDomain: 'stoxxfarm.firebaseapp.com',
  projectId: 'stoxxfarm',
  storageBucket: 'stoxxfarm.firebasestorage.app',
  messagingSenderId: '512555278240',
  appId: '1:512555278240:web:aa3715c4f5fe72edc04ec5',
};

// Initialize Firebase only if configured
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'StoxxFarm Notification';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: payload.data?.notificationId || 'stoxxfarm-notification',
      data: payload.data || {},
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Default action or 'view' action - open the app
  const urlToOpen = notificationData?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (notificationData?.url) {
            client.navigate(urlToOpen);
          }
          return;
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push event directly (fallback)
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[firebase-messaging-sw.js] Push event with no data');
    return;
  }

  try {
    const payload = event.data.json();
    console.log('[firebase-messaging-sw.js] Push event received:', payload);

    // If Firebase messaging didn't handle it, show notification manually
    if (payload.notification) {
      const notificationTitle = payload.notification.title || 'StoxxFarm';
      const notificationOptions = {
        body: payload.notification.body || 'New notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data || {},
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling push event:', error);
  }
});

console.log('[firebase-messaging-sw.js] Service worker loaded');
