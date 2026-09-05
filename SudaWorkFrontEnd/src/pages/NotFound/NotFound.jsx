import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiUsers, FiArrowRight, FiCompass, FiGrid } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './NotFound.css';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'client') return '/client-dashboard';
    if (user.role === 'freelancer') return '/freelancer-dashboard';
    if (user.role === 'admin') return '/admin';
    return '/';
  };

  return (
    <div className="not-found-page" dir="rtl">
      <div className="not-found-container">
        <div className="not-found-badge">
          <FiCompass className="badge-icon" /> 404 - صفحة مفقودة
        </div>

        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">الصفحة التي تبحث عنها غير موجودة</h2>
        <p className="not-found-desc">
          يبدو أن الرابط الذي اتبعته غير صحيح أو تم نقل الصفحة. لا تقلق، يمكنك الانتقال إلى أي من الأقسام التالية:
        </p>

        <div className="not-found-quicklinks">
          <Link to={getDashboardLink()} className="quicklink-card">
            <div className="quicklink-icon">
              <FiHome />
            </div>
            <div className="quicklink-info">
              <h3>{user ? 'لوحة التحكم الخاصة بك' : 'الصفحة الرئيسية'}</h3>
              <p>العودة للمتابعة والتصفح المباشر</p>
            </div>
            <FiArrowRight className="quicklink-arrow" />
          </Link>

          <Link to="/projects" className="quicklink-card">
            <div className="quicklink-icon">
              <FiSearch />
            </div>
            <div className="quicklink-info">
              <h3>تصفح المشاريع</h3>
              <p>استكشف أحدث الفرص والعروض المتاحة</p>
            </div>
            <FiArrowRight className="quicklink-arrow" />
          </Link>

          <Link to="/freelancers" className="quicklink-card">
            <div className="quicklink-icon">
              <FiUsers />
            </div>
            <div className="quicklink-info">
              <h3>تصفح المستقلين</h3>
              <p>ابحث عن نخبة الخبراء السودانيين لإنجاز أعمالك</p>
            </div>
            <FiArrowRight className="quicklink-arrow" />
          </Link>

          <Link to="/categories" className="quicklink-card">
            <div className="quicklink-icon">
              <FiGrid />
            </div>
            <div className="quicklink-info">
              <h3>جميع الأقسام والتصنيفات</h3>
              <p>تصفح مجالات العمل والخدمات المتنوعة</p>
            </div>
            <FiArrowRight className="quicklink-arrow" />
          </Link>
        </div>

        <div className="not-found-actions">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            الرجوع للصفحة السابقة
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
