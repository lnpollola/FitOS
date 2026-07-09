const express = require('express');
const cors = require('cors');
const path = require('path');
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
  const DIST_PATH = path.join(__dirname, '..', '..', 'dist', 'renderer');

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  initDatabase();

  const _getDb = () => getDb();
  const _getHS = () => getHS();

  registerApiRoutes(app, _getDb, _getHS);

  app.use(express.static(DIST_PATH));

  app.use((req, res) => {
    const indexPath = path.join(DIST_PATH, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitOS server running at http://0.0.0.0:${PORT}`);
    console.log(`Access from network: http://<your-ip>:${PORT}`);
  });

  return app;
}

module.exports = { createServer };
