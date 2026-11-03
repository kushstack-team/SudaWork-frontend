import { useState } from 'react';
import { FiShield, FiX } from 'react-icons/fi';

const EMPTY = { fullName: '', email: '', password: '', confirmPassword: '', currentPassword: '' };
const MIN_PASSWORD = 8;

/**
 * Creates a new administrator account. The acting admin confirms with their
 * own password; server errors (wrong password, email in use) show inline.
 */
export default function AddAdminModal({ isOpen, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const close = () => {
    if (saving) return;
    setForm(EMPTY);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.fullName.trim().length < 2) return setError('يرجى إدخال الاسم الكامل.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('يرجى إدخال بريد إلكتروني صحيح.');
    if (form.password.length < MIN_PASSWORD) return setError(`يجب ألا تقل كلمة المرور عن ${MIN_PASSWORD} أحرف.`);
    if (form.password !== form.confirmPassword) return setError('كلمتا المرور غير متطابقتين.');
    if (!form.currentPassword) return setError('أدخل كلمة مرورك الحالية لتأكيد الإجراء.');

    setSaving(true);
    setError('');
    try {
      await onSubmit({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        currentPassword: form.currentPassword,
      });
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={close}>
      <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="add-admin-title">
        <div className="modal-header">
          <h3 id="add-admin-title">إضافة مدير جديد</h3>
          <button type="button" className="modal-close-btn" onClick={close} disabled={saving} aria-label="إغلاق">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <p className="add-admin-note">
            سيحصل المدير الجديد على صلاحيات كاملة لإدارة المنصة. شارك كلمة المرور معه بشكل آمن واطلب منه تغييرها بعد أول دخول.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="new-admin-name">الاسم الكامل</label>
            <input id="new-admin-name" type="text" className="modal-input" value={form.fullName} onChange={set('fullName')} autoComplete="off" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-admin-email">البريد الإلكتروني</label>
            <input id="new-admin-email" type="email" dir="ltr" className="modal-input" value={form.email} onChange={set('email')} autoComplete="off" />
          </div>

          <div className="add-admin-row">
            <div className="form-group">
              <label className="form-label" htmlFor="new-admin-password">كلمة المرور</label>
              <input id="new-admin-password" type="password" className="modal-input" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-admin-confirm">تأكيد كلمة المرور</label>
              <input id="new-admin-confirm" type="password" className="modal-input" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
            </div>
          </div>

          <div className="form-group add-admin-confirm">
            <label className="form-label" htmlFor="new-admin-current">كلمة مرورك الحالية (للتأكيد)</label>
            <input id="new-admin-current" type="password" className="modal-input" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
          </div>

          {error && <p className="add-admin-error" role="alert">{error}</p>}

          <div className="modal-actions">
            <button type="submit" className="modal-primary-btn" disabled={saving}>
              <FiShield />
              <span>{saving ? 'جارٍ الإضافة...' : 'إضافة المدير'}</span>
            </button>
            <button type="button" className="modal-secondary-btn" onClick={close} disabled={saving}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
