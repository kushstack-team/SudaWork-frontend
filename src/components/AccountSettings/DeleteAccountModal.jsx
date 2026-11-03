import { useState } from 'react';
import { FiTrash2, FiX } from 'react-icons/fi';
import '../common/ConfirmModal/ConfirmModal.css';
import '../ReportModal/ReportModal.css';

const CONFIRM_WORD = 'حذف';

/**
 * Permanent account deletion. The user types the confirmation word and, for
 * accounts that have one, their password. Errors from the server (active
 * contracts, remaining balance, wrong password) are shown inline.
 */
export default function DeleteAccountModal({ isOpen, hasPassword, onConfirm, onClose }) {
  const [password, setPassword] = useState('');
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    if (deleting) return;
    setPassword('');
    setTyped('');
    setError('');
    onClose();
  };

  const canSubmit = typed.trim() === CONFIRM_WORD && (!hasPassword || password.length > 0) && !deleting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setDeleting(true);
    setError('');
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={close} role="dialog" aria-modal="true" aria-labelledby="delete-account-title" dir="rtl">
      <form className="confirm-modal-box report-modal-box" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <button type="button" className="confirm-modal-close" onClick={close} disabled={deleting} aria-label="إغلاق">
          <FiX />
        </button>

        <div className="confirm-modal-header">
          <div className="confirm-icon-wrapper danger">
            <FiTrash2 className="confirm-icon danger" />
          </div>
          <h3 id="delete-account-title" className="confirm-modal-title">حذف الحساب نهائياً</h3>
        </div>

        <div className="confirm-modal-body report-modal-body">
          <p className="confirm-modal-message">
            سيتم حذف اسمك وبريدك وصورتك وملفك الشخصي ومعرض أعمالك، وإغلاق مشاريعك المفتوحة. تبقى العقود والمدفوعات السابقة محفوظة باسم «حساب محذوف» لحقوق الطرف الآخر. لا يمكن التراجع عن هذا الإجراء.
          </p>

          {hasPassword && (
            <>
              <label className="report-modal-label" htmlFor="delete-account-password">كلمة المرور</label>
              <input
                id="delete-account-password"
                type="password"
                autoComplete="current-password"
                className="report-modal-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          <label className="report-modal-label" htmlFor="delete-account-confirm">
            اكتب «{CONFIRM_WORD}» للتأكيد
          </label>
          <input
            id="delete-account-confirm"
            type="text"
            className="report-modal-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />

          {error && <p className="report-modal-error" role="alert">{error}</p>}
        </div>

        <div className="confirm-modal-actions">
          <button type="button" className="btn-cancel" onClick={close} disabled={deleting}>تراجع</button>
          <button type="submit" className="btn-confirm danger" disabled={!canSubmit}>
            {deleting ? 'جارٍ الحذف...' : 'حذف الحساب نهائياً'}
          </button>
        </div>
      </form>
    </div>
  );
}
