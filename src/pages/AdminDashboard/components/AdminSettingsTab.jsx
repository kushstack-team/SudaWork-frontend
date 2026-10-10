import { FiCheck } from 'react-icons/fi';

export default function AdminSettingsTab({
  settingsForm,
  setSettingsForm,
  onSaveSettings,
  saving = false
}) {
  const field = (key) => ({
    value: settingsForm[key],
    onChange: (e) => setSettingsForm({ ...settingsForm, [key]: e.target.value }),
  });

  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">إعدادات المنصة وتعليمات السداد والعمولة</h3>
            <p className="section-desc">تعديل نسبة العمولة الرسمية وبيانات حسابات التحويل البنكي التي تظهر للعملاء.</p>
          </div>
        </div>

        <form onSubmit={onSaveSettings} className="admin-settings-form">
          <div className="form-group">
            <label className="form-label" htmlFor="commissionPercent">
              نسبة عمولة المنصة المقتطعة من أرباح المستقل (%)
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

          <div className="form-group">
            <label className="form-label" htmlFor="bankName">اسم البنك أو المحفظة</label>
            <input id="bankName" type="text" className="settings-input" placeholder="مثال: بنك الخرطوم (بنكك)" {...field('bankName')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="accountName">اسم الحساب</label>
            <input id="accountName" type="text" className="settings-input" {...field('accountName')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="accountNumber">رقم الحساب</label>
            <input id="accountNumber" type="text" className="settings-input" {...field('accountNumber')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paymentPhone">رقم الهاتف للتحويل (اختياري)</label>
            <input id="paymentPhone" type="text" className="settings-input" {...field('phone')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paymentInstructions">
              تعليمات إضافية للإيداع (تظهر للعملاء)
            </label>
            <textarea id="paymentInstructions" rows="3" className="settings-textarea" {...field('paymentNotes')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="withdrawalInstructions">
              تعليمات وضوابط سحب أرباح المستقلين
            </label>
            <textarea id="withdrawalInstructions" rows="3" className="settings-textarea" {...field('withdrawalInstructions')} />
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
