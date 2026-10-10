import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { homeForRole } from '../../utils/roles';
import ErrorState from '../common/ErrorState/ErrorState';
import './ProtectedRoute.css';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, role, isAuthenticated, loading, restoreError, retryRestore } = useAuth();
  const location = useLocation();

  // Never render or redirect before the stored session has been resolved.
  if (loading) {
    return (
      <div className="protected-loading-container" dir="rtl">
        <div className="protected-spinner" />
        <p className="protected-loading-text">جارٍ التحقق من بيانات الدخول...</p>
      </div>
    );
  }

  // Server unreachable while restoring: offer a retry instead of logging out.
  if (!isAuthenticated && restoreError) {
    return (
      <div className="protected-loading-container" dir="rtl" style={{ padding: '0 16px' }}>
        <ErrorState
          title="تعذر الاتصال بالخادم"
          description="لم نتمكن من التحقق من جلستك بسبب مشكلة في الاتصال. يرجى المحاولة مرة أخرى."
          onRetry={retryRestore}
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Send the user to the home of the role they actually have.
    return <Navigate to={homeForRole(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
