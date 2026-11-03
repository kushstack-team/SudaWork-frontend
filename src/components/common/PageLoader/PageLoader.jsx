import LogoMark from '../../Logo/LogoMark';
import './PageLoader.css';

/**
 * Full-page loader for route changes and session checks: the brand mark with
 * a soft pulse and an indeterminate progress bar. It waits ~200ms before
 * appearing so fast loads don't flash it.
 */
export default function PageLoader({ message = 'جاري التحميل...' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite" dir="rtl">
      <div className="page-loader__inner">
        <LogoMark className="page-loader__mark" />
        <div className="page-loader__bar" aria-hidden="true">
          <span className="page-loader__bar-fill" />
        </div>
        <p className="page-loader__text">{message}</p>
      </div>
    </div>
  );
}
