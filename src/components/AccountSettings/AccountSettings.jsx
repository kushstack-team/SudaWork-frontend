import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheck } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../context/auth';
import { isGoogleUser } from '../../utils/auth';
import GoogleGLogo from '../Icons/GoogleGLogo';
import ConfirmModal from '../common/ConfirmModal/ConfirmModal';
import './AccountSettings.css';

/**
 * Account security block for the profile editors:
 * - Google-authenticated users: password fields and change button are completely hidden;
 *   shows an informative Google provider card, plus account deactivation.
 * - Standard email/password users: allows changing password, plus account deactivation.
 */
export default function AccountSettings({ sectionClassName, titleClassName, iconClassName }) {
  const { user, isGoogle: authIsGoogle, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const isGoogle = authIsGoogle || isGoogleUser(user);
  const hasPassword = user?.hasPassword !== false;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword.length < 6) {
      setError('يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // The server returns a fresh session and signs out other devices.
      await api.auth.changePassword(hasPassword ? oldPassword : '', newPassword);
      await refreshUser();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('تم تغيير كلمة المرور بنجاح. تم تسجيل خروج الأجهزة الأخرى.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await api.profiles.deactivate();
      setConfirmOpen(false);
      await logout().catch(() => {});
      navigate('/', { replace: true });
    } catch (err) {
      setConfirmOpen(false);
      setError(err.message);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <section className={`${sectionClassName} account-settings`}>
      <h2 className={titleClassName}>
        <FiLock className={iconClassName} />
        <span>أمان الحساب</span>
      </h2>

      {isGoogle ? (
        <div className="account-settings-google-wrapper">
          <div className="account-settings-google-card">
            <div className="account-settings-google-header">
              <GoogleGLogo size={20} />
              <span>تم تسجيل الدخول بواسطة Google</span>
            </div>
            <p className="account-settings-google-desc">
              حسابك مرتبط ومحمٍ بواسطة Google. تتم إدارة كلمة المرور وإعدادات الأمان الخاصة بك مباشرةً عبر حساب Google الخاص بك، ولا يتطلب حسابك كلمة مرور منفصلة على المنصة.
            </p>
          </div>

          {error && <p className="account-settings-error" role="alert">{error}</p>}

          <div className="account-settings-actions account-settings-actions--single">
            <button
              type="button"
              className="account-settings-danger"
              onClick={() => setConfirmOpen(true)}
            >
              إلغاء تفعيل الحساب
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePassword} className="account-settings-form" noValidate>
          <p className="account-settings-hint">
            غيّر كلمة المرور الخاصة بحسابك.
          </p>

          <label className="account-settings-field">
            <span>كلمة المرور الحالية</span>
            <input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </label>

          <div className="account-settings-row">
            <label className="account-settings-field">
              <span>كلمة المرور الجديدة</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <label className="account-settings-field">
              <span>تأكيد كلمة المرور</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          </div>

          {error && <p className="account-settings-error" role="alert">{error}</p>}
          {message && <p className="account-settings-success" role="status"><FiCheck /> {message}</p>}

          <div className="account-settings-actions">
            <button type="submit" className="account-settings-primary" disabled={saving}>
              {saving ? 'جارٍ الحفظ...' : 'تغيير كلمة المرور'}
            </button>
            <button type="button" className="account-settings-danger" onClick={() => setConfirmOpen(true)}>
              إلغاء تفعيل الحساب
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="إلغاء تفعيل الحساب"
        message="سيتم إيقاف حسابك وتسجيل خروجك من جميع الأجهزة. تبقى عقودك ومعاملاتك المالية محفوظة، ولإعادة التفعيل تواصل مع إدارة المنصة. هل تريد المتابعة؟"
        confirmText="إلغاء التفعيل"
        cancelText="تراجع"
        type="danger"
        isLoading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
