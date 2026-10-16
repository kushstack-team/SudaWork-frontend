import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../../context/platform';
import { api } from '../../services/api';
import { FiHelpCircle, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import './Help.css';

export default function HelpCenter() {
  const { settings: platformSettings } = usePlatform();
  const [fetchedContact, setFetchedContact] = useState(null);

  useEffect(() => {
    if (!platformSettings?.contact_info) {
      api.settings.getPublic()
        .then((data) => {
          if (data?.contact_info) {
            setFetchedContact(data.contact_info);
          }
        })
        .catch(() => {});
    }
  }, [platformSettings]);

  const contactInfo = platformSettings?.contact_info || fetchedContact || {};
  const supportEmail = contactInfo.email || 'support@sudawork.com';
  const supportPhone = contactInfo.phone || '+249 91 234 5678';

  const FAQS = [
    {
      q: 'كيف تضمن منصة سوداوورك أموالي عند توظيف مستقل؟',
      a: 'تستخدم المنصة نظام الضمان المالي الكامل (Escrow). عند قبولك لعرض المستقل، تودع المبلغ في حساب وسيط موثوق، ولا يتم تسليم أي مبلغ للمستقل إلا بعد إتمام المشروع ومراجعتك للعمل ورضاك عنه.'
    },
    {
      q: 'ما هي طرق الدفع والسحب المتاحة داخل السودان؟',
      a: 'ندعم التحويل البنكي المباشر عبر تطبيق بنكك (بنك الخرطوم)، بالإضافة إلى المحافظ الإلكترونية المعتمدة مثل فوري وأوكاش وزين كاش.'
    },
    {
      q: 'ماذا أفعل إذا واجهت مشكلة في جودة العمل أو موعد التسليم؟',
      a: 'يمكنك طلب تعديلات عبر صفحة العقد. وفي حال عدم التوصل لاتفاق مع الطرف الآخر، يمكنك رفع نزاع تحكيمي للجنة إدارة المنصة من خلال زر "رفع نزاع" لاتخاذ قرار ملزم يحفظ حقوق الجميع.'
    },
    {
      q: 'كم تبلغ عمولة منصة سوداوورك؟',
      a: 'نشر المشاريع وتقديم العروض مجاني تماماً. تطبق المنصة نسبة عمولة تنافسية مقتطعة فقط من أرباح العقد المكتمل بنجاح لتغطية تكاليف التشغيل والتحكيم والضمان.'
    }
  ];

  return (
    <div className="help-page" dir="rtl">
      <div className="help-container">
        <div className="help-header">
          <span className="help-badge">الدعم الفني والمساندة</span>
          <h1 className="help-title">مركز مساعدة سوداوورك</h1>
          <p className="help-subtitle">
            إجابات سريعة للأسئلة الشائعة وقنوات التواصل المباشرة لمساعدتك في إنجاز أعمالك بكل سهولة.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="help-contact-grid">
          <div className="help-contact-card">
            <div className="contact-icon email"><FiMail /></div>
            <h3>البريد الإلكتروني</h3>
            <p>فريق الدعم متاح للرد على استفساراتكم خلال 24 ساعة.</p>
            <a href={`mailto:${supportEmail || 'support@sudawork.com'}`} className="contact-link">
              {supportEmail || 'support@sudawork.com'}
            </a>
          </div>

          <div className="help-contact-card">
            <div className="contact-icon phone"><FiPhone /></div>
            <h3>الهاتف وخدمة العملاء</h3>
            <p>للمساعدة الفورية في عمليات الإيداع والتحكيم.</p>
            <span className="contact-link dir-ltr">
              {supportPhone || '+249 123 456 789'}
            </span>
          </div>

          <div className="help-contact-card">
            <div className="contact-icon guide"><FiShield /></div>
            <h3>الضمان والتحكيم</h3>
            <p>تعرف على آليات فض النزاعات وحماية أموال العقود.</p>
            <Link to="/terms" className="contact-link">
              شروط وضوابط الاستخدام &larr;
            </Link>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="faq-section">
          <h2 className="faq-heading">الأسئلة الشائعة والأكثر تكراراً</h2>
          <div className="faq-stack">
            {FAQS.map((item, idx) => (
              <div key={idx} className="faq-item">
                <h4 className="faq-question">
                  <FiHelpCircle className="faq-q-icon" />
                  <span>{item.q}</span>
                </h4>
                <p className="faq-answer">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
