const { execSync } = require('child_process');
const path = require('path');

console.log('Rebuilding better-sqlite3 for Electron...');
try {
  execSync('npx @electron/rebuild -o better-sqlite3', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✓ better-sqlite3 rebuilt for Electron');
} catch (error) {
  console.error('Error rebuilding better-sqlite3:', error.message);
  process.exit(1);
}
