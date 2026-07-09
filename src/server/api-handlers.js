const { register: registerProfile } = require('../main/handlers/profile-handlers');
const { register: registerActivity } = require('../main/handlers/activity-handlers');
const { register: registerDiet } = require('../main/handlers/diet-handlers');
const { register: registerTraining } = require('../main/handlers/training-handlers');
const { register: registerMeasurements } = require('../main/handlers/measurements-handlers');
const { register: registerEnergy } = require('../main/handlers/energy-handlers');
const { register: registerSettings } = require('../main/handlers/settings-handlers');
const { register: registerHealth } = require('../main/handlers/health-handlers');
const { register: registerDashboard } = require('../main/handlers/dashboard-handlers');
const { register: registerStravaPanels } = require('../main/handlers/strava-panels-handlers');
const { register: registerInsights } = require('../main/handlers/insights-handlers');
const { register: registerStrengthInsights } = require('../main/handlers/strength-insights-handlers');
const { register: registerGoals } = require('../main/handlers/goals-handlers');
const { getDb } = require('../db/database');

const EXPORT_TABLES = [
  'user_profile', 'activity_days', 'sport_activities', 'food_items',
  'meal_templates', 'meal_components', 'meal_options', 'daily_plans',
  'daily_plan_entries', 'measurement_sets', 'weight_entries',
  'training_routines', 'exercise_library',
  'training_sessions', 'training_sets', 'settings',
  'elaborated_dishes', 'dish_ingredients', 'meal_dish_options',
  'workout_plans', 'workout_plan_days',
];

class MockIpcMain {
  constructor() {
    this.handlers = new Map();
  }

  handle(channel, handler) {
    this.handlers.set(channel, handler);
  }
}

function registerApiRoutes(app, getDb, getHS) {
  const mockIpc = new MockIpcMain();
  const _notifyDomain = () => {};

  registerProfile(mockIpc, getDb, getHS, _notifyDomain);
  registerActivity(mockIpc, getDb, getHS, _notifyDomain);
  registerDiet(mockIpc, getDb, getHS, _notifyDomain);
  registerTraining(mockIpc, getDb, getHS, _notifyDomain);
  registerMeasurements(mockIpc, getDb, getHS, _notifyDomain);
  registerEnergy(mockIpc, getDb, getHS, _notifyDomain);
  registerSettings(mockIpc, getDb, getHS, _notifyDomain);
  registerHealth(mockIpc, getDb, getHS, _notifyDomain);
  registerDashboard(mockIpc, getDb, getHS, _notifyDomain);
  registerStravaPanels(mockIpc, getDb, getHS, _notifyDomain);
  registerInsights(mockIpc, getDb, getHS, _notifyDomain);
  registerStrengthInsights(mockIpc, getDb, getHS, _notifyDomain);
  registerGoals(mockIpc, getDb, getHS, _notifyDomain);

  app.post('/api/:channel', async (req, res) => {
    try {
      const channel = req.params.channel;
      const args = req.body.args || [];
      
      const handler = mockIpc.handlers.get(channel);
      if (!handler) {
        return res.status(404).json({ error: `Handler not found: ${channel}` });
      }

      const mockEvent = {};
      const result = await handler(mockEvent, ...args);
      res.json(result);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/export', (req, res) => {
    try {
      const db = getDb();
      const data = { _metadata: { version: '0.1.0', exported_at: new Date().toISOString() } };
      for (const table of EXPORT_TABLES) {
        data[table] = db.prepare(`SELECT * FROM ${table}`).all();
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/import', (req, res) => {
    try {
      const db = getDb();
      const data = req.body;
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data format');
      }
      const transaction = db.transaction(() => {
        for (const table of EXPORT_TABLES) {
          db.prepare(`DELETE FROM ${table}`).run();
        }
        for (const table of EXPORT_TABLES) {
          const rows = data[table];
          if (!rows || rows.length === 0) continue;
          try {
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            const insert = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
            for (const row of rows) {
              insert.run(columns.map(c => row[c]));
            }
          } catch (e) {
            console.warn(`Skipping table ${table}: ${e.message}`);
          }
        }
      });
      transaction();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { registerApiRoutes };
