import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Single-page navigation keeps the window's scroll position, so a page opened
 * from a button low on the previous page would start scrolled down. New pages
 * start at the top; the back/forward buttons (POP) keep the browser's own
 * restoration, and query-only changes (filters, tabs) keep the position.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
}
