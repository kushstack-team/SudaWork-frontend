import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminEscrowTab({
  paymentRequests,
  submittingPaymentAction,
  onApprovePayment,
  onSelectRejectPayment
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">تدقيق وتوثيق إيداعات الضمان البنكية (Bankak Escrow)</h3>
            <p className="section-desc">مراجعة أرقام المعاملات عبر بنكك وإشعار التحويل لاعتماد تفعيل العقود.</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>معرف الدفعة</th>
                <th>رقم العقد</th>
                <th>المبلغ المودع</th>
                <th>طريقة الدفع</th>
                <th>رقم العملية / المرجع</th>
                <th>تاريخ الإيداع</th>
                <th>الحالة</th>
                <th>الإجراء الإداري</th>
              </tr>
            </thead>
            <tbody>
              {paymentRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">لا توجد طلبات إيداع مسجلة</td>
                </tr>
              ) : (
                paymentRequests.map((pay) => (
                  <tr key={pay.id}>
                    <td className="font-mono">#{pay.id}</td>
                    <td>
                      <Link to={`/contracts/${pay.contractId}`} className="table-link">
                        #{pay.contractId}
                      </Link>
                    </td>
                    <td className="font-bold">{(pay.amount || 0).toLocaleString()} ج.س</td>
                    <td>{pay.paymentMethod || 'Bankak'}</td>
                    <td className="font-mono text-primary">{pay.transactionId || '---'}</td>
                    <td>{formatDate(pay.createdAt)}</td>
                    <td>
                      <span className={`payment-status-pill ${pay.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {pay.status === 'Pending Verification' && 'بانتظار التدقيق'}
                        {pay.status === 'Approved' && 'معتمد ومفعّل'}
                        {pay.status === 'Rejected' && 'مرفوض'}
                      </span>
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
