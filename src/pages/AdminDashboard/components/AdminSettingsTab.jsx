import { FiCheck } from 'react-icons/fi';

export default function AdminSettingsTab({
  settingsForm,
  setSettingsForm,
  onSaveSettings,
  saving = false
}) {
  const field = (key) => ({
    value: settingsForm[key] ?? '',
    onChange: (e) => setSettingsForm({ ...settingsForm, [key]: e.target.value }),
  });

  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">إعدادات المنصة العامة والضوابط القانونية</h3>
            <p className="section-desc">تعديل اسم المنصة، نسبة العمولة، تعليمات السداد والسحب، بيانات التواصل، والشروط وسياسة الخصوصية.</p>
          </div>
        </div>

        <form onSubmit={onSaveSettings} className="admin-settings-form">
          {/* 1. Platform Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="platformName">
              1. اسم المنصة الرسمي (Platform Name) *
            </label>
            <input
              id="platformName"
              type="text"
              className="settings-input"
              placeholder="SudanWork Freelance Marketplace"
              {...field('platformName')}
              required
            />
            <span className="input-hint">الاسم المعتمد الذي يظهر في العناوين والواجهات والفوتر.</span>
          </div>

          {/* 2. Commission Percentage */}
          <div className="form-group">
            <label className="form-label" htmlFor="commissionPercent">
              2. نسبة عمولة المنصة المقتطعة من أرباح المستقل (%) *
            </label>
            <input
              id="commissionPercent"
              type="number"
              min="0"
              max="50"
              step="0.5"
              className="settings-input"
              {...field('commissionPercent')}
              required
            />
            <span className="input-hint">تُطبّق على العقود التي تكتمل بعد الحفظ؛ العقود المكتملة سابقاً تحتفظ بعمولتها.</span>
          </div>

          {/* 3. Payment Instructions */}
          <div style={{ marginTop: '24px', marginBottom: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b' }}>3. تعليمات الإيداع والتحويل البنكي (Payment Instructions)</h4>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bankName">اسم البنك أو المحفظة</label>
            <input id="bankName" type="text" className="settings-input" placeholder="مثال: بنك الخرطوم (بنكك)" {...field('bankName')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="accountName">اسم صاحب الحساب</label>
            <input id="accountName" type="text" className="settings-input" {...field('accountName')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="accountNumber">رقم الحساب البنكي</label>
            <input id="accountNumber" type="text" className="settings-input" {...field('accountNumber')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paymentPhone">رقم هاتف التحويل (بنكك / فوري / أوكاش)</label>
            <input id="paymentPhone" type="text" className="settings-input" {...field('phone')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paymentInstructions">
              نص تعليمات الإيداع التي تظهر للعميل عند دفع الضمان
            </label>
            <textarea id="paymentInstructions" rows="3" className="settings-textarea" {...field('paymentNotes')} />
          </div>

          {/* 4. Withdrawal Instructions */}
          <div style={{ marginTop: '24px', marginBottom: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b' }}>4. تعليمات وضوابط سحب الأرباح (Withdrawal Instructions)</h4>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="withdrawalInstructions">
              إرشادات وشروط سحب الأرباح (تظهر للمستقلين في المحفظة)
            </label>
            <textarea id="withdrawalInstructions" rows="3" className="settings-textarea" {...field('withdrawalInstructions')} />
          </div>

          {/* 5. Contact Information */}
          <div style={{ marginTop: '24px', marginBottom: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b' }}>5. معلومات التواصل والدعم الفني (Contact Information)</h4>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contactEmail">بريد الدعم والمراسلات</label>
            <input id="contactEmail" type="email" className="settings-input" placeholder="support@sudawork.com" {...field('contactEmail')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contactPhone">هاتف الدعم أو واتساب</label>
            <input id="contactPhone" type="text" className="settings-input" placeholder="+249..." {...field('contactPhone')} />
          </div>

          {/* 6. Terms & Conditions */}
          <div style={{ marginTop: '24px', marginBottom: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b' }}>6. الشروط والأحكام (Terms & Conditions)</h4>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="termsAndConditions">نصوص الشروط والأحكام المنظمة للمنصة</label>
            <textarea id="termsAndConditions" rows="6" className="settings-textarea" placeholder="أدخل بنود اتفاقية الاستخدام والشروط العامة..." {...field('termsAndConditions')} />
          </div>

          {/* 7. Privacy Policy */}
          <div style={{ marginTop: '24px', marginBottom: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b' }}>7. سياسة الخصوصية (Privacy Policy)</h4>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="privacyPolicy">نص سياسة الخصوصية وحماية البيانات</label>
            <textarea id="privacyPolicy" rows="6" className="settings-textarea" placeholder="أدخل سياسة الخصوصية وضمان سرية البيانات..." {...field('privacyPolicy')} />
          </div>

          <button type="submit" className="save-settings-btn" disabled={saving}>
            <FiCheck />
            <span>{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات وتحديث المنصة'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
