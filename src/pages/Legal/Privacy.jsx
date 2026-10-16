import { useState, useEffect } from 'react';
import { usePlatform } from '../../context/platform';
import { api } from '../../services/api';
import './Legal.css';

export default function Privacy() {
  const { settings: platformSettings } = usePlatform();
  const [fetchedPrivacy, setFetchedPrivacy] = useState(null);
  const [loading, setLoading] = useState(!platformSettings?.privacy_policy);

  useEffect(() => {
    if (!platformSettings?.privacy_policy) {
      api.settings.getPublic()
        .then((data) => {
          if (data?.privacy_policy) {
            setFetchedPrivacy(data.privacy_policy);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [platformSettings]);

  const privacy = platformSettings?.privacy_policy || fetchedPrivacy || '';

  return (
    <div className="legal-page" dir="rtl">
      <div className="legal-container">
        <div className="legal-header">
          <span className="legal-badge">الخصوصية والأمان</span>
          <h1 className="legal-title">سياسة الخصوصية وسرية البيانات (Privacy Policy)</h1>
          <p className="legal-subtitle">
            بيان التزام منصة سوداوورك بحماية البيانات الشخصية والمالية للمستخدمين والعملاء والمستقلين.
          </p>
        </div>

        <div className="legal-content-card">
          {loading ? (
            <div className="legal-loading">
              <div className="profile-spinner" />
              <p>جارٍ تحميل نصوص سياسة الخصوصية...</p>
            </div>
          ) : privacy ? (
            <div className="legal-text-body" style={{ whiteSpace: 'pre-wrap' }}>
              {privacy}
            </div>
          ) : (
            <div className="legal-empty-state">
              <h3>حماية الخصوصية والمعلومات</h3>
              <p>
                نحن في سوداوورك نولي سرية بيانات المستخدمين الأولوية القصوى. تشمل سياسة الخصوصية المبادئ التالية:
              </p>
              <ul>
                <li><strong>جمع البيانات:</strong> نقوم بجمع البيانات الضرورية فقط لتشغيل المنصة وتقديم خدمات التوظيف والتنفيذ وتوثيق المدفوعات.</li>
                <li><strong>حماية البيانات المالية:</strong> تُعامل إشعارات الدفع البنكية وبيانات الحسابات بأعلى درجات السرية ولا يُكشف عنها إلا للضرورة الإدارية المعتمدة.</li>
                <li><strong>الملكية الفكرية:</strong> تعود ملكية مخرجات العمل وملفات المشاريع المسلمة لصاحب العمل بمجرد تحرير الدفعة كاملة.</li>
                <li><strong>عدم مشاركة البيانات:</strong> لا نقوم ببيع أو مشاركة بيانات المستخدمين مع أي أطراف ثالثة لأغراض تسويقية.</li>
              </ul>
              <p className="legal-note">
                (ملاحظة: يمكن لإدارة المنصة تخصيص نص سياسة الخصوصية المعتمد عبر لوحة تحكم الإدارة).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
