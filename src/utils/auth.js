/**
 * Authentication and provider detection utilities.
 */

export const AUTH_PROVIDER_STORAGE_KEY = 'sudawork_auth_provider';

/**
 * Checks whether a user authenticated via Google (Sign in with Google).
 *
 * Inspects:
 * 1. Provider strings: `provider`, `authProvider`, `auth_provider` === 'google' (case-insensitive)
 * 2. Google ID / Subject: `googleId`, `google_id`, `googleSub`, `google_sub`
 * 3. Explicit boolean flags: `isGoogle`, `is_google`
 * 4. Browser session storage marker: `sessionStorage.getItem('sudawork_auth_provider') === 'google'`
 * 5. Accounts created via Google that have no password: `hasPassword === false` or `has_password === false`
 * 6. Google linked accounts without standard password
 *
 * @param {object|null|undefined} user
 * @returns {boolean} true if the user is authenticated via Google
 */
export const isGoogleUser = (user) => {
  if (!user) return false;

  // 1. Explicit boolean flag
  if (user.isGoogle === true || user.is_google === true) {
    return true;
  }

  // 2. Provider strings
  const provider = (
    user.provider ||
    user.authProvider ||
    user.auth_provider ||
    ''
  ).toString().toLowerCase().trim();
  if (provider === 'google') {
    return true;
  }

  // 3. Google identifier presence
  if (user.googleId || user.google_id || user.googleSub || user.google_sub) {
    return true;
  }

  // 4. Client-side session marker from Google Sign-In flow
  try {
    if (typeof window !== 'undefined' && sessionStorage.getItem(AUTH_PROVIDER_STORAGE_KEY) === 'google') {
      return true;
    }
  } catch {
    // Storage access may fail in private mode; safely ignore
  }

  // 5. Google account created without password
  if (user.hasPassword === false || user.has_password === false) {
    return true;
  }

  // 6. Linked to Google without a password
  if ((user.googleLinked || user.google_linked) && !user.hasPassword) {
    return true;
  }

  return false;
};
