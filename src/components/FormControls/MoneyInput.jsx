import { toDigits } from '../../utils/numbers';
import './FormControls.css';

const group = (digits) => (digits ? Number(digits).toLocaleString('en-US') : '');

/**
 * Amount in Sudanese pounds. Shows thousands separators while typing
 * (350,000) and reports a plain digit string through onChange ("350000").
 */
export default function MoneyInput({ id, value, onChange, placeholder, hasError = false, ariaDescribedBy, ...rest }) {
  return (
    <div className={`money-input ${hasError ? 'has-error' : ''}`}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        className="money-input__field"
        placeholder={placeholder}
        value={group(toDigits(value))}
        onChange={(e) => onChange(toDigits(e.target.value))}
        aria-invalid={hasError || undefined}
        aria-describedby={ariaDescribedBy}
        {...rest}
      />
      <span className="money-input__suffix" aria-hidden="true">ج.س</span>
    </div>
  );
}
