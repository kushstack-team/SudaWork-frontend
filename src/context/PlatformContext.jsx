import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './auth';
import { PlatformContext } from './platform';

const REFRESH_MS = 60000;

/**
 * Public platform settings and admin-controlled feature availability, loaded
 * from GET /settings/public. Re-fetched periodically and on window focus so
 * admin changes reach open sessions without a redeploy.
 *
 * While settings are unknown (loading or failed), features report as
 * unavailable: a configuration failure never silently enables anything.
 * The backend enforces the same rules regardless of what the UI shows.
 */
export const PlatformProvider = ({ children }) => {
  const { role } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(
    () =>
      api.settings.getPublic().then(
        (data) => {
          setSettings(data);
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      ),
    []
  );

  const reload = useCallback(() => {
    setLoading(true);
    return fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
    const timer = setInterval(fetchSettings, REFRESH_MS);
    window.addEventListener('focus', fetchSettings);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', fetchSettings);
    };
  }, [fetchSettings]);

  const isFeatureAvailable = useCallback(
    (featureId, forRole = role) => {
      if (forRole === 'admin') return true;
      const feature = settings?.features?.[featureId];
      if (!feature || !feature.enabled) return false;
      if (!forRole) return true;
      return Boolean(feature[forRole]);
    },
    [settings, role]
  );

  const value = {
    settings,
    loading,
    error,
    reload,
    isFeatureAvailable,
    commissionPercent: Number(settings?.commission_percentage ?? 10),
    googleClientId: settings?.auth?.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || null,
  };

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
};

export default PlatformProvider;
