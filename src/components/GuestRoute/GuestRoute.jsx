import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { homeForRole } from '../../utils/roles';
import { PageLoader } from '../common';

/**
 * Wraps sign-in / sign-up pages. A user who is already signed in when they
 * open one is sent to their dashboard instead of being shown a login form.
 *
 * The decision is taken once, when the stored session is resolved. Signing in
 * on the page itself therefore never triggers this redirect, and the page
 * keeps control of where to go next (e.g. back to the page that required
 * login, or on to email verification).
 */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [signedInOnEntry, setSignedInOnEntry] = useState(null);

  if (signedInOnEntry === null && !loading) {
    setSignedInOnEntry(Boolean(user));
  }

  if (signedInOnEntry === null) return <PageLoader />;
  if (signedInOnEntry && user) return <Navigate to={homeForRole(user.role)} replace />;
  return children;
};

export default GuestRoute;
