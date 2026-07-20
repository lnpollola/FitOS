const { execSync } = require('child_process');
const path = require('path');

console.log('Rebuilding better-sqlite3 for Node.js (web mode)...');
try {
  execSync('npm rebuild better-sqlite3', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✓ better-sqlite3 rebuilt for Node.js');
} catch (error) {
  console.error('Error rebuilding better-sqlite3:', error.message);
  process.exit(1);
}
