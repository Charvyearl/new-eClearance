const fetch = require('node-fetch');

async function testAuth() {
  const baseUrl = 'https://eclearance-production.up.railway.app';
  
  console.log('Testing debug endpoint...');
  
  try {
    // Test debug endpoint
    const debugResponse = await fetch(`${baseUrl}/debug/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    const debugData = await debugResponse.json();
    console.log('Debug endpoint response:', JSON.stringify(debugData, null, 2));
    
    // Test regular auth endpoint
    console.log('\nTesting regular auth endpoint...');
    const authResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    const authData = await authResponse.json();
    console.log('Auth endpoint response:', JSON.stringify(authData, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();
