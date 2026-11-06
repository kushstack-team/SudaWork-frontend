import { useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiFileText, FiImage, FiClock } from 'react-icons/fi';
import { api } from '../../services/api';
import { paymentMethodLabel } from '../../utils/formatters';
import './WithdrawalNotice.css';

const isImage = (file) => /\.(png|jpe?g|gif|webp)$/i.test(file?.name || '') || /^image\//.test(file?.type || '');

const RECEIPT_LABELS = {
  RECEIVED: 'تم تأكيد الاستلام',
  NOT_RECEIVED: 'أفاد بعدم الاستلام',
};

/**
 * The payout notice posted in the support chat when the admins transfer a
 * freelancer's earnings: amount, method, reference, the transfer image, and
 * (for the freelancer) the "received / not received" buttons.
 */
export default function WithdrawalNoticeCard({ message, canRespond = false, onResponded }) {
  const w = message.withdrawal;
  const [answering, setAnswering] = useState(null);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const proof = message.attachments?.[0];

  if (!w) return <p className="message-text">{message.body}</p>;

  const respond = async (received) => {
    setAnswering(received ? 'yes' : 'no');
    setError('');
    try {
      const updated = await api.withdrawals.respondToReceipt(w.id, { received, note: received ? '' : note.trim() });
      setShowNote(false);
      setNote('');
      onResponded?.(updated);
    } catch (err) {
      setError(err.message || 'تعذر إرسال ردك. حاول مرة أخرى.');
    } finally {
      setAnswering(null);
    }
  };

  const status = w.receiptStatus;
  const canAnswer = canRespond && status !== 'RECEIVED';

  return (
    <div className="wd-notice">
      <div className="wd-notice__head">
        <span className="wd-notice__icon" aria-hidden="true"><FiCheckCircle /></span>
        <div>
          <p className="wd-notice__title">إشعار تحويل أرباح</p>
          <p className="wd-notice__amount">{Number(w.amount || 0).toLocaleString('en-US')} ج.س</p>
        </div>
      </div>

      <dl className="wd-notice__details">
        <div><dt>طريقة التحويل</dt><dd>{paymentMethodLabel(w.method)}</dd></div>
        <div><dt>رقم العملية</dt><dd className="wd-notice__ref">{w.transactionReference}</dd></div>
      </dl>

      {proof && (
        <button type="button" className="wd-notice__proof" onClick={() => api.uploads.open(proof).catch(() => {})}>
          {isImage(proof) ? <FiImage aria-hidden="true" /> : <FiFileText aria-hidden="true" />}
          <span>عرض صورة إشعار التحويل</span>
        </button>
      )}

      {status ? (
        <p className={`wd-notice__status is-${status === 'RECEIVED' ? 'ok' : 'warn'}`}>
          {status === 'RECEIVED' ? <FiCheckCircle aria-hidden="true" /> : <FiAlertTriangle aria-hidden="true" />}
          {RECEIPT_LABELS[status]}
        </p>
      ) : (
        !canRespond && (
          <p className="wd-notice__status is-wait">
            <FiClock aria-hidden="true" />
            بانتظار تأكيد المستقل
          </p>
        )
      )}

      {canAnswer && (
        <div className="wd-notice__answer">
          {!status && <p className="wd-notice__question">هل وصلك المبلغ؟</p>}
          {status === 'NOT_RECEIVED' && <p className="wd-notice__question">هل وصلك المبلغ الآن؟</p>}
          {showNote && (
            <textarea
              className="wd-notice__note"
              rows={2}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب تفاصيل إن وجدت (اختياري)، مثل: راجعت حسابي ولم يصل المبلغ."
              disabled={Boolean(answering)}
            />
          )}
          <div className="wd-notice__buttons">
            <button type="button" className="wd-btn wd-btn--yes" onClick={() => respond(true)} disabled={Boolean(answering)}>
              <FiCheckCircle aria-hidden="true" />
              {answering === 'yes' ? 'جارٍ الإرسال...' : 'تم الاستلام'}
            </button>
            {status !== 'NOT_RECEIVED' && (
              <button
                type="button"
                className="wd-btn wd-btn--no"
                onClick={() => (showNote ? respond(false) : setShowNote(true))}
                disabled={Boolean(answering)}
              >
                <FiAlertTriangle aria-hidden="true" />
                {answering === 'no' ? 'جارٍ الإرسال...' : showNote ? 'إرسال: لم يصلني' : 'لم يصلني المبلغ'}
              </button>
            )}
          </div>
          {error && <p className="wd-notice__error" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
