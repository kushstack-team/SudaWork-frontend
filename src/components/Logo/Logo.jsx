import { Link } from 'react-router-dom';
import LogoMark from './LogoMark';
import './Logo.css';

/**
 * Reusable Sudawork Wordmark Logo Component
 * 
 * Symbol + text wordmark: "Suda" (#004D34) + "work" (#00C685).
 * Uses Google Font 'Outfit' (weight: 600); the symbol scales with font-size.
 * Supports dark backgrounds via `theme="dark"` (renders "Suda" as #FFFFFF).
 * Pass `showMark={false}` for the text-only wordmark.
 */
const Logo = ({
  to = '/',
  className = '',
  theme = 'light',
  size = 'md',
  ariaLabel = 'Sudawork',
  showMark = true,
  ...rest
}) => {
  const isDark = theme === 'dark';
  const combinedClasses = [
    'sw-logo',
    isDark ? 'sw-logo--dark' : '',
    size ? `sw-logo--${size}` : '',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {showMark && <LogoMark />}
      <span className="sw-logo__suda">Suda</span><span className="sw-logo__work">work</span>
    </>
  );

  if (!to) {
    return (
      <span className={combinedClasses} aria-label={ariaLabel} role="img" {...rest}>
        {content}
      </span>
    );
  }

  return (
    <Link to={to} className={combinedClasses} aria-label={ariaLabel} {...rest}>
      {content}
    </Link>
  );
};

export default Logo;
