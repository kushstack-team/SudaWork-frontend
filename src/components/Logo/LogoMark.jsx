/**
 * Sudawork symbol: a two-tone geometric "S" on the brand's dark-green tile.
 * The white and green bowls meet on one continuous line (client and
 * freelancer joined), echoing the "Suda" + "work" colours of the wordmark.
 *
 * Kept inline (not an <img>) so colours follow the theme via CSS classes; the
 * fill/stroke attributes are the defaults when Logo.css is not loaded.
 * Standalone files live in src/assets/brand/ and public/favicon.svg.
 */
const LogoMark = ({ className = '', title, ...rest }) => (
  <svg
    className={['sw-logo-mark', className].filter(Boolean).join(' ')}
    viewBox="0 0 48 48"
    width="48"
    height="48"
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    focusable="false"
    {...rest}
  >
    {title && <title>{title}</title>}
    <rect className="sw-logo-mark__tile" width="48" height="48" rx="12" fill="#004D34" />
    <g fill="none" strokeWidth="5.5">
      <path className="sw-logo-mark__top" d="M30.93 14.25A8 6.5 0 1 0 24 24" stroke="#FFFFFF" />
      <path className="sw-logo-mark__bottom" d="M24 24A8 6.5 0 1 1 17.07 33.75" stroke="#00C685" />
    </g>
    <circle className="sw-logo-mark__top-cap" cx="30.93" cy="14.25" r="2.75" fill="#FFFFFF" />
    <circle className="sw-logo-mark__bottom-cap" cx="17.07" cy="33.75" r="2.75" fill="#00C685" />
  </svg>
);

export default LogoMark;
