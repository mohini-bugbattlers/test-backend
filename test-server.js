const fs = require('fs');
const path = require('path');

console.log('🚀 Starting test server...');

// Write to a test file to verify the script is running
const testFile = path.join(__dirname, 'test-startup.txt');
fs.writeFileSync(testFile, `Server started at ${new Date().toISOString()}`);

console.log('✅ Test file created');
console.log('📍 Server should be running on port 3001');

// Keep the process alive
setInterval(() => {
  console.log('Server is alive...');
}, 5000);
