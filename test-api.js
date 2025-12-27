// Quick API Test Script
// Run this in your terminal to test your backend: node test-api.js

const API_BASE_URL = 'http://72.62.72.1:5000/api';

console.log('Testing API Connection...');
console.log('API URL:', API_BASE_URL);
console.log('');

// Test Login
async function testLogin() {
  console.log('1️⃣ Testing Login Endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    console.log('');
  }
}

// Test Register
async function testRegister() {
  console.log('2️⃣ Testing Register Endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ Register test failed:', error.message);
    console.log('');
  }
}

// Run tests
(async () => {
  await testRegister();
  await testLogin();
})();
