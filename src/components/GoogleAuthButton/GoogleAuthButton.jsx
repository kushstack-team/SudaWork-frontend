import { useEffect, useRef, useState } from 'react';
import { usePlatform } from '../../context/platform';
import './GoogleAuthButton.css';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
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

/**
 * "Continue with Google" using Google Identity Services. Google returns a
 * signed ID token (`credential`) which the backend verifies; nothing about the
 * identity is trusted on the client.
 *
 * Renders Google's official button in the existing pill/blue style. When the
 * server has no Google client ID configured, a disabled button explains why.
 */
// Official Google "G" mark (multicolor), used on the fallback button. The live
// button is rendered by Google Identity Services with Google's own artwork.
const GoogleGLogo = () => (
  <span className="google-g-badge" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  </span>
);

export default function GoogleAuthButton({ text = 'continue_with', onCredential, busy = false }) {
  const { googleClientId, loading } = usePlatform();
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!googleClientId || !containerRef.current) return undefined;
    let cancelled = false;
    loadGis()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => callbackRef.current?.(response.credential),
          ux_mode: 'popup',
          cancel_on_tap_outside: true,
        });
        containerRef.current.innerHTML = '';
        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text,
          locale: 'ar',
          logo_alignment: 'left',
          width: Math.min(320, containerRef.current.offsetWidth || 260),
        });
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [googleClientId, text]);

  if (loading) {
    return <div className="google-auth-slot google-auth-slot--loading" aria-hidden="true" />;
  }

  if (!googleClientId || loadError) {
    return (
      <div className="google-auth-unavailable">
        <button type="button" className="social-btn social-btn--google" disabled aria-disabled="true">
          <GoogleGLogo />
          <span>Continue with Google</span>
        </button>
        <span className="google-auth-hint">
          {loadError
            ? 'تعذر تحميل خدمة قوقل. تحقق من اتصالك أو استخدم البريد الإلكتروني.'
            : 'التسجيل عبر قوقل غير متاح حالياً. يمكنك استخدام البريد الإلكتروني.'}
        </span>
      </div>
    );
  }

  return (
    <div className={`google-auth-slot ${busy ? 'google-auth-slot--busy' : ''}`} aria-busy={busy}>
      <div ref={containerRef} className="google-auth-button-host" />
    </div>
  );
}
