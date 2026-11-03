import { FiCheckCircle } from 'react-icons/fi';
import './VerifiedBadge.css';

const TITLE = 'حساب موثق من إدارة المنصة';

/**
 * Trust mark for accounts an administrator verified. `compact` shows only the
 * icon (for cards and lists).
 */
export default function VerifiedBadge({ compact = false }) {
  if (compact) {
    return (
      <span className="verified-badge verified-badge--compact" title={TITLE} aria-label={TITLE} role="img">
        <FiCheckCircle aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="verified-badge" title={TITLE}>
      <FiCheckCircle aria-hidden="true" /> موثق
    </span>
  );
}
