import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth';
import { api } from '../services/api';
import { tokens, setSessionExpiredHandler } from '../services/api/client';
import { isGoogleUser, AUTH_PROVIDER_STORAGE_KEY } from '../utils/auth';

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
    setSessionExpiredHandler(() => {
      try {
        sessionStorage.removeItem(AUTH_PROVIDER_STORAGE_KEY);
      } catch {}
      setUser(null);
    });
    if (hasStoredSession()) restore();
  }, [restore]);

  const login = async (email, password) => {
    const { user: loggedUser } = await api.auth.login(email, password);
    try {
      sessionStorage.setItem(AUTH_PROVIDER_STORAGE_KEY, 'local');
    } catch {}
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async ({ firstName, lastName, fullName, email, password, role }) => {
    const name = fullName || `${firstName || ''} ${lastName || ''}`.trim();
    const { user: newUser, verificationEmailSent } = await api.auth.register({ fullName: name, email: email.trim(), password, role });
    try {
      sessionStorage.setItem(AUTH_PROVIDER_STORAGE_KEY, 'local');
    } catch {}
    setUser(newUser);
    return { ...newUser, verificationEmailSent };
  };

  // Resolves with the API result: { status: 'AUTHENTICATED', user, isNewUser } or
  // { status: 'NEEDS_PROFILE', registrationToken, missingFields, profile }.
  const loginWithGoogle = async ({ credential, role }) => {
    const result = await api.auth.google({ credential, role });
    if (result.status === 'AUTHENTICATED') {
      try {
        sessionStorage.setItem(AUTH_PROVIDER_STORAGE_KEY, 'google');
      } catch {}
      const gUser = {
        ...result.user,
        isGoogle: true,
        provider: result.user?.provider || 'google',
        authProvider: result.user?.authProvider || 'google',
      };
      setUser(gUser);
    }
    return result;
  };

  const completeGoogleRegistration = async ({ registrationToken, role, fullName }) => {
    const result = await api.auth.googleComplete({ registrationToken, role, fullName });
    try {
      sessionStorage.setItem(AUTH_PROVIDER_STORAGE_KEY, 'google');
    } catch {}
    const gUser = {
      ...result.user,
      isGoogle: true,
      provider: result.user?.provider || 'google',
      authProvider: result.user?.authProvider || 'google',
    };
    setUser(gUser);
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
      try {
        sessionStorage.removeItem(AUTH_PROVIDER_STORAGE_KEY);
      } catch {}
      setUser(null);
    }
  };

  const refreshUser = useCallback(async () => {
    const fresh = await api.auth.me();
    setUser(fresh);
    return fresh;
  }, []);

  const isGoogle = isGoogleUser(user);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isGoogle,
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
