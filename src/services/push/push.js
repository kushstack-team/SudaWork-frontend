/**
 * Browser push notifications through Firebase Cloud Messaging.
 *
 * The Firebase SDK is used only to obtain this browser's FCM token. Messages
 * are displayed by our own service worker (public/firebase-messaging-sw.js),
 * and the token is stored by the API, which sends a push for every in-app
 * notification. The VITE_FIREBASE_* values are public identifiers, not secrets.
 *
 * The SDK is loaded on demand, so visitors who never use push don't download it.
 */
import { api } from '../api';

const loadSdk = () => Promise.all([import('firebase/app'), import('firebase/messaging')])
  .then(([app, messaging]) => ({ ...app, ...messaging }));

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const SW_URL = '/firebase-messaging-sw.js';

// The user turned push off on this browser; respected until they turn it on.
const OPT_OUT_KEY = 'sudawork_push_opted_out';
const TOKEN_KEY = 'sudawork_push_token';

const storage = {
  get: (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key, value) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch { /* storage unavailable (e.g. private mode) */ }
  },
};

export const isPushConfigured = () => Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId && VAPID_KEY
);

// iPhone/iPad only support web push for sites added to the Home Screen.
export const isIosBrowserTab = () => {
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  return ios && !standalone;
};

let supportPromise = null;
/** Resolves true when this browser can receive push and Firebase is configured. */
export const isPushSupported = () => {
  if (!supportPromise) {
    supportPromise = (async () => {
      if (!isPushConfigured()) return false;
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) {
        return false;
      }
      try {
        const { isSupported } = await loadSdk();
        return await isSupported();
      } catch {
        return false;
      }
    })();
  }
  return supportPromise;
};

/** 'default' | 'granted' | 'denied' | 'unsupported' */
export const getPermission = () => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

export const isOptedOut = () => storage.get(OPT_OUT_KEY) === '1';

let messaging = null;
const getClient = async () => {
  const sdk = await loadSdk();
  if (!messaging) {
    const app = sdk.getApps().find((a) => a.name === 'sudawork') || sdk.initializeApp(firebaseConfig, 'sudawork');
    messaging = sdk.getMessaging(app);
  }
  return { sdk, messaging };
};

const registerWorker = () => navigator.serviceWorker.register(SW_URL, { scope: '/' });

const fetchToken = async () => {
  const registration = await registerWorker();
  const { sdk, messaging: client } = await getClient();
  return sdk.getToken(client, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
};

/**
 * Registers this browser with the API when permission is already granted and
 * the user hasn't opted out. Safe to call on every sign-in/session refresh.
 */
export const syncPushToken = async () => {
  if (!(await isPushSupported())) return false;
  const previous = storage.get(TOKEN_KEY);

  // Permission was removed in the browser settings (or the user opted out):
  // tell the server to stop sending to this browser.
  if (getPermission() !== 'granted' || isOptedOut()) {
    if (previous) {
      storage.set(TOKEN_KEY, null);
      await api.notifications.unregisterPushToken(previous).catch(() => {});
    }
    return false;
  }

  const token = await fetchToken();
  if (!token) return false;
  await api.notifications.registerPushToken(token);
  storage.set(TOKEN_KEY, token);
  // Firebase rotated this browser's token: drop the old one on the server.
  if (previous && previous !== token) await api.notifications.unregisterPushToken(previous).catch(() => {});
  return true;
};

/**
 * Asks for permission (must run from a click) and registers this browser.
 * Resolves the resulting permission: 'granted' | 'denied' | 'default' | 'unsupported'.
 */
export const enablePush = async () => {
  if (!(await isPushSupported())) return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;
  storage.set(OPT_OUT_KEY, null);
  await syncPushToken();
  return 'granted';
};

/** Stops pushes to this browser (the in-app notification list is unaffected). */
export const disablePush = async () => {
  storage.set(OPT_OUT_KEY, '1');
  const token = storage.get(TOKEN_KEY);
  storage.set(TOKEN_KEY, null);
  if (token) await api.notifications.unregisterPushToken(token).catch(() => {});
  if (await isPushSupported()) {
    const { sdk, messaging: client } = await getClient();
    await sdk.deleteToken(client).catch(() => {});
  }
};
