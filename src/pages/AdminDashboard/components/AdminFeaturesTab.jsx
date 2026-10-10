import { useState } from 'react';
import { FEATURE_LABELS } from '../../../constants/features';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';

const ROLE_LABELS = { client: 'العملاء', freelancer: 'المستقلون' };

/**
 * Admin-controlled feature availability. Each change is saved immediately on
 * the server (and audited); the switch only reflects the saved state.
 * Roles a feature is not designed for are shown as "not applicable".
 */
export default function AdminFeaturesTab({ features, onChange }) {
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [pending, setPending] = useState(null);

  const apply = async (feature, changes, key) => {
    setSavingKey(key);
    setSavedKey(null);
    const ok = await onChange(feature, changes);
    setSavingKey(null);
    if (ok) {
      setSavedKey(key);
      setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2500);
    }
  };

  const toggle = (feature, field) => {
    const next = !feature[field];
    const key = `${feature.id}:${field}`;
    // Turning something off affects users immediately, so confirm first.
    if (!next) {
      const label = FEATURE_LABELS[feature.id]?.name || feature.name;
      setPending({
        title: field === 'enabled' ? `إيقاف ميزة "${label}"` : `إخفاء "${label}" عن ${ROLE_LABELS[field]}`,
        message: field === 'enabled'
          ? 'سيتم إيقاف هذه الميزة لجميع العملاء والمستقلين فوراً، وسيرفض الخادم أي طلب يخصها. هل تريد المتابعة؟'
          : `لن يتمكن ${ROLE_LABELS[field]} من استخدام هذه الميزة حتى تعيد تفعيلها. هل تريد المتابعة؟`,
        run: () => apply(feature, { [field]: next }, key),
      });
      return;
    }
    apply(feature, { [field]: next }, key);
  };

  const cell = (feature, field) => {
    const key = `${feature.id}:${field}`;
    if (field !== 'enabled' && !feature.eligibleRoles.includes(field)) {
      return <span className="action-completed-text">غير قابل للتطبيق</span>;
    }
    const on = Boolean(feature[field]);
    return (
      <label className="feature-switch" title={on ? 'مفعّل' : 'متوقف'}>
        <input
          type="checkbox"
          checked={on}
          disabled={savingKey !== null || (field !== 'enabled' && !feature.enabled)}
          onChange={() => toggle(feature, field)}
        />
        <span className={`feature-switch-text ${on ? 'on' : 'off'}`}>
          {savingKey === key ? 'جارٍ الحفظ...' : savedKey === key ? 'تم الحفظ ✓' : on ? 'مفعّل' : 'متوقف'}
        </span>
      </label>
    );
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">إدارة الميزات المتاحة للمستخدمين</h3>
            <p className="section-desc">
              تحكّم في الميزات المتاحة للعملاء والمستقلين دون الحاجة لتحديث التطبيق. التغييرات تُحفظ فوراً وتُطبّق على الخادم،
              ولا تمنح أي دور صلاحيات خارج نطاقه.
            </p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الميزة</th>
                <th>التفعيل العام</th>
                <th>متاحة للعملاء</th>
                <th>متاحة للمستقلين</th>
              </tr>
            </thead>
            <tbody>
              {features.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-table-cell">تعذر تحميل قائمة الميزات.</td>
                </tr>
              ) : (
                features.map((feature) => (
                  <tr key={feature.id}>
                    <td>
                      <div className="font-bold">{FEATURE_LABELS[feature.id]?.name || feature.name}</div>
                      <div className="input-hint">{FEATURE_LABELS[feature.id]?.description || feature.description}</div>
                    </td>
                    <td>{cell(feature, 'enabled')}</td>
                    <td>{cell(feature, 'client')}</td>
                    <td>{cell(feature, 'freelancer')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pending)}
        title={pending?.title || ''}
        message={pending?.message || ''}
        confirmText="تأكيد"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => {
          const run = pending.run;
          setPending(null);
          run();
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
