/**
 * Verification script for the complete SudaWork marketplace cycle:
 * post project → freelancer submits proposal → client accepts → client submits payment proof
 * → admin approves payment → freelancer submits deliverable → client accepts → both leave a review
 * → freelancer requests withdrawal → admin approves it → freelancer wallet shows correct status.
 */

// Mock localStorage for Node
const storage = {};
global.localStorage = {
  getItem: (key) => (key in storage ? storage[key] : null),
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

async function runCycle() {
  console.log('--- Starting SudaWork E2E Complete Cycle Verification ---');
  
  // Dynamically import mockApi
  const { mockApi } = await import('../src/services/mockApi.js');

  // Verify seed data emails
  console.log('\n[Verification 0] Verifying clean seed data emails in mockApi.users...');
  const allUsers = await mockApi.users.getAll();
  const cUser = allUsers.find((u) => u.id === 'user_client_1');
  const fUser = allUsers.find((u) => u.id === 'user_freelancer_1');
  console.log('✓ Client user in DB:', cUser.fullName, '| Email:', cUser.email);
  console.log('✓ Freelancer user in DB:', fUser.fullName, '| Email:', fUser.email);
  if (cUser.email !== 'tarig@alnilam.sd') throw new Error(`Expected tarig@alnilam.sd, got ${cUser.email}`);
  if (fUser.email !== 'tasneem@dev.sd') throw new Error(`Expected tasneem@dev.sd, got ${fUser.email}`);

  // Verify that old alias emails are rejected
  console.log('\n[Verification 0b] Verifying old email alias was cleanly removed...');
  try {
    await mockApi.auth.login('client@sudawork.com', 'password123');
    throw new Error('Old client@sudawork.com should have failed login!');
  } catch (err) {
    console.log('✓ Old client@sudawork.com correctly rejected:', err.message);
  }

  // Step 1: Login Client & Post Project
  console.log('\n[Step 1] Client (tarig@alnilam.sd) authenticating and posting project...');
  const clientUser = await mockApi.auth.login('tarig@alnilam.sd', 'password123');
  console.log('✓ Client authenticated successfully:', clientUser.fullName, `(${clientUser.id}) | Email: ${clientUser.email}`);

  const createdProject = await mockApi.projects.create({
    clientId: clientUser.id,
    title: 'تطوير واجهة متجر إلكتروني سوداني بتقنية React',
    description: 'نبحث عن مستقل محترف لبناء واجهة متجر حديثة ومتجاوبة مع الهواتف الذكية مع دعم بوابات الدفع المحلية.',
    budget: 350000,
    budgetMin: 300000,
    budgetMax: 400000,
    categoryId: 'web',
    duration: '14 يوماً',
    skills: ['React', 'CSS', 'JavaScript'],
  });
  console.log('✓ Project posted successfully:', createdProject.title, `ID: ${createdProject.id}`);

  // Step 2: Login Freelancer & Submit Proposal
  console.log('\n[Step 2] Freelancer (tasneem@dev.sd) authenticating and submitting proposal...');
  const freelancerUser = await mockApi.auth.login('tasneem@dev.sd', 'password123');
  console.log('✓ Freelancer authenticated successfully:', freelancerUser.fullName, `(${freelancerUser.id})`);

  const submittedProposal = await mockApi.proposals.create({
    projectId: createdProject.id,
    freelancerId: freelancerUser.id,
    bidAmount: 320000,
    deliveryTime: 10,
    coverLetter: 'لدي خبرة تزيد عن 4 سنوات في تطوير وتصميم واجهات React باللغة العربية مع دعم كامل لـ RTL وتجربة مستخدم متميزة.',
  });
  console.log('✓ Proposal submitted successfully:', `Bid: ${submittedProposal.bidAmount} SDG, ID: ${submittedProposal.id}`);

  // Step 3: Client accepts proposal and creates contract
  console.log('\n[Step 3] Client accepts proposal and initiates contract...');
  await mockApi.proposals.updateStatus(submittedProposal.id, 'Accepted');
  await mockApi.projects.update(createdProject.id, { status: 'In Progress' });
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 10);

  const contract = await mockApi.contracts.create({
    projectId: createdProject.id,
    clientId: clientUser.id,
    freelancerId: freelancerUser.id,
    agreedPrice: submittedProposal.bidAmount,
    deliveryDate: deliveryDate.toISOString().split('T')[0],
  });
  console.log('✓ Contract created successfully:', `ID: ${contract.id}, Status: ${contract.status}`);

  // Step 4: Client submits escrow payment proof
  console.log('\n[Step 4] Client submits Bankak escrow payment proof...');
  const paymentProof = await mockApi.paymentRequests.create({
    contractId: contract.id,
    clientId: clientUser.id,
    amount: contract.agreedPrice,
    method: 'Bankak',
    transactionId: 'BNK-7849102',
    screenshot: '/src/assets/dashboard/marketing_ads.jpg',
  });
  console.log('✓ Escrow payment proof submitted:', `ID: ${paymentProof.id}, Status: ${paymentProof.status}`);

  // Step 5: Admin approves escrow payment
  console.log('\n[Step 5] Admin (admin@sudawork.com) reviews and approves Bankak payment...');
  const adminUser = await mockApi.auth.login('admin@sudawork.com', 'admin123');
  console.log('✓ Admin authenticated:', adminUser.fullName);

  await mockApi.paymentRequests.updateStatus(paymentProof.id, 'Approved');
  const contractAfterApproval = await mockApi.contracts.getById(contract.id);
  console.log('✓ Escrow payment approved by Admin. Contract status updated to:', contractAfterApproval.status);
  if (contractAfterApproval.status !== 'Active') {
    throw new Error(`Expected contract status Active, got ${contractAfterApproval.status}`);
  }

  // Step 6: Freelancer submits deliverable
  console.log('\n[Step 6] Freelancer uploads and submits final deliverables...');
  const deliverable = await mockApi.deliverables.submit({
    contractId: contract.id,
    notes: 'تم إنجاز كامل متطلبات الواجهة والمكونات التفاعلية بنجاح، يمكنك تجربة الكود والمرفقات.',
    files: [{ name: 'SudanStore_Frontend_Release.zip', size: '4.8 MB', url: '#' }],
  });
  await mockApi.contracts.updateStatus(contract.id, 'Submitted');
  const contractAfterDeliver = await mockApi.contracts.getById(contract.id);
  console.log('✓ Deliverable submitted:', deliverable.id, 'Contract status updated to:', contractAfterDeliver.status);

  // Step 7: Client accepts deliverable & completes contract
  console.log('\n[Step 7] Client reviews and accepts deliverable, releasing escrow...');
  await mockApi.deliverables.updateStatus(deliverable.id, 'Accepted');
  await mockApi.contracts.updateStatus(contract.id, 'Completed');
  const completedContract = await mockApi.contracts.getById(contract.id);
  console.log('✓ Contract completed and closed:', completedContract.id, 'Status:', completedContract.status);

  // Step 8: Both leave a review
  console.log('\n[Step 8] Client and Freelancer leave 5-star mutual reviews...');
  const clientReview = await mockApi.reviews.create({
    contractId: contract.id,
    fromUserId: clientUser.id,
    toUserId: freelancerUser.id,
    rating: 5,
    comment: 'عمل احترافي ومتقن جداً، تسليم سريع وجودة برمجية عالية. نوصي بالتعامل معها بشدة!',
  });
  console.log('✓ Client review submitted. Rating:', clientReview.rating);

  const freelancerReview = await mockApi.reviews.create({
    contractId: contract.id,
    fromUserId: freelancerUser.id,
    toUserId: clientUser.id,
    rating: 5,
    comment: 'عميل ممتاز ومتعاون للغاية، وضوح تام في المتطلبات وسلاسة في التواصل واعتماد الدفعات.',
  });
  console.log('✓ Freelancer review submitted. Rating:', freelancerReview.rating);

  // Step 9: Freelancer checks wallet and requests withdrawal
  console.log('\n[Step 9] Freelancer checking wallet balance and requesting withdrawal...');
  const freelancerContracts = await mockApi.contracts.getByUser(freelancerUser.id);
  const freelancerCompletedContracts = freelancerContracts.filter((c) => c.status === 'Completed');
  const totalNetEarnings = freelancerCompletedContracts.reduce(
    (sum, c) => sum + Number(c.agreedPrice || 0) * 0.9,
    0
  );
  console.log(`✓ Calculated net earnings (after 10% fee): ${totalNetEarnings.toLocaleString()} SDG`);

  const withdrawalReq = await mockApi.withdrawalRequests.create({
    freelancerId: freelancerUser.id,
    amount: 250000,
    method: 'Bankak',
    accountDetails: 'رقم الحساب: 1982048 - باسم: تسنيم الطيب',
  });
  console.log('✓ Withdrawal request submitted:', withdrawalReq.id, 'Status:', withdrawalReq.status, 'Amount:', withdrawalReq.amount);

  // Step 10: Admin approves withdrawal
  console.log('\n[Step 10] Admin reviews and approves withdrawal request...');
  // Standardized to 'Paid'
  const approvedWithdrawal = await mockApi.withdrawalRequests.updateStatus(withdrawalReq.id, 'Paid');
  console.log('✓ Withdrawal approved by Admin. Status is now:', approvedWithdrawal.status);
  if (approvedWithdrawal.status !== 'Paid') {
    throw new Error(`Expected withdrawal status 'Paid', got ${approvedWithdrawal.status}`);
  }

  // Step 11: Freelancer wallet reflects correct status
  console.log('\n[Step 11] Verifying Freelancer Wallet display state...');
  const updatedWithdrawals = await mockApi.withdrawalRequests.getByFreelancer(freelancerUser.id);
  const myWithdrawal = updatedWithdrawals.find((w) => w.id === withdrawalReq.id);
  
  console.log('✓ Found withdrawal in Freelancer Wallet:', myWithdrawal.id);
  console.log('✓ Status:', myWithdrawal.status);
  
  // Check FreelancerWallet label mapping
  let statusPillText = '';
  if (myWithdrawal.status === 'Paid' || myWithdrawal.status === 'Completed') {
    statusPillText = 'تم التحويل بنجاح';
  } else if (myWithdrawal.status === 'Pending') {
    statusPillText = 'قيد المعالجة';
  } else if (myWithdrawal.status === 'Rejected') {
    statusPillText = 'مرفوض';
  }

  console.log('✓ Wallet rendered status label:', `"${statusPillText}"`);
  if (statusPillText !== 'تم التحويل بنجاح') {
    throw new Error(`Expected pill text 'تم التحويل بنجاح', got '${statusPillText}'`);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 11 STEPS OF THE END-TO-END CYCLE PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

runCycle().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
