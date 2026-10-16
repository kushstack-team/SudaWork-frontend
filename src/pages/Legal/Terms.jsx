import { useState, useEffect } from 'react';
import { usePlatform } from '../../context/platform';
import { api } from '../../services/api';
import './Legal.css';

export default function Terms() {
  const { settings: platformSettings } = usePlatform();
  const [fetchedTerms, setFetchedTerms] = useState(null);
  const [loading, setLoading] = useState(!platformSettings?.terms_and_conditions);

  useEffect(() => {
    if (!platformSettings?.terms_and_conditions) {
      api.settings.getPublic()
        .then((data) => {
          if (data?.terms_and_conditions) {
            setFetchedTerms(data.terms_and_conditions);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [platformSettings]);

  const terms = platformSettings?.terms_and_conditions || fetchedTerms || '';

  return (
    <div className="legal-page" dir="rtl">
      <div className="legal-container">
        <div className="legal-header">
          <span className="legal-badge">الوثائق القانونية</span>
          <h1 className="legal-title">الشروط والأحكام العامة (Terms & Conditions)</h1>
          <p className="legal-subtitle">
            شروط وضوابط استخدام منصة سوداوورك للعمل الحر، وتنظيم العلاقة التعاقدية بين أصحاب الأعمال والمستقلين.
          </p>
        </div>

        <div className="legal-content-card">
          {loading ? (
            <div className="legal-loading">
              <div className="profile-spinner" />
              <p>جارٍ تحميل نصوص الشروط والأحكام...</p>
            </div>
          ) : terms ? (
            <div className="legal-text-body" style={{ whiteSpace: 'pre-wrap' }}>
              {terms}
            </div>
          ) : (
            <div className="legal-empty-state">
              <h3>بنود اتفاقية الاستخدام والتعامل</h3>
              <p>
                منصة سوداوورك هي منصة ووساطة مهنية تربط بين أصحاب الأعمال والمستقلين داخل السودان وخارجه. 
                تلتزم المنصة بتوفير بيئة عمل آمنة، وضمان حقوق الطرفين من خلال نظام الضمان المالي (Escrow) والتحكيم العادل في النزاعات.
              </p>
              <ul>
                <li><strong>حسابات المستخدمين:</strong> يلتزم المستخدم بتقديم معلومات حقيقية ودقيقة عند إنشاء الحساب.</li>
                <li><strong>نظام الضمان المالي:</strong> يلتزم صاحب العمل بإيداع قيمة العقد لدى المنصة قبل بدء المستقل في التنفيذ.</li>
                <li><strong>التسليم والقبول:</strong> يحق للعميل فحص العمل المسلم وطلب التعديلات المبررة وفق الاتفاق المسبق.</li>
                <li><strong>التحكيم وفض النزاعات:</strong> في حال الخلاف، يتولى فريق التحكيم بالمنصة الفصل وفق الأدلة والمخرجات المسجلة.</li>
              </ul>
              <p className="legal-note">
                (ملاحظة: يمكن لإدارة المنصة تحديث نص الشروط والأحكام المعتمد مباشرة عبر لوحة تحكم الإدارة).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
