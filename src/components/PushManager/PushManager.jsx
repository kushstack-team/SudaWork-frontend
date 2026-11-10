import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/auth';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import { enablePush, getPermission, isOptedOut, isPushSupported, syncPushToken } from '../../services/push/push';
import './PushManager.css';

const PROMPT_DISMISSED_KEY = 'sudawork_push_prompt_dismissed_at';
const PROMPT_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
const PROMPT_DELAY_MS = 4000;
const TOAST_MS = 7000;

const promptSnoozed = () => {
  try {
    const at = Number(localStorage.getItem(PROMPT_DISMISSED_KEY));
    return Boolean(at) && Date.now() - at < PROMPT_SNOOZE_MS;
  } catch {
    return false;
  }
};

// Pushes carry absolute links; navigate inside the app when it's ours.
const toAppPath = (link) => {
  try {
    const url = new URL(link, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}` : null;
  } catch {
    return null;
  }
};

/**
 * Push notifications glue, mounted once at the app root:
 *  - registers this browser after sign-in when permission was already granted
 *  - offers to turn notifications on (a card, never an unprompted browser popup)
 *  - turns pushes received while the site is open into an in-app toast
 */
export default function PushManager() {
  const { user } = useAuth();
  const { isFeatureAvailable } = usePlatform();
  const navigate = useNavigate();
  const [supported, setSupported] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [toast, setToast] = useState(null);

  const active = Boolean(user?.id && user.emailVerified && isFeatureAvailable(FEATURES.NOTIFICATIONS));

  // Only signed-in users can receive push, so only they load the Firebase SDK.
  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    isPushSupported().then((ok) => !cancelled && setSupported(ok));
    return () => { cancelled = true; };
  }, [active]);

  const sync = useCallback(() => {
    syncPushToken().catch((err) => console.warn('[push] Could not register this browser:', err.message));
  }, []);

  // Register on sign-in, and again when the server dropped this device's token
  // (password change signs out other devices and clears their tokens).
  useEffect(() => {
    if (!active || !supported) return undefined;
    sync();
    window.addEventListener('sudawork:push-resync', sync);
    return () => window.removeEventListener('sudawork:push-resync', sync);
  }, [active, supported, sync, user?.id]);

  // Offer to turn notifications on, a moment after the page settles.
  useEffect(() => {
    if (!active || !supported || getPermission() !== 'default' || isOptedOut() || promptSnoozed()) return undefined;
    const timer = setTimeout(() => setShowPrompt(true), PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active, supported]);

  // Pushes that arrive while the site is focused come here instead of the system tray.
  useEffect(() => {
    if (!supported) return undefined;
    let timer;
    const onMessage = (event) => {
      if (event.data?.type === 'sudawork:push-resubscribe') {
        window.dispatchEvent(new Event('sudawork:push-resync'));
        return;
      }
      if (event.data?.type !== 'sudawork:push') return;
      window.dispatchEvent(new Event('sudawork:notifications-changed'));
      setToast(event.data.payload);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), TOAST_MS);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => {
      clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, [supported]);

  const dismissPrompt = () => {
    setShowPrompt(false);
    try { localStorage.setItem(PROMPT_DISMISSED_KEY, String(Date.now())); } catch { /* storage unavailable */ }
  };

  const handleEnable = async () => {
    setEnabling(true);
    try {
      const result = await enablePush();
      if (result !== 'default') setShowPrompt(false);
      if (result === 'denied') dismissPrompt();
    } catch (err) {
      console.warn('[push] Could not enable notifications:', err.message);
      setShowPrompt(false);
    } finally {
      setEnabling(false);
    }
  };

  const openToast = () => {
    const path = toast?.link && toAppPath(toast.link);
    setToast(null);
    if (path) navigate(path);
  };

  return (
    <>
      {active && showPrompt && (
        <div className="push-prompt" role="dialog" aria-labelledby="push-prompt-title" dir="rtl">
          <button type="button" className="push-prompt__close" onClick={dismissPrompt} aria-label="إغلاق">
            <FiX />
          </button>
          <div className="push-prompt__icon" aria-hidden="true"><FiBell /></div>
          <div className="push-prompt__body">
            <h3 id="push-prompt-title" className="push-prompt__title">فعّل الإشعارات</h3>
            <p className="push-prompt__text">
              ليصلك تنبيه فوري عند وصول عرض جديد أو رسالة أو تحديث على مدفوعاتك، حتى لو كان الموقع مغلقاً.
            </p>
            <div className="push-prompt__actions">
              <button type="button" className="push-prompt__primary" onClick={handleEnable} disabled={enabling}>
                {enabling ? 'جارٍ التفعيل...' : 'تفعيل الإشعارات'}
              </button>
              <button type="button" className="push-prompt__secondary" onClick={dismissPrompt} disabled={enabling}>
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="push-toast" role="status" aria-live="polite" dir="rtl">
          <button type="button" className="push-toast__content" onClick={openToast}>
            <span className="push-toast__icon" aria-hidden="true"><FiBell /></span>
            <span className="push-toast__text">
              <strong>{toast.title}</strong>
              {toast.body && <span>{toast.body}</span>}
            </span>
          </button>
          <button type="button" className="push-toast__close" onClick={() => setToast(null)} aria-label="إغلاق">
            <FiX />
          </button>
        </div>
      )}
    </>
  );
}
