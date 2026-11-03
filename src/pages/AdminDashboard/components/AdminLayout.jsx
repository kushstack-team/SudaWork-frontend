import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiExternalLink, FiLogOut, FiMenu, FiRefreshCw, FiX } from 'react-icons/fi';
import Logo from '../../../components/Logo/Logo';
import './AdminLayout.css';

/**
 * Admin dashboard shell: a sidebar of grouped sections (an off-canvas drawer
 * on small screens) and a top bar with the current section's title.
 *
 * `groups` is [{ label, items: [{ id, label, icon: Icon, badge }] }].
 */
export default function AdminLayout({
  groups,
  activeId,
  onNavigate,
  title,
  subtitle,
  user,
  unreadNotifications = 0,
  onRefresh,
  onLogout,
  children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const go = (id) => {
    setDrawerOpen(false);
    onNavigate(id);
  };

  return (
    <div className="admin-shell" dir="rtl">
      <aside className={`admin-sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="أقسام لوحة الإدارة">
        <div className="admin-sidebar__brand">
          <Logo to="/admin" theme="dark" ariaLabel="لوحة الإدارة" />
          <button type="button" className="admin-sidebar__close" onClick={() => setDrawerOpen(false)} aria-label="إغلاق القائمة">
            <FiX />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {groups.map((group) => (
            <div key={group.label} className="admin-sidebar__group">
              <span className="admin-sidebar__group-label">{group.label}</span>
              {group.items.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  type="button"
                  className={`admin-sidebar__item ${activeId === id ? 'is-active' : ''}`}
                  aria-current={activeId === id ? 'page' : undefined}
                  onClick={() => go(id)}
                >
                  <Icon className="admin-sidebar__icon" aria-hidden="true" />
                  <span className="admin-sidebar__label">{label}</span>
                  {badge > 0 && <span className="admin-sidebar__badge">{badge > 99 ? '99+' : badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__avatar" aria-hidden="true">
            {(user?.fullName || 'A').charAt(0)}
          </div>
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__user-name">{user?.fullName}</span>
            <span className="admin-sidebar__user-role">مدير النظام</span>
          </div>
          <button type="button" className="admin-sidebar__logout" onClick={onLogout} title="تسجيل الخروج" aria-label="تسجيل الخروج">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {drawerOpen && <div className="admin-shell__overlay" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

      <div className="admin-shell__main">
        <header className="admin-topbar">
          <button type="button" className="admin-topbar__menu" onClick={() => setDrawerOpen(true)} aria-label="فتح القائمة">
            <FiMenu />
          </button>
          <div className="admin-topbar__heading">
            <h1 className="admin-topbar__title">{title}</h1>
            {subtitle && <p className="admin-topbar__subtitle">{subtitle}</p>}
          </div>
          <div className="admin-topbar__actions">
            {onRefresh && (
              <button type="button" className="admin-topbar__icon-btn" onClick={onRefresh} title="تحديث البيانات" aria-label="تحديث البيانات">
                <FiRefreshCw />
              </button>
            )}
            <Link to="/notifications" className="admin-topbar__icon-btn" title="الإشعارات" aria-label="الإشعارات">
              <FiBell />
              {unreadNotifications > 0 && <span className="admin-topbar__dot" />}
            </Link>
            <Link to="/" className="admin-topbar__site-link">
              <FiExternalLink />
              <span>عرض الموقع</span>
            </Link>
          </div>
        </header>

        <main className="admin-shell__content">{children}</main>
      </div>
    </div>
  );
}
