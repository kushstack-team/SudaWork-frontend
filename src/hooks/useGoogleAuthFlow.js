import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { homeForRole } from '../utils/roles';

export const GOOGLE_REGISTRATION_KEY = 'sudawork_google_registration';

/**
 * Shared "Continue with Google" handling for login and registration pages.
 *
 *  - returning user           → their dashboard (or the page they came from)
 *  - new user, role known     → account created, dashboard
 *  - new user, info missing   → /register/complete (asks only for what is missing)
 *  - email already registered → `linkCredential` is kept so the login page can
 *                               link Google after a password sign-in
 */
export default function useGoogleAuthFlow({ role, redirectTo } = {}) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linkCredential, setLinkCredential] = useState(null);

  const handleCredential = async (credential) => {
    if (!credential) return;
    setBusy(true);
    setError('');
    try {
      const result = await loginWithGoogle({ credential, role });
      if (result.status === 'AUTHENTICATED') {
        navigate(redirectTo || homeForRole(result.user.role), { replace: true });
        return;
      }
      // Kept in sessionStorage so a refresh during the completion step does
      // not lose progress (the registration token itself expires in 30 min).
      const pending = {
        registrationToken: result.registrationToken,
        missingFields: result.missingFields,
        profile: result.profile,
        suggestedRole: result.suggestedRole || role || null,
        savedAt: Date.now(),
      };
      try {
        sessionStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(pending));
      } catch { /* storage unavailable: state still passed via router */ }
      navigate('/register/complete', { state: pending });
    } catch (err) {
      if (err.code === 'ACCOUNT_EXISTS') setLinkCredential(credential);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return { handleCredential, busy, error, setError, linkCredential, clearLinkCredential: () => setLinkCredential(null) };
}
