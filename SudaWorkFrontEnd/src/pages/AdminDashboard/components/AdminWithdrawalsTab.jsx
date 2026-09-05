import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminWithdrawalsTab({
  withdrawalRequests,
  onApproveWithdrawal,
  onRejectWithdrawal
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">طلبات سحب أرباح المستقلين</h3>
            <p className="section-desc">تنفيذ التحويلات البنكية للمستقلين عبر بنكك، فوري، أو زين كاش.</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>معرف المستقل</th>
                <th>المبلغ المطلوب</th>
                <th>طريقة السحب</th>
                <th>رقم الحساب / الهاتف</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>الإجراء الإداري</th>
              </tr>
            </thead>
            <tbody>
              {withdrawalRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">لا توجد طلبات سحب حالياً</td>
                </tr>
              ) : (
                withdrawalRequests.map((w) => (
                  <tr key={w.id}>
                    <td className="font-mono">#{w.id}</td>
                    <td>
                      <Link to={`/freelancers/${w.freelancerId}`} className="table-link">
                        {w.freelancerId}
                      </Link>
                    </td>
                    <td className="font-bold text-success">{(w.amount || 0).toLocaleString()} ج.س</td>
                    <td>{w.method || 'Bankak'}</td>
                    <td className="font-mono">{w.accountNumber || w.phoneNumber || '1892048'}</td>
                    <td>{formatDate(w.createdAt)}</td>
                    <td>
                      <span className={`withdrawal-status-pill ${w.status.toLowerCase()}`}>
                        {w.status === 'Pending' && 'قيد التنفيذ'}
                        {(w.status === 'Paid' || w.status === 'Completed') && 'تم التحويل بنجاح'}
                        {w.status === 'Rejected' && 'مرفوض'}
                      </span>
                    </td>
                    <td>
                      {w.status === 'Pending' ? (
                        <div className="table-action-btns">
                          <button
                            type="button"
                            className="btn-approve"
                            onClick={() => onApproveWithdrawal(w)}
                          >
                            <FiCheck />
                            <span>تم التحويل</span>
                          </button>
                          <button
                            type="button"
                            className="btn-reject"
                            onClick={() => onRejectWithdrawal(w)}
                          >
                            <FiX />
                            <span>رفض</span>
                          </button>
                        </div>
                      ) : (
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
