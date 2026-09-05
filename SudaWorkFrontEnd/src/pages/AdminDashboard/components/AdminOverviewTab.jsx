import React from 'react';
import { FiClock, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';

export default function AdminOverviewTab({
  pendingPaymentsCount,
  pendingWithdrawalsCount,
  openDisputesCount,
  onRefresh,
  onNavigateTab
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">طابور المهام والعمليات العاجلة</h3>
            <p className="section-desc">المعاملات التي تتطلب تدخل أو تدقيق مباشر من إدارة المنصة.</p>
          </div>
          <button type="button" className="refresh-btn" onClick={onRefresh}>
            تحديث البيانات
          </button>
        </div>

        <div className="urgent-tasks-stack">
          {/* Item 1: Pending Escrow Payments */}
          <div className="urgent-task-item">
            <div className="task-icon-box warning">
              <FiClock />
            </div>
            <div className="task-info">
              <h4>إيداعات بنكك بانتظار المراجعة والاعتماد</h4>
              <p>يوجد <strong>{pendingPaymentsCount}</strong> عملية إيداع ضمان بنكي معلقة بحاجة لمطابقة إشعار التحويل.</p>
            </div>
            <button
              type="button"
              className="task-action-btn"
              onClick={() => onNavigateTab('escrow')}
            >
              مراجعة الإيداعات &larr;
            </button>
          </div>

          {/* Item 2: Pending Withdrawals */}
          <div className="urgent-task-item">
            <div className="task-icon-box payment">
              <FiDollarSign />
            </div>
            <div className="task-info">
              <h4>طلبات سحب أرباح المستقلين</h4>
              <p>يوجد <strong>{pendingWithdrawalsCount}</strong> طلب سحب أرباح معلق بحاجة للتحويل عبر بنكك أو زين كاش.</p>
            </div>
            <button
              type="button"
              className="task-action-btn"
              onClick={() => onNavigateTab('withdrawals')}
            >
              معالجة طلبات السحب &larr;
            </button>
          </div>

          {/* Item 3: Open Disputes */}
          <div className="urgent-task-item">
            <div className="task-icon-box dispute">
              <FiAlertTriangle />
            </div>
            <div className="task-info">
              <h4>نزاعات وبلاغات تتطلب التحكيم والوساطة</h4>
              <p>يوجد <strong>{openDisputesCount}</strong> نزاع تعاقدي مفتوح بانتظار قرار لجنة التحكيم المستقلة.</p>
            </div>
            <button
              type="button"
              className="task-action-btn"
              onClick={() => onNavigateTab('disputes')}
            >
              إدارة قضايا التحكيم &larr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
