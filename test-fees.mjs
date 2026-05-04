

async function testFees() {
  console.log('Logging in...');
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', password: 'Owner@2026' })
  }).then(r => r.json());
  
  const token = loginRes.data.accessToken;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('\n--- Generating Dues ---');
  const duesRes = await fetch('http://localhost:3001/api/v1/fees/dues/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ month: 5, year: 2026 })
  }).then(r => r.json());
  console.dir(duesRes, { depth: null });

  console.log('\n--- Fetching Dashboard ---');
  const dashRes = await fetch('http://localhost:3001/api/v1/fees/dashboard', { headers }).then(r => r.json());
  console.log('Total Dues:', dashRes.data?.kpis?.totalDues);
  console.log('Overdue Records Count:', dashRes.data?.kpis?.overdueRecordsCount);
  
  if (dashRes.data?.overdueList?.length > 0) {
    const overdue = dashRes.data.overdueList[0];
    console.log('\n--- Fetching Student Ledger for', overdue.studentName, '---');
    const ledgerRes = await fetch(`http://localhost:3001/api/v1/fees/student/${overdue.studentId}/ledger`, { headers }).then(r => r.json());
    
    const recordId = ledgerRes.data.records[0].id;
    const amountToPay = ledgerRes.data.records[0].balance;
    console.log(`Will pay ₹${amountToPay} for fee record ${recordId}`);

    console.log('\n--- Recording Payment ---');
    const payRes = await fetch('http://localhost:3001/api/v1/fees/payments', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        feeRecordId: recordId,
        amount: amountToPay,
        paymentMode: 'upi',
        referenceNo: 'UPI-TEST-123'
      })
    }).then(r => r.json());
    console.dir(payRes, { depth: null });

    const receiptNum = payRes.data?.receipt?.receiptNumber;
    if (receiptNum) {
      console.log('\n--- Fetching Receipt', receiptNum, '---');
      const recRes = await fetch(`http://localhost:3001/api/v1/fees/receipt/${receiptNum}`, { headers }).then(r => r.json());
      console.log('Receipt fetched successfully for', recRes.data?.payment?.feeRecord?.student?.user?.name);
    }
  } else {
    console.log('No overdue items found to test payment.');
  }
}

testFees().catch(console.error);
