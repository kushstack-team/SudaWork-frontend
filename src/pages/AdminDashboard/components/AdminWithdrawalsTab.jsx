import { Link } from 'react-router-dom';
import { FiCheck, FiX, FiDollarSign } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminWithdrawalsTab({
  withdrawalRequests,
  onApproveWithdrawal,
  onMarkPaid,
  onRejectWithdrawal
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">طلبات سحب أرباح المستقلين</h3>
            <p className="section-desc">
              اعتمد الطلب، نفّذ التحويل يدوياً عبر بنكك أو المحفظة، ثم سجّل رقم العملية. لا يمكن تسجيل التحويل مرتين.
            </p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المستقل</th>
                <th>المبلغ المطلوب</th>
                <th>طريقة السحب</th>
                <th>الحساب / الهاتف</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>الإجراء الإداري</th>
              </tr>
            </thead>
            <tbody>
              {withdrawalRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-cell">لا توجد طلبات سحب حالياً</td>
                </tr>
              ) : (
                withdrawalRequests.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <Link to={`/freelancers/${w.freelancerId}`} className="table-link">
                        {w.freelancerName}
                      </Link>
                    </td>
                    <td className="font-bold text-success">{Number(w.amount || 0).toLocaleString()} ج.س</td>
                    <td>{w.method}</td>
                    <td className="font-mono">{w.accountNumber}<br />{w.accountName}</td>
                    <td>{formatDate(w.createdAt)}</td>
                    <td>
                      <span className={`withdrawal-status-pill ${w.status.toLowerCase()}`}>
                        {w.status === 'Pending' && 'بانتظار المراجعة'}
                        {w.status === 'Approved' && 'معتمد - بانتظار التحويل'}
                        {w.status === 'Paid' && 'تم التحويل'}
                        {w.status === 'Rejected' && 'مرفوض'}
                      </span>
                      {w.transactionReference && <div className="font-mono">{w.transactionReference}</div>}
                      {w.adminReason && <div className="input-hint">{w.adminReason}</div>}
                    </td>
                    <td>
                      {w.status === 'Pending' && (
                        <div className="table-action-btns">
                          <button type="button" className="btn-approve" onClick={() => onApproveWithdrawal(w)}>
                            <FiCheck />
                            <span>اعتماد</span>
                          </button>
                          <button type="button" className="btn-reject" onClick={() => onRejectWithdrawal(w)}>
                            <FiX />
                            <span>رفض</span>
                          </button>
                        </div>
                      )}
                      {w.status === 'Approved' && (
                        <div className="table-action-btns">
                          <button type="button" className="btn-approve" onClick={() => onMarkPaid(w)}>
                            <FiDollarSign />
                            <span>تسجيل التحويل</span>
                          </button>
                          <button type="button" className="btn-reject" onClick={() => onRejectWithdrawal(w)}>
                            <FiX />
                            <span>رفض</span>
                          </button>
                        </div>
                      )}
                      {(w.status === 'Paid' || w.status === 'Rejected') && (
                        <span className="action-completed-text">تمت المعالجة</span>
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
