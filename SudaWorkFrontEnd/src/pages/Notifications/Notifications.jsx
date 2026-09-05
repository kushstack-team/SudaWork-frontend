import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Notifications.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import {
  FiBell,
  FiFileText,
  FiCheckCircle,
  FiDollarSign,
  FiAlertTriangle,
  FiStar,
  FiTrash2,
  FiCheck,
  FiExternalLink,
  FiClock,
  FiFilter
} from 'react-icons/fi';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | unread | projects | contracts | finance | disputes
  const [actionSuccess, setActionSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'warning',
    onConfirm: null
  });

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await mockApi.notifications.getByUser(user.id);
      setNotifications(list || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await mockApi.notifications.markAllAsRead(user.id);
      setActionSuccess('تم تحديد كافة الإشعارات كمقروءة بنجاح');
      setTimeout(() => setActionSuccess(''), 4000);
      await loadNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (!user) return;
    setConfirmModal({
      isOpen: true,
      title: 'مسح الإشعارات',
      message: 'هل أنت متأكد من رغبتك في مسح كافة الإشعارات؟',
      confirmText: 'مسح الكل',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.notifications.clearAll(user.id);
          setActionSuccess('تم مسح سجل الإشعارات بنجاح');
          setTimeout(() => setActionSuccess(''), 4000);
          await loadNotifications();
        } catch (err) {
          console.error('Failed to clear notifications:', err);
        }
      }
    });
  };

  // Mark single as read
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await mockApi.notifications.markAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Delete single notification
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await mockApi.notifications.delete(id);
      await loadNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Click notification to navigate
  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await mockApi.notifications.markAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'projects') {
      return ['proposal_received', 'proposal_viewed', 'proposal_accepted'].includes(n.type);
    }
    if (activeTab === 'contracts') {
      return ['work_submitted', 'deliverable_approved', 'revision_requested'].includes(n.type);
    }
    if (activeTab === 'finance') {
      return ['escrow_funded', 'escrow_released', 'withdrawal_requested', 'withdrawal_completed'].includes(n.type);
    }
    if (activeTab === 'disputes') {
      return ['dispute_opened', 'review_received'].includes(n.type);
    }
    return true; // all
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ar-SD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getNotifDetails = (type) => {
    switch (type) {
      case 'proposal_received':
        return { icon: <FiFileText />, label: 'عرض جديد على المشروع', theme: 'proposal' };
      case 'proposal_viewed':
        return { icon: <FiFileText />, label: 'اطلاع على العرض', theme: 'proposal' };
      case 'proposal_accepted':
        return { icon: <FiCheckCircle />, label: 'قبول عرض وبدء عقد', theme: 'success' };
      case 'work_submitted':
        return { icon: <FiClock />, label: 'تسليم مرحلة عمل جديدة', theme: 'delivery' };
      case 'deliverable_approved':
        return { icon: <FiCheckCircle />, label: 'اعتماد تسليم العمل', theme: 'success' };
      case 'escrow_funded':
        return { icon: <FiDollarSign />, label: 'إيداع وتوثيق الضمان', theme: 'payment' };
      case 'escrow_released':
        return { icon: <FiDollarSign />, label: 'تحرير دفعة أرباح', theme: 'payment' };
      case 'dispute_opened':
        return { icon: <FiAlertTriangle />, label: 'نزاع أو بلاغ تحكيم', theme: 'dispute' };
      case 'review_received':
        return { icon: <FiStar />, label: 'تقييم ومراجعة جديدة', theme: 'review' };
      default:
        return { icon: <FiBell />, label: 'تنبيه من المنصة', theme: 'default' };
    }
  };

  return (
    <div className="notifications-page" dir="rtl">
      <DashboardNavbar />

      <main className="notifications-main">
        <div className="notifications-container">

          {/* Breadcrumb Navigation */}
          <div className="notifications-breadcrumb">
            <Link to="/" className="breadcrumb-link">الرئيسية</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">مركز الإشعارات والتنبيهات</span>
          </div>

          {/* Alert Success */}
          {actionSuccess && (
            <div className="notifications-alert-banner" role="alert">
              <FiCheckCircle />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Header Hero Card */}
          <div className="notifications-hero-card">
            <div className="hero-content">
              <div className="hero-badge">
                <FiBell />
                <span>التنبيهات المباشرة</span>
              </div>
              <h1 className="hero-title">مركز الإشعارات والأنشطة</h1>
              <p className="hero-subtitle">
                متابعة فورية لجميع تحركات حسابك: العروض، العقود، التسليمات، عمليات الضمان المالي عبر بنكك، ورسائل التحكيم.
              </p>
            </div>

            <div className="hero-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="hero-btn primary"
                  onClick={handleMarkAllRead}
                >
                  <FiCheck />
                  <span>تحديد الكل كمقروء ({unreadCount})</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="hero-btn secondary"
                  onClick={handleClearAll}
                >
                  <FiTrash2 />
                  <span>مسح الكل</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs Bar */}
          <div className="notifications-tabs-bar">
            <div className="tabs-wrapper">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                الكل ({notifications.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                غير مقروءة ({unreadCount})
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                المشاريع والعروض
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
                onClick={() => setActiveTab('contracts')}
              >
                العقود والتسليمات
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
                onClick={() => setActiveTab('finance')}
              >
                المالية والضمان
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`}
                onClick={() => setActiveTab('disputes')}
              >
                النزاعات والتقييمات
              </button>
            </div>
          </div>

          {/* Notifications Feed */}
          {loading ? (
            <div className="notifications-loading">
              <div className="profile-spinner" />
              <p>جارٍ تحميل الإشعارات والتحديثات...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty-box">
              <div className="empty-icon-wrap">
                <FiBell />
              </div>
              <h3>لا توجد إشعارات في هذا التبويب</h3>
              <p>
                أنت على اطلاع بكل جديد! عند حدوث أي نشاط جديد متعلق بمشاريعك أو مدفوعاتك ستجده يظهر هنا فوراً.
              </p>
              <Link to="/" className="empty-back-link">
                العودة إلى لوحة التحكم
              </Link>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notif) => {
                const meta = getNotifDetails(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Icon Container */}
                    <div className={`notification-icon-container ${meta.theme}`}>
                      {meta.icon}
                    </div>

                    {/* Content Details */}
                    <div className="notification-content">
                      <div className="notification-meta-top">
                        <span className={`notification-type-pill ${meta.theme}`}>
                          {meta.label}
                        </span>
                        <span className="notification-date">
                          <FiClock className="time-icon" />
                          {formatDate(notif.createdAt)}
                        </span>
                        {!notif.isRead && (
                          <span className="unread-dot-badge">جديد</span>
                        )}
                      </div>

                      <p className="notification-text">{notif.message}</p>

                      {notif.link && (
                        <div className="notification-link-preview">
                          <span className="link-text">الانتقال إلى التفاصيل</span>
                          <FiExternalLink className="link-icon" />
                        </div>
                      )}
                    </div>

                    {/* Actions on Card */}
                    <div className="notification-card-actions">
                      {!notif.isRead && (
                        <button
                          type="button"
                          className="action-icon-btn mark-read"
                          title="تحديد كمقروء"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-icon-btn delete"
                        title="حذف هذا الإشعار"
                        onClick={(e) => handleDelete(notif.id, e)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <Footer />
    </div>
  );
};

export default Notifications;
