import { FiAlertCircle } from 'react-icons/fi';
import '../EmptyState/EmptyState.css';
import './ErrorState.css';

/**
 * Shown when data could not be loaded. Distinct from EmptyState, which means
 * the request succeeded with no records.
 */
export default function ErrorState({
  title = 'تعذر تحميل البيانات',
  error,
  description,
  onRetry,
  retryText = 'إعادة المحاولة',
}) {
  const message = description || error?.message || 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
  return (
    <div className="empty-state-container error-state-container" role="alert">
      <div className="empty-state-icon error-state-icon">
        <FiAlertCircle />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{message}</p>
      {onRetry && (
        <button type="button" className="empty-state-btn" onClick={() => onRetry()}>
          {retryText}
        </button>
      )}
    </div>
  );
}
