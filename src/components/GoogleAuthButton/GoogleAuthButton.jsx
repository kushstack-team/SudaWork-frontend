import { useEffect, useRef, useState } from 'react';
import { usePlatform } from '../../context/platform';
import './GoogleAuthButton.css';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
// Google Identity Services only accepts button widths between 200 and 400px.
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
let gisPromise = null;

const loadGis = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        gisPromise = null;
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
};

// Official Google "G" mark (multicolor), used on the fallback button. The live
// button is rendered by Google Identity Services with Google's own artwork.
const GoogleGLogo = () => (
  <svg className="google-g-logo" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

/**
 * "Continue with Google" using Google Identity Services. Google returns a
 * signed ID token (`credential`) which the backend verifies; nothing about the
 * identity is trusted on the client.
 *
 * Renders Google's official outlined button at the full width of the form.
 * The host element stays mounted while platform settings load, so the button
 * is drawn as soon as both the client ID and the GIS script are ready — even
 * on a hard refresh. When Google sign-in is not configured, a disabled button
 * explains why.
 */
export default function GoogleAuthButton({ text = 'continue_with', onCredential, busy = false }) {
  const { googleClientId, loading } = usePlatform();
  const hostRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [rendered, setRendered] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const host = hostRef.current;
    if (!googleClientId || !host) return undefined;
    let cancelled = false;
    loadGis()
      .then((google) => {
        if (cancelled || !hostRef.current) return;
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => callbackRef.current?.(response.credential),
          ux_mode: 'popup',
          cancel_on_tap_outside: true,
        });
        const width = Math.round(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, host.parentElement?.offsetWidth || MAX_WIDTH)));
        host.innerHTML = '';
        google.accounts.id.renderButton(host, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text,
          locale: 'ar',
          logo_alignment: 'left',
          width,
        });
        setRendered(true);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [googleClientId, text]);

  if (!loading && (!googleClientId || loadError)) {
    return (
      <div className="google-auth-slot">
        <button type="button" className="google-auth-fallback" disabled aria-disabled="true">
          <GoogleGLogo />
          <span>المتابعة باستخدام Google</span>
        </button>
        <span className="google-auth-hint">
          {loadError
            ? 'تعذر تحميل خدمة Google. تحقق من اتصالك أو استخدم البريد الإلكتروني.'
            : 'التسجيل عبر Google غير متاح حالياً. يمكنك استخدام البريد الإلكتروني.'}
        </span>
      </div>
    );
  }

  return (
    <div className={`google-auth-slot ${busy ? 'google-auth-slot--busy' : ''}`} aria-busy={busy || !rendered}>
      {!rendered && <div className="google-auth-skeleton" aria-hidden="true" />}
      <div ref={hostRef} className={`google-auth-button-host ${rendered ? '' : 'google-auth-button-host--pending'}`} />
    </div>
  );
}
