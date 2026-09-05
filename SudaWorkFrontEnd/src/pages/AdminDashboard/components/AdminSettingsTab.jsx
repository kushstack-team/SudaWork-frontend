import React from 'react';
import { FiCheck } from 'react-icons/fi';

export default function AdminSettingsTab({
  settingsForm,
  setSettingsForm,
  onSaveSettings
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">إعدادات المنصة وتعليمات السداد والعمولة</h3>
            <p className="section-desc">تعديل نسبة العمولة الرسمية وبيانات حسابات التحويل البنكي للمستخدمين.</p>
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
              max="30"
              className="settings-input"
              value={settingsForm.commissionPercent}
              onChange={(e) => setSettingsForm({ ...settingsForm, commissionPercent: e.target.value })}
              required
            />
            <span className="input-hint">النسبة الافتراضية المعتمدة هي 10%.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paymentInstructions">
              تعليمات الإيداع والتحويل البنكي للعملاء (تطبيق بنكك)
            </label>
            <textarea
              id="paymentInstructions"
              rows="3"
              className="settings-textarea"
              value={settingsForm.paymentInstructions}
              onChange={(e) => setSettingsForm({ ...settingsForm, paymentInstructions: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="withdrawalInstructions">
              تعليمات وضوابط سحب أرباح المستقلين
            </label>
            <textarea
              id="withdrawalInstructions"
              rows="3"
              className="settings-textarea"
              value={settingsForm.withdrawalInstructions}
              onChange={(e) => setSettingsForm({ ...settingsForm, withdrawalInstructions: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="save-settings-btn">
            <FiCheck />
            <span>حفظ التعديلات وتحديث المنصة</span>
          </button>
        </form>
      </div>
    </div>
  );
}
