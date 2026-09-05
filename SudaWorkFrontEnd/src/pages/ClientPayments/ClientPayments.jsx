import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ClientPayments.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import receiptPlaceholder from '../../assets/dashboard/marketing_ads.jpg';
import { 
  FiShield, 
  FiDollarSign, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiPlus, 
  FiCreditCard, 
  FiX, 
  FiPaperclip, 
  FiExternalLink,
  FiTrendingUp,
  FiBriefcase,
  FiInfo
} from 'react-icons/fi';

const ClientPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('Bankak');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allPayments, userContracts, allProjects] = await Promise.all([
        mockApi.paymentRequests.getByClient(user.id),
        mockApi.contracts.getByUser(user.id),
        mockApi.projects.getAll(),
      ]);

      setPayments(allPayments);
      setContracts(userContracts);

      const pMap = {};
      allProjects.forEach((p) => {
        pMap[p.id] = p;
      });
      setProjectsMap(pMap);

      // If there are awaiting payment contracts, set first as default in modal
      const awaiting = userContracts.filter((c) => c.status === 'Awaiting Payment');
      if (awaiting.length > 0) {
        setSelectedContractId(awaiting[0].id);
        setDepositAmount(awaiting[0].agreedPrice);
      }
    } catch (err) {
      console.error('Failed to load client payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Contract selection in deposit modal
  const handleContractChange = (cId) => {
    setSelectedContractId(cId);
    const selected = contracts.find((c) => c.id === cId);
    if (selected) {
      setDepositAmount(selected.agreedPrice);
    }
  };

  // Submit Escrow Deposit
  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (!selectedContractId) {
      setActionError('يرجى اختيار العقد المراد تمويله.');
      return;
    }
    if (!depositAmount || Number(depositAmount) <= 0) {
      setActionError('يرجى إدخال مبلغ إيداع صالح.');
      return;
    }

    setSubmittingDeposit(true);
    setActionError('');
    try {
      const newPay = await mockApi.paymentRequests.create({
        contractId: selectedContractId,
        clientId: user.id,
        amount: Number(depositAmount),
        method: depositMethod,
        transactionId: transactionId.trim() || `BNK-${Date.now().toString().slice(-6)}`,
        screenshot: receiptFile ? receiptPlaceholder : '',
      });

      // Automatically approve and activate contract for smooth local testing flow
      await mockApi.paymentRequests.updateStatus(newPay.id, 'Approved');

      setIsDepositModalOpen(false);
      setTransactionId('');
      setReceiptFile('');
      setActionSuccess('تم إيداع الدفعة بنجاح وتفعيل عقد العمل في الضمان!');
      setTimeout(() => setActionSuccess(''), 5000);
      loadData();
    } catch (err) {
      console.error('Failed to submit escrow deposit:', err);
      setActionError(err.message || 'فشل توثيق الإيداع، يرجى المحاولة ثانية.');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Calculations
  const totalDeposited = payments
    .filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const activeEscrowAmount = contracts
    .filter((c) => c.status === 'Active' || c.status === 'Submitted')
    .reduce((sum, c) => sum + Number(c.agreedPrice || 0), 0);

  const releasedEscrowAmount = contracts
    .filter((c) => c.status === 'Completed')
    .reduce((sum, c) => sum + Number(c.agreedPrice || 0), 0);

  const awaitingContracts = contracts.filter((c) => c.status === 'Awaiting Payment');

  return (
    <div className="client-payments-page" dir="rtl">
      <DashboardNavbar />

      <main className="client-payments-main">
        <div className="payments-container">

          {/* Header */}
          <div className="payments-header">
            <div>
              <h1 className="payments-title">الضمان المالي والمدفوعات (Escrow)</h1>
              <p className="payments-desc">
                إيداع مبالغ العقود بأمان عبر بنكك، ومتابعة حماية أموالك حتى استلام العمل واعتماده.
              </p>
            </div>

            <button
              type="button"
              className="new-deposit-btn"
              onClick={() => setIsDepositModalOpen(true)}
            >
              <FiPlus />
              <span>إيداع دفعة جديدة في الضمان</span>
            </button>
          </div>

          {/* Success / Error Alerts */}
          {actionSuccess && (
            <div className="payment-alert success" role="alert">
              <FiCheckCircle className="alert-icon" />
              <span>{actionSuccess}</span>
            </div>
          )}
          {actionError && (
            <div className="payment-alert error" role="alert">
              <FiAlertCircle className="alert-icon" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Escrow Stats Cards */}
          <div className="payments-stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap primary">
                <FiShield />
              </div>
              <div>
                <span className="stat-label">الضمان المالي النشط (المحمي)</span>
                <h3 className="stat-val active">{activeEscrowAmount.toLocaleString()} ج.س</h3>
                <span className="stat-hint">محتجز بأمان حتى إكمال المشاريع</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap success">
                <FiCheckCircle />
              </div>
              <div>
                <span className="stat-label">مستحقات تم تحريرها للمستقلين</span>
                <h3 className="stat-val released">{releasedEscrowAmount.toLocaleString()} ج.س</h3>
                <span className="stat-hint">مشاريع مكتملة ومغلقة</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap neutral">
                <FiDollarSign />
              </div>
              <div>
                <span className="stat-label">إجمالي المودع في الضمان</span>
                <h3 className="stat-val">{totalDeposited.toLocaleString()} ج.س</h3>
                <span className="stat-hint">عبر تطبيق بنكك والتحويل المصرفي</span>
              </div>
            </div>
          </div>

          {/* Sudanese Escrow Official Rails Info Card */}
          <div className="escrow-rail-card">
            <div className="rail-header">
              <div className="rail-title-group">
                <div className="rail-badge">
                  <FiShield />
                  <span>حساب الضمان الرسمي المعتمد</span>
                </div>
                <h3>بيانات الإيداع المصرفي لمنصة سوداوورك</h3>
              </div>
              <span className="rail-tag">بنكك (بنك الخرطوم)</span>
            </div>

            <div className="rail-body-grid">
              <div className="rail-info-box">
                <span className="info-title">اسم الحساب الرسمي:</span>
                <strong className="info-data">منصة سوداوورك لخدمات العمل الحر</strong>
              </div>
              <div className="rail-info-box">
                <span className="info-title">رقم الحساب المصرفي (بنكك):</span>
                <strong className="info-data highlight">1892048</strong>
              </div>
              <div className="rail-info-box">
                <span className="info-title">رقم التحويل السريع عبر الهاتف:</span>
                <strong className="info-data highlight">0912345678</strong>
              </div>
              <div className="rail-info-box">
                <span className="info-title">نسبة حماية المشتري:</span>
                <strong className="info-data safe">100% ضمان استرداد</strong>
              </div>
            </div>

            <div className="rail-notes-box">
              <FiInfo className="info-icon" />
              <p>
                <strong>كيف يعمل الضمان (Escrow)؟</strong> عند إيداع قيمة العقد، تظل أموالك في حساب الضمان التابع للمنصة. لن يتم تحويل أي مبالغ للمستقل إلا بعد أن يقوم بتسليم العمل وتضغط أنت على زر "قبول العمل والاعتماد".
              </p>
            </div>
          </div>

          {/* Pending Contracts Action Strip */}
          {awaitingContracts.length > 0 && (
            <div className="awaiting-contracts-notice">
              <FiClock className="clock-icon" />
              <div className="notice-text">
                <h4>لديك {awaitingContracts.length} عقد عمل بانتظار سداد الضمان المالي</h4>
                <p>قم بإيداع قيمة العقد لتمكين المستقل من بدء العمل مباشرة.</p>
              </div>
              <button
                type="button"
                className="fund-now-btn"
                onClick={() => {
                  setSelectedContractId(awaitingContracts[0].id);
                  setDepositAmount(awaitingContracts[0].agreedPrice);
                  setIsDepositModalOpen(true);
                }}
              >
                سداد الضمان الآن
              </button>
            </div>
          )}

          {/* Transactions History Table */}
          <div className="transactions-card">
            <div className="transactions-header">
              <h2>سجل إيداعات الضمان المالي</h2>
              <span className="transactions-count">{payments.length} عمليات</span>
            </div>

            {loading ? (
              <div className="payments-loading">
                <div className="profile-spinner" />
                <p>جارٍ تحميل سجل المدفوعات...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="no-payments-box">
                <FiDollarSign className="empty-dollar-icon" />
                <h3>لا توجد عمليات إيداع مسجلة بعد</h3>
                <p>عند قبول عرض عمل وإنشاء عقد، ستظهر كافة عمليات الضمان المالي هنا.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>رقم العملية</th>
                      <th>المشروع / العقد</th>
                      <th>طريقة السداد</th>
                      <th>المبلغ</th>
                      <th>تاريخ الإيداع</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const contract = contracts.find((c) => c.id === p.contractId);
                      const project = contract ? projectsMap[contract.projectId] : null;

                      return (
                        <tr key={p.id}>
                          <td>
                            <span className="tx-id-badge">{p.transactionId || p.id}</span>
                          </td>
                          <td>
                            {project ? (
                              <Link to={`/contracts/${p.contractId}`} className="table-contract-link">
                                {project.title}
                              </Link>
                            ) : (
                              <span>عقد #{p.contractId}</span>
                            )}
                          </td>
                          <td>
                            <span className="method-tag">
                              {p.method === 'Bankak' ? 'بنكك (بنك الخرطوم)' : p.method}
                            </span>
                          </td>
                          <td>
                            <strong className="table-amount">{Number(p.amount).toLocaleString()} ج.س</strong>
                          </td>
                          <td>
                            <span className="table-date">
                              {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge status-${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {p.status === 'Approved' && 'معتمد ونشط بالضمان'}
                              {p.status === 'Pending Verification' && 'قيد المراجعة'}
                              {p.status === 'Rejected' && 'مرفوض'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Escrow Deposit Modal */}
      {isDepositModalOpen && (
        <div className="escrow-modal-backdrop" onClick={() => !submittingDeposit && setIsDepositModalOpen(false)}>
          <div className="escrow-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>إيداع الضمان المالي (Escrow Deposit)</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsDepositModalOpen(false)}
                disabled={submittingDeposit}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitDeposit} className="escrow-form">
              <div className="form-group">
                <label className="form-label" htmlFor="contract-select">
                  عقد العمل المراد تمويله <span className="required">*</span>
                </label>
                <select
                  id="contract-select"
                  className="modal-select"
                  value={selectedContractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  required
                >
                  <option value="">-- اختر العقد --</option>
                  {contracts.map((c) => {
                    const p = projectsMap[c.projectId];
                    return (
                      <option key={c.id} value={c.id}>
                        {p?.title || c.id} (قيمة: {Number(c.agreedPrice).toLocaleString()} ج.س - {c.status})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="deposit-amount">
                  المبلغ المودع في الضمان (بالجنيه السوداني) <span className="required">*</span>
                </label>
                <input
                  id="deposit-amount"
                  type="number"
                  min="1000"
                  step="1000"
                  className="modal-input"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">طريقة الإيداع</label>
                <div className="payment-method-radios">
                  <label className={`radio-pill ${depositMethod === 'Bankak' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="depositMethod"
                      value="Bankak"
                      checked={depositMethod === 'Bankak'}
                      onChange={(e) => setDepositMethod(e.target.value)}
                    />
                    <span>بنكك (تطبيق بنك الخرطوم)</span>
                  </label>
                  <label className={`radio-pill ${depositMethod === 'Bank Transfer' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="depositMethod"
                      value="Bank Transfer"
                      checked={depositMethod === 'Bank Transfer'}
                      onChange={(e) => setDepositMethod(e.target.value)}
                    />
                    <span>تحويل بنكي مباشر</span>
                  </label>
                  <label className={`radio-pill ${depositMethod === 'Zain Cash' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="depositMethod"
                      value="Zain Cash"
                      checked={depositMethod === 'Zain Cash'}
                      onChange={(e) => setDepositMethod(e.target.value)}
                    />
                    <span>زين كاش / MTN</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-id">
                  رقم العملية أو إشعار التحويل (Transaction ID)
                </label>
                <input
                  id="tx-id"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: BNK-983421092"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="receipt-input">
                  إشعار التحويل أو لقطة الشاشة
                </label>
                <input
                  id="receipt-input"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: Bankak_Receipt_2026.jpg"
                  value={receiptFile}
                  onChange={(e) => setReceiptFile(e.target.value)}
                />
              </div>

              <div className="modal-actions-strip">
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={submittingDeposit}
                >
                  <FiShield />
                  <span>{submittingDeposit ? 'جارٍ التوثيق والإيداع...' : 'تأكيد الإيداع وتفعيل الضمان'}</span>
                </button>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  disabled={submittingDeposit}
                  onClick={() => setIsDepositModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ClientPayments;
