import { FiCheckCircle } from 'react-icons/fi';
import './FormControls.css';

/**
 * Live length hint under a text field: how many characters are still needed
 * (red) until the minimum is reached, then a green confirmation.
 */
export default function CharCounter({ id, value, min, max }) {
  const length = String(value || '').trim().length;
  const remaining = min - length;

  if (remaining > 0) {
    return (
      <span id={id} className="char-counter is-short" aria-live="polite">
        {length === 0
          ? `مطلوب ${min} حرفاً على الأقل`
          : `متبقٍ ${remaining} ${remaining === 1 ? 'حرف' : remaining <= 10 ? 'أحرف' : 'حرفاً'} للوصول إلى الحد الأدنى (${min})`}
      </span>
    );
  }
  return (
    <span id={id} className="char-counter is-ok" aria-live="polite">
      <FiCheckCircle aria-hidden="true" />
      <span>ممتاز</span>
      {max && <span className="char-counter__count">{length.toLocaleString('en-US')} / {max.toLocaleString('en-US')}</span>}
    </span>
  );
}
