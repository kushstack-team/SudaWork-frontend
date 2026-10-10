import { useNavigate } from 'react-router-dom';
import { FiSlash } from 'react-icons/fi';
import { usePlatform } from '../../context/platform';
import { useAuth } from '../../context/auth';
import { homeForRole } from '../../utils/roles';
import DashboardNavbar from '../DashboardNavbar/DashboardNavbar';
import Navbar from '../Navbar';
import Footer from '../Footer';
import EmptyState from '../common/EmptyState/EmptyState';
import ErrorState from '../common/ErrorState/ErrorState';
import '../ProtectedRoute/ProtectedRoute.css';

/**
 * Blocks a page when an admin has disabled the feature (or hidden it from the
 * current role). Handles stale links and bookmarks with an explanation
 * instead of a broken page. The API enforces the same rule server-side.
 */
export default function FeatureRoute({ feature, children }) {
  const { loading, error, reload, isFeatureAvailable } = usePlatform();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="protected-loading-container" dir="rtl">
        <div className="protected-spinner" />
        <p className="protected-loading-text">جارٍ التحميل...</p>
      </div>
    );
  }

  if (isFeatureAvailable(feature)) return children;

  return (
    <div dir="rtl">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
      <main style={{ maxWidth: '720px', margin: '48px auto', padding: '0 16px', minHeight: '50vh' }}>
        {error ? (
          <ErrorState
            title="تعذر تحميل إعدادات المنصة"
            description="لا يمكن عرض هذه الصفحة الآن لأن إعدادات المنصة لم تُحمّل. يرجى المحاولة مرة أخرى."
            onRetry={() => reload()}
          />
        ) : (
          <EmptyState
            icon={FiSlash}
            title="هذه الميزة غير متاحة حالياً"
            description="قامت إدارة المنصة بإيقاف هذه الميزة مؤقتاً أو أنها غير متاحة لنوع حسابك. يمكنك متابعة استخدام بقية خدمات المنصة."
            actionText="العودة إلى لوحة التحكم"
            onAction={() => navigate(isAuthenticated ? homeForRole(role) : '/')}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
