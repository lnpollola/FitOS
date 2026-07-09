const concurrently = require('concurrently');
const path = require('path');

concurrently(
  [
    { command: 'npx vite --host', name: 'vite', prefixColor: 'green' },
    { command: 'npx wait-on http://localhost:5173 && node src/server/start-web.js', name: 'server', prefixColor: 'blue' }
  ],
  {
    killOthers: ['failure', 'success'],
    restartTries: 0,
  }
).result.then(
  () => console.log('All processes completed'),
  (err) => console.error('Error:', err)
);
