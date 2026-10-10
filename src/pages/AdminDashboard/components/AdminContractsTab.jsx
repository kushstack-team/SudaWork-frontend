import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

const STATUS_TEXT = {
  'Awaiting Payment': 'بانتظار الدفع',
  Active: 'ساري',
  Submitted: 'تم التسليم',
  'Revision Requested': 'مطلوب تعديلات',
  Completed: 'مكتمل',
  Cancelled: 'ملغي',
};

export default function AdminContractsTab({ contracts, statusFilter, setStatusFilter, onCancelContract }) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">عقود العمل</h3>
            <p className="section-desc">متابعة جميع العقود وحالة الدفع، مع إمكانية إلغاء العقد عند الحاجة (تُعاد المبالغ يدوياً).</p>
          </div>
          <div className="users-filter-controls">
            <select className="role-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">كل الحالات</option>
              <option value="AWAITING_PAYMENT">بانتظار الدفع</option>
              <option value="ACTIVE">ساري</option>
              <option value="SUBMITTED">تم التسليم</option>
              <option value="REVISION_REQUESTED">مطلوب تعديلات</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المشروع</th>
                <th>العميل</th>
                <th>المستقل</th>
                <th>القيمة</th>
                <th>الدفع</th>
                <th>تاريخ الإنشاء</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">لا توجد عقود مطابقة</td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id}>
                    <td className="font-bold">
                      <Link to={`/contracts/${c.id}`} className="table-link">{c.projectTitle}</Link>
                    </td>
                    <td>{c.clientName}</td>
                    <td>{c.freelancerName}</td>
                    <td>{Number(c.agreedPrice || 0).toLocaleString()} ج.س</td>
                    <td>{c.paymentStatus || '—'}</td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <span className={`project-status-tag ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {STATUS_TEXT[c.status] || c.status}
                      </span>
                    </td>
                    <td>
                      {['Completed', 'Cancelled'].includes(c.status) ? (
                        <span className="action-completed-text">—</span>
                      ) : (
                        <button type="button" className="btn-reject" onClick={() => onCancelContract(c)}>
                          <FiX />
                          <span>إلغاء</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
