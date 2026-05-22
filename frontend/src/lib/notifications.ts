// src/lib/notifications.ts
// Browser notification helper for simulating push notifications

export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      tag: 'nprep-reply',
    });
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        new Notification(title, { body, icon: icon || '/pwa-192x192.png' });
      }
    });
  }
}

export function notifyStudentReply(topic: string, facultyName: string) {
  sendBrowserNotification(
    '📚 Your doubt was answered!',
    `${facultyName} replied to your question about ${topic}. Tap to view.`
  );
}
