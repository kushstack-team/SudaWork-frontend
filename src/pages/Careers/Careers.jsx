import { Link } from 'react-router-dom';
import { FiAward, FiGlobe, FiUsers, FiMail } from 'react-icons/fi';
import './Careers.css';

export default function Careers() {
  return (
    <div className="careers-page" dir="rtl">
      <div className="careers-container">
        <div className="careers-header">
          <span className="careers-badge">انضم إلى فريقنا</span>
          <h1 className="careers-title">الوظائف والفرص في سوداوورك</h1>
          <p className="careers-subtitle">
            نحن نبني مستقبل العمل الحر والاقتصاد الرقمي في السودان. انضم إلى فريق عمل شغوف يسعى لتمكين المواهب السودانية محلياً وعالمياً.
          </p>
        </div>

        <div className="careers-values-grid">
          <div className="value-card">
            <div className="value-icon"><FiGlobe /></div>
            <h3>تأثير مجتمعي حقيقي</h3>
            <p>نساعد آلاف المستقلين السودانيين في الوصول إلى فرص عمل دولية ومحلية مستدامة.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FiAward /></div>
            <h3>بيئة عمل مرنة ومحفزة</h3>
            <p>نعمل بنظام العمل عن بُعد مع مرونة كاملة وثقافة تركز على الإنتاجية والإنجاز.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><FiUsers /></div>
            <h3>نمو مهني متسارع</h3>
            <p>فرص للتعلم والتطور المهني والعمل مع أحدث التقنيات وأفضل الكفاءات في المنطقة.</p>
          </div>
        </div>

        <div className="openings-card">
          <h2>الفرص الحالية المتاحة</h2>
          <p className="openings-subtitle">
            حتى في حال عدم وجود شواغر مفتوحة تتطابق مع خبرتك حالياً، نحن دائماً نبحث عن المطورين، المصممين، ومدراء العمليات الاستثنائيين.
          </p>

          <div className="openings-notice-box">
            <FiMail className="notice-mail-icon" />
            <div>
              <h4>أرسل سيرتك الذاتية ومعرض أعمالك</h4>
              <p>
                يمكنك مراسلة فريق الموارد البشرية مباشرة عبر البريد الإلكتروني مع ذكر مجال اهتمامك:{' '}
                <a href="mailto:careers@sudawork.com" className="careers-email-link">careers@sudawork.com</a>
              </p>
            </div>
          </div>

          <div className="freelance-alternative-box">
            <h4>هل أنت مستقل محترف وتبحث عن مشاريع؟</h4>
            <p>
              لا حاجة لانتظار شواغر داخلية! يمكنك التسجيل كمستقل على منصة سوداوورك والبدء فوراً في تقديم عروضك على مئات المشاريع التقنية والإبداعية.
            </p>
            <Link to="/role-selection" className="join-freelancers-cta">
              سجّل كمستقل الآن وابدأ العمل &larr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
