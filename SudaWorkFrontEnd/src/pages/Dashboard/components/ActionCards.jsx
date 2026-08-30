import React from 'react';
import { 
  FiFileText, 
  FiSmartphone, 
  FiUserCheck 
} from 'react-icons/fi';
import './ActionCards.css';

const ActionCards = () => {
  return (
    <section className="dashboard-action-cards" dir="rtl">
      <div className="action-cards-grid">
        
        {/* Card 1: Publish Project (Rightmost in RTL) */}
        <div className="action-card">
          <div className="action-card-header">
            <div className="action-icon-box">
              <FiFileText className="action-card-icon" />
            </div>
            <span className="action-card-tag">موصى به لك</span>
          </div>
          <div className="action-card-body">
            <h3 className="action-card-title">انشر وصف مشروعك</h3>
            <p className="action-card-desc">
              احصل على قائمة مختارة من أقوى المواهب السودانية المناسبة لمتطلبات عملك المحددة.
            </p>
          </div>
        </div>

        {/* Card 2: Download App (Middle in RTL) */}
        <div className="action-card">
          <div className="action-card-header">
            <div className="action-icon-box">
              <FiSmartphone className="action-card-icon" />
            </div>
            <span className="action-card-tag">موصى به لك</span>
          </div>
          <div className="action-card-body">
            <h3 className="action-card-title">حمّل تطبيق سوداوورك</h3>
            <p className="action-card-desc">
              ابقَ منتجاً وتواصل مع المستقلين في أي مكان وزمان عبر تطبيق الجوال المخصص.
            </p>
          </div>
        </div>

        {/* Card 3: Profile Progress (Leftmost in RTL) */}
        <div className="action-card">
          <div className="action-card-header">
            <div className="action-icon-box">
              <FiUserCheck className="action-card-icon" />
            </div>
            <span className="action-card-tag">تقدم الملف الشخصي</span>
          </div>
          <div className="action-card-body">
            <h3 className="action-card-title">لقد أكملت 35% من ملفك الشخصي</h3>
            <p className="action-card-desc">
              أكمله للحصول على اقتراحات مخصصة ومطابقة لأفضل العروض.
            </p>
            <div className="action-progress-container">
              <span className="progress-percent-label">35% مكتمل</span>
              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: '35%' }}
                  role="progressbar"
                  aria-valuenow="35"
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ActionCards;
