import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Runs a page's async loader when `deps` change (and `enabled` is true).
 *
 * The loader is started from a microtask rather than inside the effect body,
 * so its state updates never run synchronously during the effect. Pages keep
 * calling the same loader directly to refresh after their own actions.
 */
export default function useLoader(load, deps, enabled = true) {
  const loadRef = useRef(load);

  useLayoutEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) loadRef.current();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass the deps that should trigger a reload
  }, [enabled, ...deps]);
}
