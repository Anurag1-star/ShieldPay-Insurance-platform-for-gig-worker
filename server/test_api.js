import fetch from 'node-fetch';

async function testUpdate() {
  try {
    const loginRes = await fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token obtained:', token ? 'YES' : 'NO');

    const plansRes = await fetch('http://127.0.0.1:5000/api/plans');
    const plans = await plansRes.json();
    const plan = plans[0];
    console.log('Testing update on plan:', plan.name, '(_id:', plan._id, ')');

    const updateRes = await fetch(`http://127.0.0.1:5000/api/plans/${plan._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...plan,
        weeklyPremium: plan.weeklyPremium + 1
      })
    });

    console.log('Update Status:', updateRes.status);
    const updateData = await updateRes.json();
    console.log('Update Result:', JSON.stringify(updateData, null, 2));

  } catch (err) {
    console.error('Test failed:', err);
  }
}

testUpdate();
