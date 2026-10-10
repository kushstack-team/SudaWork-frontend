import { Link } from 'react-router-dom';
import { FiCheck, FiX, FiPaperclip } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminEscrowTab({
  paymentRequests,
  submittingPaymentAction,
  onApprovePayment,
  onSelectRejectPayment,
  onViewProof
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">تدقيق إثباتات الدفع اليدوي</h3>
            <p className="section-desc">طابق رقم العملية والمبلغ مع كشف الحساب، ثم اعتمد الدفعة لبدء العقد أو ارفضها مع ذكر السبب.</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>المشروع / العقد</th>
                <th>المبلغ المودع</th>
                <th>طريقة الدفع</th>
                <th>رقم العملية / المرجع</th>
                <th>تاريخ الإرسال</th>
                <th>الحالة</th>
                <th>الإجراء الإداري</th>
              </tr>
            </thead>
            <tbody>
              {paymentRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">لا توجد إثباتات دفع مسجلة</td>
                </tr>
              ) : (
                paymentRequests.map((pay) => (
                  <tr key={pay.id}>
                    <td>{pay.clientName}</td>
                    <td>
                      <Link to={`/contracts/${pay.contractId}`} className="table-link">
                        {pay.projectTitle}
                      </Link>
                    </td>
                    <td className="font-bold">
                      {Number(pay.amount || 0).toLocaleString()} ج.س
                      {pay.contractAmount && Number(pay.amount) < Number(pay.contractAmount) && (
                        <div className="input-hint">أقل من قيمة العقد ({Number(pay.contractAmount).toLocaleString()} ج.س)</div>
                      )}
                    </td>
                    <td>{pay.paymentMethod}</td>
                    <td className="font-mono text-primary">
                      {pay.transactionId}
                      {pay.proof && (
                        <div>
                          <button type="button" className="table-link" onClick={() => onViewProof(pay)}>
                            <FiPaperclip /> عرض الإشعار
                          </button>
                        </div>
                      )}
                    </td>
                    <td>{formatDate(pay.createdAt)}</td>
                    <td>
                      <span className={`payment-status-pill ${pay.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {pay.status === 'Pending Verification' && 'بانتظار التدقيق'}
                        {pay.status === 'Approved' && 'معتمد ومفعّل'}
                        {pay.status === 'Rejected' && 'مرفوض'}
                      </span>
                      {pay.rejectionReason && <div className="input-hint">{pay.rejectionReason}</div>}
                    </td>
                    <td>
                      {pay.status === 'Pending Verification' ? (
                        <div className="table-action-btns">
                          <button
                            type="button"
                            className="btn-approve"
                            disabled={submittingPaymentAction}
                            onClick={() => onApprovePayment(pay)}
                          >
                            <FiCheck />
                            <span>اعتماد وتفعيل</span>
                          </button>
                          <button
                            type="button"
                            className="btn-reject"
                            disabled={submittingPaymentAction}
                            onClick={() => onSelectRejectPayment(pay)}
                          >
                            <FiX />
                            <span>رفض</span>
                          </button>
                        </div>
                      ) : (
                        <span className="action-completed-text">مكتمل</span>
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
