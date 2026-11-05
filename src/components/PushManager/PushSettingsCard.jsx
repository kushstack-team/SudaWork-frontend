import { useEffect, useState } from 'react';
import { FiBell, FiBellOff, FiSmartphone } from 'react-icons/fi';
import {
  disablePush,
  enablePush,
  getPermission,
  isIosBrowserTab,
  isOptedOut,
  isPushConfigured,
  isPushSupported,
} from '../../services/push/push';
import './PushSettingsCard.css';

const readState = (supported) => {
  if (!supported) return isIosBrowserTab() ? 'ios' : 'unsupported';
  const permission = getPermission();
  if (permission === 'denied') return 'blocked';
  if (permission === 'granted' && !isOptedOut()) return 'on';
  return 'off';
};

/** "Notifications on this device" control for the notifications page. */
export default function PushSettingsCard() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    isPushSupported().then((ok) => !cancelled && setState(readState(ok)));
    return () => { cancelled = true; };
  }, []);

  // Nothing to offer until Firebase is configured, or on browsers without push.
  if (!isPushConfigured() || state === null || state === 'unsupported') return null;

  const run = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setState(readState(true));
    } catch {
      setError('تعذر تحديث إعداد الإشعارات. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  };

  const content = {
    on: {
      icon: FiBell,
      tone: 'on',
      title: 'إشعارات الجهاز مفعّلة',
      text: 'تصلك التنبيهات على هذا الجهاز حتى عندما يكون الموقع مغلقاً.',
      action: { label: 'إيقاف على هذا الجهاز', onClick: () => run(disablePush), secondary: true },
    },
    off: {
      icon: FiBellOff,
      tone: 'off',
      title: 'إشعارات الجهاز غير مفعّلة',
      text: 'فعّلها ليصلك تنبيه فوري بالعروض والرسائل والمدفوعات حتى لو كان الموقع مغلقاً.',
      action: { label: 'تفعيل الإشعارات', onClick: () => run(enablePush) },
    },
    blocked: {
      icon: FiBellOff,
      tone: 'blocked',
      title: 'الإشعارات محظورة في متصفحك',
      text: 'لتفعيلها: اضغط على رمز القفل بجانب عنوان الموقع، ثم اختر «الإشعارات» واجعلها «سماح»، ثم أعد تحميل الصفحة.',
    },
    ios: {
      icon: FiSmartphone,
      tone: 'off',
      title: 'لتصلك الإشعارات على الآيفون',
      text: 'اضغط زر المشاركة في سفاري ثم «إضافة إلى الشاشة الرئيسية»، وافتح سوداوورك من أيقونته على الشاشة، ثم فعّل الإشعارات من هذه الصفحة.',
    },
  }[state];
  const Icon = content.icon;

  return (
    <section className={`push-settings push-settings--${content.tone}`} aria-label="إشعارات الجهاز">
      <span className="push-settings__icon" aria-hidden="true"><Icon /></span>
      <div className="push-settings__body">
        <h3 className="push-settings__title">{content.title}</h3>
        <p className="push-settings__text">{content.text}</p>
        {error && <p className="push-settings__error" role="alert">{error}</p>}
      </div>
      {content.action && (
        <button
          type="button"
          className={`push-settings__btn ${content.action.secondary ? 'push-settings__btn--secondary' : ''}`}
          onClick={content.action.onClick}
          disabled={busy}
        >
          {busy ? 'جارٍ التحديث...' : content.action.label}
        </button>
      )}
    </section>
  );
}
