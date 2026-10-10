import { useState } from 'react';
import { FiFlag, FiX } from 'react-icons/fi';
import { api } from '../../services/api';
import '../common/ConfirmModal/ConfirmModal.css';
import './ReportModal.css';

const REASONS = [
  'احتيال أو تضليل أو انتحال صفة',
  'محاولة دفع أو تواصل خارج المنصة',
  'سلوك مسيء أو مضايقة',
  'محتوى مخالف لسياسات المنصة',
  'أخرى',
];

/**
 * Report a user or a project to the platform administration.
 * Contract disputes use the dedicated dispute form on the contract page.
 */
export default function ReportModal({ isOpen, targetType, targetId, targetLabel, onClose, onReported }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    if (submitting) return;
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError('يرجى توضيح المشكلة (10 أحرف على الأقل).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.reports.create({ targetType, targetId, reason, description: description.trim() });
      setDescription('');
      onReported?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={close} role="dialog" aria-modal="true" aria-labelledby="report-modal-title" dir="rtl">
      <form className="confirm-modal-box report-modal-box" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <button type="button" className="confirm-modal-close" onClick={close} disabled={submitting} aria-label="إغلاق">
          <FiX />
        </button>

        <div className="confirm-modal-header">
          <div className="confirm-icon-wrapper warning">
            <FiFlag className="confirm-icon warning" />
          </div>
          <h3 id="report-modal-title" className="confirm-modal-title">
            الإبلاغ عن {targetType === 'project' ? 'مشروع' : 'مستخدم'}
          </h3>
        </div>

        <div className="confirm-modal-body report-modal-body">
          {targetLabel && <p className="confirm-modal-message">{targetLabel}</p>}

          <label className="report-modal-label" htmlFor="report-reason">سبب البلاغ</label>
          <select id="report-reason" className="report-modal-input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <label className="report-modal-label" htmlFor="report-description">التفاصيل</label>
          <textarea
            id="report-description"
            rows="4"
            className="report-modal-input"
            placeholder="اشرح ما حدث بوضوح لمساعدة فريق الإدارة على المراجعة..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <p className="report-modal-error" role="alert">{error}</p>}
        </div>

        <div className="confirm-modal-actions">
          <button type="button" className="btn-cancel" onClick={close} disabled={submitting}>إلغاء</button>
          <button type="submit" className="btn-confirm danger" disabled={submitting}>
            {submitting ? 'جارٍ الإرسال...' : 'إرسال البلاغ'}
          </button>
        </div>
      </form>
    </div>
  );
}
