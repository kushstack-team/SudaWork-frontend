import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-columns">
          {/* Column 1: الشركة */}
          <div className="footer-col">
            <h3>الشركة</h3>
            <ul>
              <li><a href="#about">عن سوداوورك</a></li>
              <li><a href="#help">مركز المساعدة</a></li>
              <li><a href="#trust">الثقة والأمان</a></li>
              <li><a href="#social-impact">التأثير الاجتماعي</a></li>
              <li><a href="#careers">الوظائف والمهن</a></li>
              <li><a href="#terms">الشروط والأحكام</a></li>
              <li><a href="#privacy">سياسة الخصوصية</a></li>
              <li><a href="#partners">الشركاء</a></li>
              <li><a href="#affiliates">الشركات التابعة</a></li>
            </ul>
          </div>

          {/* Column 2: حلول الأعمال */}
          <div className="footer-col">
            <h3>حلول الأعمال</h3>
            <ul>
              <li><a href="#pro">سوداوورك برو</a></li>
              <li><a href="#projects">إدارة المشاريع</a></li>
              <li><a href="#experts">خدمة اختيار الخبراء</a></li>
              <li><a href="#dropshipping">أوتو دي إس - درويشيبينغ</a></li>
              <li><a href="#software">ديجيس - تطوير البرمجيات</a></li>
              <li><a href="#ai-builder">منشئ متجر الذكاء الاصطناعي</a></li>
              <li><a href="#logo-maker">صانع الشعار من سوداوورك</a></li>
              <li><a href="#sales">الاتصال بالمبيعات</a></li>
            </ul>
          </div>

          {/* Column 3: للمستقلين */}
          <div className="footer-col">
            <h3>للمستقلين</h3>
            <ul>
              <li><a href="#be-freelancer">كن مستقلاً في سوداوورك</a></li>
              <li><a href="#join-agency">انضم كوكالة</a></li>
              <li><a href="#community">ملتقى المجتمع</a></li>
              <li><a href="#forum">منتدى النقاش</a></li>
              <li><a href="#events">الفعاليات والمناسبات</a></li>
            </ul>
          </div>

          {/* Column 4: للعملاء */}
          <div className="footer-col">
            <h3>للعملاء</h3>
            <ul>
              <li><a href="#how-it-works">كيف يعمل سوداوورك</a></li>
              <li><a href="#success-stories">قصص نجاح العملاء</a></li>
              <li><a href="#quality">دليل ضمان الجودة</a></li>
              <li><a href="#tips">أدلة ونصائح سوداوورك</a></li>
              <li><a href="#answers">إجابات سوداوورك</a></li>
            </ul>
          </div>

          {/* Column 5: التصنيفات */}
          <div className="footer-col">
            <h3>التصنيفات</h3>
            <ul>
              <li><a href="#design">الجرافيك والتصميم</a></li>
              <li><a href="#marketing">التسويق الرقمي</a></li>
              <li><a href="#writing">الكتابة والترجمة</a></li>
              <li><a href="#video">الفيديو والرسوم المتحركة</a></li>
              <li><a href="#music">الموسيقى والصوت</a></li>
              <li><a href="#tech">البرمجة والتكنولوجيا</a></li>
              <li><a href="#data">البيانات والتحليلات</a></li>
              <li><a href="#business">الأعمال والريادة</a></li>
              <li><a href="#lifestyle">أسلوب الحياة والترفيه</a></li>
              <li><a href="#ai">خدمات الذكاء الاصطناعي</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-bottom-logo">
            <svg className="footer-logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span className="footer-logo-text">SudaWork</span>
          </div>

          <div className="footer-bottom-selectors">
            <span className="selector-item">SAR ريال</span>
            <span className="selector-item">العربية</span>
          </div>

          <div className="footer-socials">
            <a href="#x" aria-label="X">𝕏</a>
            <a href="#instagram" aria-label="Instagram">📸</a>
            <a href="#linkedin" aria-label="LinkedIn">in</a>
            <a href="#facebook" aria-label="Facebook">f</a>
            <a href="#tiktok" aria-label="TikTok">🎵</a>
            <a href="#twitter" aria-label="Twitter">🐦</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
