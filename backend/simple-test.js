const http = require('http');

console.log('🧪 Testing health endpoint...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response:', JSON.parse(data));
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timeout');
  req.destroy();
  process.exit(1);
});

req.setTimeout(5000);
req.end();
