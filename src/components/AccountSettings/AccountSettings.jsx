import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheck } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../context/auth';
import { isGoogleUser } from '../../utils/auth';
import GoogleGLogo from '../Icons/GoogleGLogo';
import ConfirmModal from '../common/ConfirmModal/ConfirmModal';
import DeleteAccountModal from './DeleteAccountModal';
import './AccountSettings.css';

/**
 * Account security block for the profile editors:
 * - Password: change it, or add a first one for accounts created with Google
 *   (so they can also sign in with email and password).
 * - Deactivation: reversible; signing in again offers to reactivate.
 * - Deletion: permanent; personal data is erased.
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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (hasPassword && !oldPassword) {
      setError('يرجى إدخال كلمة المرور الحالية.');
      return;
    }
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
      setMessage(hasPassword
        ? 'تم تغيير كلمة المرور بنجاح. تم تسجيل خروج الأجهزة الأخرى.'
        : 'تمت إضافة كلمة المرور. يمكنك الآن الدخول بالبريد الإلكتروني وكلمة المرور أيضاً.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const leave = async () => {
    await logout().catch(() => {});
    navigate('/', { replace: true });
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await api.profiles.deactivate();
      setConfirmOpen(false);
      await leave();
    } catch (err) {
      setConfirmOpen(false);
      setError(err.message);
    } finally {
      setDeactivating(false);
    }
  };

  // Errors are shown inside the modal, so they are re-thrown to it.
  const handleDelete = async (password) => {
    await api.profiles.deleteAccount(password);
    setDeleteOpen(false);
    await leave();
  };

  return (
    <section className={`${sectionClassName} account-settings`}>
      <h2 className={titleClassName}>
        <FiLock className={iconClassName} />
        <span>أمان الحساب</span>
      </h2>

      {isGoogle && (
        <div className="account-settings-google-card">
          <div className="account-settings-google-header">
            <GoogleGLogo size={20} />
            <span>حسابك مرتبط بـ Google</span>
          </div>
          <p className="account-settings-google-desc">
            {hasPassword
              ? 'يمكنك الدخول عبر Google أو بالبريد الإلكتروني وكلمة المرور.'
              : 'تدخل حالياً عبر Google فقط. أضف كلمة مرور أدناه لتتمكن من الدخول بالبريد الإلكتروني أيضاً.'}
          </p>
        </div>
      )}

      <form onSubmit={handlePassword} className="account-settings-form" noValidate>
        <p className="account-settings-hint">
          {hasPassword ? 'غيّر كلمة المرور الخاصة بحسابك.' : 'أضف كلمة مرور لحسابك.'}
        </p>

        {hasPassword && (
          <label className="account-settings-field">
            <span>كلمة المرور الحالية</span>
            <input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </label>
        )}

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
            {saving ? 'جارٍ الحفظ...' : hasPassword ? 'تغيير كلمة المرور' : 'إضافة كلمة المرور'}
          </button>
          <div className="account-settings-danger-group">
            <button type="button" className="account-settings-danger" onClick={() => setConfirmOpen(true)}>
              إلغاء تفعيل الحساب
            </button>
            <button type="button" className="account-settings-danger" onClick={() => setDeleteOpen(true)}>
              حذف الحساب نهائياً
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmOpen}
        title="إلغاء تفعيل الحساب"
        message="سيتم إخفاء حسابك وتسجيل خروجك من جميع الأجهزة. تبقى بياناتك محفوظة، ويمكنك إعادة تفعيل الحساب في أي وقت بتسجيل الدخول مرة أخرى. هل تريد المتابعة؟"
        confirmText="إلغاء التفعيل"
        cancelText="تراجع"
        type="danger"
        isLoading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
      <DeleteAccountModal
        isOpen={deleteOpen}
        hasPassword={hasPassword}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </section>
  );
}
