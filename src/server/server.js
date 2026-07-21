const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase, getDb, initHealthsyncDb, getHealthsyncDb } = require('../db/database');
const { registerApiRoutes } = require('./api-handlers');

function getHS() {
  let hs = getHealthsyncDb();
  if (!hs) {
    initHealthsyncDb();
    hs = getHealthsyncDb();
  }
  return hs;
}

function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const DEV_MODE = process.env.DEV_MODE === 'true';
  const DIST_PATH = path.join(__dirname, '..', '..', 'dist', 'renderer');
  const HAS_DIST = fs.existsSync(path.join(DIST_PATH, 'index.html'));

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  initDatabase();

  const _getDb = () => getDb();
  const _getHS = () => getHS();

  registerApiRoutes(app, _getDb, _getHS);

  if (!HAS_DIST) {
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      const msg = DEV_MODE
        ? 'Dev mode: access frontend at http://localhost:5173'
        : 'Production build not found. Run: npm run build:web';
      res.status(200).json({ status: DEV_MODE ? 'dev' : 'no-build', message: msg, api: 'running' });
    });
  } else {
    app.use(express.static(DIST_PATH));
    app.use((req, res) => {
      res.sendFile(path.join(DIST_PATH, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitOS server running at http://0.0.0.0:${PORT}`);
    console.log(`Access from network: http://<your-ip>:${PORT}`);
  });

  return app;
}

module.exports = { createServer };
