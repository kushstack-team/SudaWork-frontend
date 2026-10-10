import { Link } from 'react-router-dom';
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiBriefcase,
  FiFileText,
  FiShield,
  FiDollarSign,
  FiAlertTriangle,
  FiBell,
  FiMail
} from 'react-icons/fi';
import defaultAvatar from '../../../assets/default-avatar.svg';
import { usePlatform } from '../../../context/platform';
import { FEATURES } from '../../../constants/features';

export default function UserDropdown({
  user,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  unreadMsgCount,
  unreadNotifCount,
  onLogout,
  menuRef
}) {
  const { isFeatureAvailable } = usePlatform();
  const isAdmin = user?.role === 'admin';
  return (
    <div className="user-menu-container" ref={menuRef}>
      <div 
        className="user-avatar-wrapper" 
        title={user ? user.fullName : 'الملف الشخصي'}
        onClick={() => setIsProfileMenuOpen((prev) => !prev)}
      >
        <img 
          src={user?.avatar || defaultAvatar}
          alt={user?.fullName || 'المستخدم'}
          className="user-avatar-img"
        />
      </div>

      {isProfileMenuOpen && (
        <div className="user-profile-dropdown" role="menu">
          <div className="dropdown-user-header">
            <p className="dropdown-user-name">{user?.fullName}</p>
            <p className="dropdown-user-role">
              {user?.role === 'client' ? 'حساب صاحب عمل' : user?.role === 'admin' ? 'مدير النظام' : 'حساب مستقل'}
            </p>
          </div>
          <hr className="dropdown-divider" />
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="dropdown-menu-item"
              style={{ backgroundColor: '#f0fdf4', color: '#166534', fontWeight: 700 }}
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiShield className="dropdown-icon" style={{ color: '#16a34a' }} />
              <span>لوحة الإدارة والتحكيم (Admin)</span>
            </Link>
          )}
          {!isAdmin && (
          <Link
            to={user?.role === 'freelancer' ? `/freelancers/${user.id}` : `/clients/${user?.id}`}
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiUser className="dropdown-icon" />
            <span>الملف الشخصي العام</span>
          </Link>
          )}
          {!isAdmin && (
          <Link
            to={user?.role === 'freelancer' ? '/freelancer/profile/edit' : '/client/profile/edit'}
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiSettings className="dropdown-icon" />
            <span>تعديل بيانات الحساب</span>
          </Link>
          )}
          {user?.role === 'client' && (
            <Link
              to="/client/projects"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiBriefcase className="dropdown-icon" />
              <span>مشاريعي</span>
            </Link>
          )}
          {user?.role === 'freelancer' && (
            <Link
              to="/freelancer/proposals"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiFileText className="dropdown-icon" />
              <span>عروضي المقدمة</span>
            </Link>
          )}
          <Link
            to="/contracts"
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiShield className="dropdown-icon" />
            <span>عقود العمل</span>
          </Link>
          {user?.role === 'client' && isFeatureAvailable(FEATURES.PAYMENT_REQUESTS) && (
            <Link
              to="/client/payments"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiDollarSign className="dropdown-icon" />
              <span>الضمان والمدفوعات</span>
            </Link>
          )}
          {user?.role === 'freelancer' && (
            <Link
              to="/freelancer/wallet"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiDollarSign className="dropdown-icon" />
              <span>المحفظة والأرباح</span>
            </Link>
          )}
          {!isAdmin && isFeatureAvailable(FEATURES.MESSAGING) && (
            <Link
              to="/messages"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiMail className="dropdown-icon" />
              <span>المحادثات والرسائل</span>
              {unreadMsgCount > 0 && (
                <span className="unread-dropdown-badge">{unreadMsgCount}</span>
              )}
            </Link>
          )}
          {!isAdmin && isFeatureAvailable(FEATURES.DISPUTES) && (
            <Link
              to="/disputes"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiAlertTriangle className="dropdown-icon" />
              <span>النزاعات والبلاغات</span>
            </Link>
          )}
          {isFeatureAvailable(FEATURES.NOTIFICATIONS) && (
            <Link
              to="/notifications"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiBell className="dropdown-icon" />
              <span>الإشعارات والتنبيهات</span>
              {unreadNotifCount > 0 && (
                <span className="unread-dropdown-badge">{unreadNotifCount}</span>
              )}
            </Link>
          )}
          <hr className="dropdown-divider" />
          <button
            type="button"
            className="dropdown-menu-item dropdown-logout-btn"
            onClick={onLogout}
          >
            <FiLogOut className="dropdown-icon" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
