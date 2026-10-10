import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';

/**
 * Loads data with explicit loading / error / empty handling.
 *
 *   const { data, loading, error, reload, setData } = useApiData(() => api.projects.mine(), [user?.id]);
 *
 * - `error` is set (never swallowed into an empty list) when the request fails.
 * - Responses from superseded requests are ignored.
 * - Pass `enabled: false` to wait (e.g. until the user is known).
 */
export default function useApiData(fetcher, deps = [], { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);

  useLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (id === requestId.current) setData(result);
      return result;
    } catch (err) {
      if (id === requestId.current && err?.name !== 'AbortError') setError(err);
      return undefined;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    // Deferred to a microtask so state updates happen outside the effect body.
    queueMicrotask(() => {
      if (!cancelled) run();
    });
    return () => {
      cancelled = true;
      // Invalidate any in-flight response when deps change or on unmount.
      requestId.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass the deps that should trigger a reload
  }, [enabled, ...deps]);

  return { data, loading, error, reload: run, setData };
}
