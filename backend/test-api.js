const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Alumni Connect API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', health.data.message);

    // Test 2: Get users stats
    console.log('\n2️⃣ Testing user stats...');
    const stats = await axios.get(`${API_BASE}/users/stats`);
    console.log('✅ User stats:', stats.data.data);

    // Test 3: Get all users
    console.log('\n3️⃣ Testing get all users...');
    const users = await axios.get(`${API_BASE}/users`);
    console.log('✅ Users count:', users.data.data.users.length);

    // Test 4: Register a test user
    console.log('\n4️⃣ Testing user registration...');
    const testUser = {
      email: 'test@alumni.com',
      password: 'password123',
      name: 'Test User',
      graduation_year: 2020,
      degree: 'Computer Science',
      major: 'Software Engineering'
    };

    try {
      const register = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ Registration successful:', register.data.data.user.name);
      
      // Test 5: Login with the test user
      console.log('\n5️⃣ Testing user login...');
      const login = await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful:', login.data.data.user.name);
      
      const token = login.data.data.token;
      
      // Test 6: Get profile with token
      console.log('\n6️⃣ Testing get profile...');
      const profile = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile retrieved:', profile.data.data.user.name);
      
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, testing login...');
        
        const login = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Login successful:', login.data.data.user.name);
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All API tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
testAPI();
