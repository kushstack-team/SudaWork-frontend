/*
 * SudaWork push notifications (Firebase Cloud Messaging).
 *
 * The API sends data-only messages: { title, body, link, type }. This worker
 * shows them as system notifications and opens the right page when tapped.
 * When a SudaWork tab is open and focused, it tells the tab instead, which
 * shows an in-app toast and refreshes the notification counters.
 *
 * No Firebase SDK is needed here: FCM delivers through the standard Push API.
 */

const DEFAULT_TITLE = 'سوداوورك';
const ICON = '/icon-512.png';
const BADGE = '/notification-badge.png';
// Safari / iOS (WebKit without Chrome or Firefox engines).
const UA = self.navigator?.userAgent || '';
const IS_APPLE_WEBKIT = /AppleWebKit/.test(UA) && !/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS|Android/.test(UA);

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

const readPayload = (event) => {
  if (!event.data) return {};
  try {
    const json = event.data.json();
    // FCM wraps data messages as { data: {...} }; notification messages as { notification: {...} }.
    return { ...(json.notification || {}), ...(json.data || {}) };
  } catch {
    return { body: event.data.text() };
  }
};

self.addEventListener('push', (event) => {
  const data = readPayload(event);
  const title = data.title || DEFAULT_TITLE;
  const body = data.body || '';
  const link = data.link || '/notifications';

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    windows.forEach((client) => client.postMessage({ type: 'sudawork:push', payload: { title, body, link, type: data.type } }));

    // The user is looking at the site: the in-app toast is enough. Not on
    // Apple devices: Safari requires every push to show a notification and
    // may revoke the permission of sites that skip it.
    const looking = windows.some((client) => client.focused && client.visibilityState === 'visible');
    if (looking && !IS_APPLE_WEBKIT) return;

    await self.registration.showNotification(title, {
      body,
      icon: ICON,
      badge: BADGE,
      dir: 'rtl',
      lang: 'ar',
      // One entry per page: a newer notification about the same thing
      // replaces the older one instead of piling up.
      tag: link,
      renotify: true,
      data: { link },
    });
  })());
});

// The browser replaced this device's push subscription: open tabs re-register
// it now; otherwise the app does on its next visit.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    windows.forEach((client) => client.postMessage({ type: 'sudawork:push-resubscribe' }));
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.link || '/notifications', self.location.origin);

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Reuse an open SudaWork tab when there is one.
    const tab = windows.find((client) => new URL(client.url).origin === target.origin);
    if (tab) {
      await tab.focus();
      if ('navigate' in tab) return tab.navigate(target.href);
      return undefined;
    }
    return self.clients.openWindow(target.href);
  })());
});
