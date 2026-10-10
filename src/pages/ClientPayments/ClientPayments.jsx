import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ClientPayments.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import FilePicker from '../../components/FilePicker/FilePicker';
import {
  FiShield,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiX,
  FiInfo
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const ClientPayments = () => {
  const { user } = useAuth();
  const { settings } = usePlatform();
  const instructions = settings?.payment_instructions || {};
  const hasInstructions = Boolean(instructions.accountNumber || instructions.phone || instructions.notes);

  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [depositMethod, setDepositMethod] = useState('Bankak');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [modalError, setModalError] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const loadData = async () => {
    try {
      const [myPayments, myContracts] = await Promise.all([api.payments.mine(), api.contracts.list()]);
      setPayments(myPayments);
      setContracts(myContracts);
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadData, [user?.id], Boolean(user));

  // Contracts that still need a payment from this client.
  const payableContracts = contracts.filter(
    (c) => c.status === 'Awaiting Payment' && c.paymentStatus !== 'Pending Verification'
  );
  const selectedContract = contracts.find((c) => c.id === selectedContractId);

  const openDepositModal = (contractId) => {
    setSelectedContractId(contractId || payableContracts[0]?.id || '');
    setTransactionId('');
    setReceiptFiles([]);
    setModalError('');
    setIsDepositModalOpen(true);
  };

  // Submit payment evidence; the admin verifies it before the contract starts.
  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (!selectedContract) {
      setModalError('يرجى اختيار العقد المراد سداده.');
      return;
    }
    if (transactionId.trim().length < 3) {
      setModalError('يرجى إدخال رقم العملية أو الإشعار كما يظهر في تطبيق البنك.');
      return;
    }
    if (receiptFiles.some((r) => r.status === 'uploading')) return;

    setSubmittingDeposit(true);
    setModalError('');
    try {
      const body = {
        amount: selectedContract.agreedPrice,
        paymentMethod: depositMethod,
        transactionReference: transactionId.trim(),
        proofFileId: receiptFiles.find((r) => r.upload)?.upload.id,
      };
      const previous = payments.find((p) => p.contractId === selectedContract.id);
      if (previous?.rawStatus === 'REJECTED') {
        await api.payments.resubmit(previous.id, body);
      } else {
        await api.contracts.submitPayment(selectedContract.id, body);
      }

      setIsDepositModalOpen(false);
      setActionSuccess('تم إرسال إثبات الدفع بنجاح. سيبدأ العقد فور تحقق الإدارة من التحويل.');
      setTimeout(() => setActionSuccess(''), 6000);
      loadData();
    } catch (err) {
      setModalError(err.message || 'تعذر إرسال إثبات الدفع، يرجى المحاولة ثانية.');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Calculations
  const totalDeposited = payments
    .filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const activeEscrowAmount = contracts
    .filter((c) => ['Active', 'Submitted', 'Revision Requested'].includes(c.status))
    .reduce((sum, c) => sum + Number(c.agreedPrice || 0), 0);

  const releasedEscrowAmount = contracts
    .filter((c) => c.status === 'Completed')
    .reduce((sum, c) => sum + Number(c.agreedPrice || 0), 0);

  const awaitingContracts = payableContracts;

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

            {payableContracts.length > 0 && (
              <button
                type="button"
                className="new-deposit-btn"
                onClick={() => openDepositModal()}
              >
                <FiPlus />
                <span>إرسال إثبات دفع</span>
              </button>
            )}
          </div>

          {/* Success / Error Alerts */}
          {actionSuccess && (
            <div className="payment-alert success" role="alert">
              <FiCheckCircle className="alert-icon" />
              <span>{actionSuccess}</span>
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
              {instructions.bankName && <span className="rail-tag">{instructions.bankName}</span>}
            </div>

            <div className="rail-body-grid">
              {hasInstructions ? (
                <>
                  {instructions.accountName && (
                    <div className="rail-info-box">
                      <span className="info-title">اسم الحساب:</span>
                      <strong className="info-data">{instructions.accountName}</strong>
                    </div>
                  )}
                  {instructions.accountNumber && (
                    <div className="rail-info-box">
                      <span className="info-title">رقم الحساب:</span>
                      <strong className="info-data highlight">{instructions.accountNumber}</strong>
                    </div>
                  )}
                  {instructions.phone && (
                    <div className="rail-info-box">
                      <span className="info-title">رقم التحويل عبر الهاتف:</span>
                      <strong className="info-data highlight">{instructions.phone}</strong>
                    </div>
                  )}
                  <div className="rail-info-box">
                    <span className="info-title">طريقة التحقق:</span>
                    <strong className="info-data safe">مراجعة يدوية من إدارة المنصة</strong>
                  </div>
                </>
              ) : (
                <div className="rail-info-box">
                  <span className="info-title">بيانات الحساب:</span>
                  <strong className="info-data">لم تُنشر بعد. يرجى التواصل مع إدارة المنصة قبل التحويل.</strong>
                </div>
              )}
            </div>

            {instructions.notes && (
              <div className="rail-notes-box">
                <FiInfo className="info-icon" />
                <p>{instructions.notes}</p>
              </div>
            )}

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
                onClick={() => openDepositModal(awaitingContracts[0].id)}
              >
                إرسال إثبات الدفع
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
            ) : loadError ? (
              <ErrorState title="تعذر تحميل سجل المدفوعات" error={loadError} onRetry={() => { setLoading(true); loadData(); }} />
            ) : payments.length === 0 ? (
              <div className="no-payments-box">
                <FiDollarSign className="empty-dollar-icon" />
                <h3>لم ترسل أي إثبات دفع بعد</h3>
                <p>
                  {awaitingContracts.length > 0
                    ? 'لديك عقد بانتظار الدفع. حوّل قيمة العقد إلى حساب المنصة ثم أرسل إثبات الدفع ليبدأ العمل.'
                    : 'عند قبول عرض مستقل وإنشاء عقد، ستحوّل قيمته إلى حساب المنصة وترسل إثبات الدفع من هنا.'}
                </p>
                {awaitingContracts.length > 0 ? (
                  <button type="button" className="fund-now-btn" onClick={() => openDepositModal(awaitingContracts[0].id)}>
                    إرسال إثبات الدفع
                  </button>
                ) : (
                  <Link to="/client/projects" className="fund-now-btn">عرض مشاريعي</Link>
                )}
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
                      const canResubmit = p.rawStatus === 'REJECTED' && contract?.status === 'Awaiting Payment'
                        && payments.find((x) => x.contractId === p.contractId)?.id === p.id;

                      return (
                        <tr key={p.id}>
                          <td>
                            <span className="tx-id-badge">{p.transactionId || p.id}</span>
                          </td>
                          <td>
                            <Link to={`/contracts/${p.contractId}`} className="table-contract-link">
                              {p.projectTitle}
                            </Link>
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
                            {p.rejectionReason && <div className="table-date">السبب: {p.rejectionReason}</div>}
                            {canResubmit && (
                              <button type="button" className="table-contract-link" onClick={() => openDepositModal(p.contractId)}>
                                إعادة الإرسال
                              </button>
                            )}
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
              <h3>إرسال إثبات الدفع</h3>
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
              {modalError && (
                <div className="payment-alert error" role="alert">
                  <FiAlertCircle className="alert-icon" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="contract-select">
                  العقد المراد سداده <span className="required">*</span>
                </label>
                <select
                  id="contract-select"
                  className="modal-select"
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  required
                >
                  <option value="">-- اختر العقد --</option>
                  {payableContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.projectTitle} (قيمة: {Number(c.agreedPrice).toLocaleString()} ج.س)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">المبلغ المطلوب تحويله</label>
                <div className="modal-input" aria-readonly="true">
                  {selectedContract ? `${Number(selectedContract.agreedPrice).toLocaleString()} ج.س` : '—'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">طريقة الإيداع</label>
                <div className="payment-method-radios">
                  {[
                    ['Bankak', 'بنكك (تطبيق بنك الخرطوم)'],
                    ['Bank Transfer', 'تحويل بنكي مباشر'],
                    ['Zain Cash', 'زين كاش'],
                    ['MTN Cash', 'MTN كاش'],
                  ].map(([value, text]) => (
                    <label key={value} className={`radio-pill ${depositMethod === value ? 'checked' : ''}`}>
                      <input
                        type="radio"
                        name="depositMethod"
                        value={value}
                        checked={depositMethod === value}
                        onChange={(e) => setDepositMethod(e.target.value)}
                      />
                      <span>{text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-id">
                  رقم العملية أو إشعار التحويل (Transaction ID) <span className="required">*</span>
                </label>
                <input
                  id="tx-id"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: BNK-983421092"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="receipt-input">
                  صورة إشعار التحويل (يُسرّع التحقق)
                </label>
                <FilePicker
                  id="receipt-input"
                  purpose="payment_proof"
                  accept=".png,.jpg,.jpeg,.pdf"
                  files={receiptFiles}
                  onChange={setReceiptFiles}
                  disabled={submittingDeposit}
                />
              </div>

              <div className="modal-actions-strip">
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={submittingDeposit || receiptFiles.some((r) => r.status === 'uploading')}
                >
                  <FiShield />
                  <span>{submittingDeposit ? 'جارٍ الإرسال...' : 'إرسال إثبات الدفع للمراجعة'}</span>
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
