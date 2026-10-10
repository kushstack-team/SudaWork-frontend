// Role-specific landing page after sign-in.
export const homeForRole = (role) => {
  if (role === 'client') return '/client-dashboard';
  if (role === 'freelancer') return '/freelancer-dashboard';
  if (role === 'admin') return '/admin';
  return '/';
};
