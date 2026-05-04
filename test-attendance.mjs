

async function test() {
  console.log('Logging in...');
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', password: 'Owner@2026' })
  }).then(r => r.json());
  
  const token = loginRes.data.accessToken;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('Fetching batches...');
  const batches = await fetch('http://localhost:3001/api/v1/batches', { headers }).then(r => r.json());
  const batchId = batches.data[0].id;
  
  console.log('Fetching students for batch', batchId);
  const students = await fetch(`http://localhost:3001/api/v1/attendance/batch/${batchId}?date=2026-05-04`, { headers }).then(r => r.json());
  
  const userId = students.data.students[0].userId;
  
  console.log('Marking attendance for student', userId);
  const markRes = await fetch('http://localhost:3001/api/v1/attendance/mark', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      batchId,
      date: '2026-05-04',
      records: [{ studentId: userId, status: 'present' }]
    })
  }).then(r => r.json());
  console.dir(markRes, { depth: null });
  
  console.log('Fetching calendar...');
  const calRes = await fetch(`http://localhost:3001/api/v1/attendance/calendar/${batchId}?month=5&year=2026`, { headers }).then(r => r.json());
  console.dir(calRes, { depth: null });
}

test().catch(console.error);
