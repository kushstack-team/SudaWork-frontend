import { formatDateTime } from '../../../utils/formatters';

const ACTION_TEXT = {
  'payment.approve': 'اعتماد دفعة',
  'payment.reject': 'رفض دفعة',
  'withdrawal.approve': 'اعتماد طلب سحب',
  'withdrawal.reject': 'رفض طلب سحب',
  'withdrawal.mark_paid': 'تسجيل تحويل أرباح',
  'contract.start': 'بدء عقد',
  'contract.cancel': 'إلغاء عقد',
  'user.suspend': 'تعليق مستخدم',
  'user.activate': 'تفعيل مستخدم',
  'user.update': 'تعديل مستخدم',
  'user.delete': 'حذف (تعطيل) مستخدم',
  'project.moderate': 'إيقاف/تعديل مشروع',
  'project.delete': 'حذف مشروع',
  'category.create': 'إضافة تصنيف',
  'category.update': 'تعديل تصنيف',
  'category.delete': 'حذف تصنيف',
  'category.deactivate': 'إخفاء تصنيف',
  'skill.create': 'إضافة مهارة',
  'skill.update': 'تعديل مهارة',
  'skill.deactivate': 'إخفاء مهارة',
  'settings.update': 'تعديل الإعدادات',
  'feature.update': 'تعديل ميزة',
  'report.in_review': 'مراجعة بلاغ',
  'report.resolve': 'البت في بلاغ',
  'conversation.admin_read': 'اطلاع إداري على محادثة',
};

export default function AdminAuditTab({ logs, total, page, totalPages, onPageChange }) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">سجل العمليات الإدارية ({total})</h3>
            <p className="section-desc">كل الإجراءات الإدارية والمالية مسجلة هنا ولا يمكن تعديلها.</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المدير</th>
                <th>الإجراء</th>
                <th>العنصر</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-cell">لا توجد عمليات مسجلة بعد</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.created_at)}</td>
                    <td>{log.actor_name || '—'}</td>
                    <td className="font-bold">{ACTION_TEXT[log.action] || log.action}</td>
                    <td className="font-mono">{log.entity_type}{log.entity_id ? ` · ${String(log.entity_id).slice(0, 8)}` : ''}</td>
                    <td className="font-mono" style={{ maxWidth: 320, overflowWrap: 'anywhere', direction: 'ltr', textAlign: 'right' }}>
                      {log.details ? JSON.stringify(log.details) : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="table-action-btns" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button type="button" className="btn-approve" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>السابق</button>
            <span>صفحة {page} من {totalPages}</span>
            <button type="button" className="btn-approve" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>التالي</button>
          </div>
        )}
      </div>
    </div>
  );
}
