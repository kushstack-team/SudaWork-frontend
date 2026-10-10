import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth';
import { api } from '../services/api';
import { tokens, setSessionExpiredHandler } from '../services/api/client';

const hasStoredSession = () => Boolean(tokens.access || tokens.refresh);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // True only while a stored session is being restored, so protected pages
  // never render (or redirect) before the outcome is known.
  const [loading, setLoading] = useState(hasStoredSession);
  const [restoreError, setRestoreError] = useState(null);

  // Resolves the stored session; state is only updated from promise callbacks.
  const restore = useCallback(
    () =>
      api.auth.me().then(
        (me) => {
          setUser(me);
          setRestoreError(null);
          setLoading(false);
        },
        (err) => {
          if (err.isNetwork || err.status >= 500) {
            // Keep the tokens: the server is unreachable, not the session invalid.
            setRestoreError(err);
          } else {
            tokens.clear();
          }
          setUser(null);
          setLoading(false);
        }
      ),
    []
  );

  const retryRestore = useCallback(() => {
    setLoading(true);
    setRestoreError(null);
    return restore();
  }, [restore]);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    if (hasStoredSession()) restore();
  }, [restore]);

  const login = async (email, password) => {
    const { user: loggedUser } = await api.auth.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async ({ firstName, lastName, fullName, email, password, role }) => {
    const name = fullName || `${firstName || ''} ${lastName || ''}`.trim();
    const { user: newUser, verificationEmailSent } = await api.auth.register({ fullName: name, email: email.trim(), password, role });
    setUser(newUser);
    return { ...newUser, verificationEmailSent };
  };

  // Resolves with the API result: { status: 'AUTHENTICATED', user, isNewUser } or
  // { status: 'NEEDS_PROFILE', registrationToken, missingFields, profile }.
  const loginWithGoogle = async ({ credential, role }) => {
    const result = await api.auth.google({ credential, role });
    if (result.status === 'AUTHENTICATED') setUser(result.user);
    return result;
  };

  const completeGoogleRegistration = async ({ registrationToken, role, fullName }) => {
    const result = await api.auth.googleComplete({ registrationToken, role, fullName });
    setUser(result.user);
    return result;
  };

  const linkGoogle = async (credential) => {
    const updated = await api.auth.googleLink(credential);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = useCallback(async () => {
    const fresh = await api.auth.me();
    setUser(fresh);
    return fresh;
  }, []);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    loading,
    restoreError,
    retryRestore,
    login,
    register,
    loginWithGoogle,
    completeGoogleRegistration,
    linkGoogle,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
