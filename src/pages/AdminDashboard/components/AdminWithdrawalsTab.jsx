import { Link } from 'react-router-dom';
import { FiX, FiSend, FiMessageSquare, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { formatDate, paymentMethodLabel } from '../../../utils/formatters';

const STATUS_LABELS = {
  Pending: 'بانتظار المراجعة',
  Approved: 'معتمد - بانتظار التحويل',
  Paid: 'تم التحويل',
  Rejected: 'مرفوض',
};

const receiptPill = (w) => {
  if (w.receiptStatus === 'RECEIVED') {
    return <span className="receipt-pill is-ok"><FiCheckCircle aria-hidden="true" /> أكد الاستلام</span>;
  }
  if (w.receiptStatus === 'NOT_RECEIVED') {
    return <span className="receipt-pill is-warn"><FiAlertTriangle aria-hidden="true" /> لم يستلم المبلغ</span>;
  }
  return <span className="receipt-pill is-wait"><FiClock aria-hidden="true" /> بانتظار تأكيد المستقل</span>;
};

export default function AdminWithdrawalsTab({
  withdrawalRequests,
  onPayout,
  onRejectWithdrawal,
  onOpenChat,
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">طلبات سحب أرباح المستقلين</h3>
            <p className="section-desc">
              حوّل المبلغ يدوياً عبر بنكك أو المحفظة، ثم اضغط «اعتماد وإرسال الإشعار» وأرفق صورة إشعار التحويل.
              يصل الإشعار إلى المستقل في المحادثات ليؤكد الاستلام.
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
                    <td className="font-bold text-success">{Number(w.amount || 0).toLocaleString('en-US')} ج.س</td>
                    <td>{paymentMethodLabel(w.method)}</td>
                    <td className="font-mono">{w.accountNumber}<br />{w.accountName}</td>
                    <td>{formatDate(w.createdAt)}</td>
                    <td>
                      <span className={`withdrawal-status-pill ${w.status.toLowerCase()}`}>
                        {STATUS_LABELS[w.status] || w.status}
                      </span>
                      {w.transactionReference && <div className="font-mono">{w.transactionReference}</div>}
                      {w.status === 'Paid' && <div className="receipt-pill-row">{receiptPill(w)}</div>}
                      {w.receiptNote && <div className="input-hint">{w.receiptNote}</div>}
                      {w.adminReason && <div className="input-hint">{w.adminReason}</div>}
                    </td>
                    <td>
                      {(w.status === 'Pending' || w.status === 'Approved') && (
                        <div className="table-action-btns">
                          <button type="button" className="btn-approve" onClick={() => onPayout(w)}>
                            <FiSend />
                            <span>اعتماد وإرسال الإشعار</span>
                          </button>
                          <button type="button" className="btn-reject" onClick={() => onRejectWithdrawal(w)}>
                            <FiX />
                            <span>رفض</span>
                          </button>
                        </div>
                      )}
                      {w.status === 'Paid' && (
                        <button type="button" className="btn-chat" onClick={() => onOpenChat(w.conversationId)}>
                          <FiMessageSquare />
                          <span>المحادثة</span>
                        </button>
                      )}
                      {w.status === 'Rejected' && (
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
