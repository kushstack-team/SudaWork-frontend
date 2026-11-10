import { useEffect, useState } from 'react';
import { FiBriefcase } from 'react-icons/fi';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import './PushSettingsCard.css';

/**
 * Freelancers: "notify me about new projects in my specialty". Matching uses
 * the main specialty and skills from the profile.
 */
export default function ProjectAlertsCard() {
  const [enabled, setEnabled] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.notifications.preferences().then(
      (prefs) => !cancelled && setEnabled(prefs.projectAlerts !== false),
      () => !cancelled && setEnabled(true)
    );
    return () => { cancelled = true; };
  }, []);

  if (enabled === null) return null;

  const toggle = async () => {
    const next = !enabled;
    setBusy(true);
    setError('');
    try {
      await api.notifications.updatePreferences({ projectAlerts: next });
      setEnabled(next);
    } catch {
      setError('تعذر حفظ الإعداد. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`push-settings ${enabled ? 'push-settings--on' : ''}`} aria-label="تنبيهات المشاريع الجديدة">
      <span className="push-settings__icon" aria-hidden="true"><FiBriefcase /></span>
      <div className="push-settings__body">
        <h3 className="push-settings__title">تنبيهات المشاريع الجديدة</h3>
        <p className="push-settings__text">
          {enabled
            ? 'يصلك تنبيه عند نشر مشروع جديد في تخصصك أو يطلب مهاراتك. '
            : 'لن تصلك تنبيهات المشاريع الجديدة. '}
          <Link to="/freelancer/profile/edit">حدّث تخصصك ومهاراتك</Link> لتصلك المشاريع المناسبة.
        </p>
        {error && <p className="push-settings__error" role="alert">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="تنبيهات المشاريع الجديدة"
        className={`push-switch ${enabled ? 'is-on' : ''}`}
        onClick={toggle}
        disabled={busy}
      >
        <span className="push-switch__knob" />
      </button>
    </section>
  );
}
