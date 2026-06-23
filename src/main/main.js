const { app, BrowserWindow, Menu, dialog, screen } = require('electron');
const path = require('path');
const { initDatabase } = require('../db/database');
const { exportAllData, importAllData } = require('../db/import-export');
const { registerIpcHandlers } = require('./ipc-handlers');

app.commandLine.appendSwitch('disable-gpu');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    useContentSize: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => {
    setTimeout(() => {
      const bounds = screen.getPrimaryDisplay().workArea;
      mainWindow.setBounds(bounds);
    }, 50);
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'renderer', 'index.html'));
  }

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              defaultPath: `health-data-${new Date().toISOString().split('T')[0]}.json`,
              filters: [{ name: 'JSON', extensions: ['json'] }],
            });
            if (!result.canceled && result.filePath) {
              try {
                await exportAllData(result.filePath);
                dialog.showMessageBox(mainWindow, { type: 'info', message: 'Data exported successfully.' });
              } catch (err) {
                dialog.showErrorBox('Export Error', err.message);
              }
            }
          },
        },
        {
          label: 'Import Data',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [{ name: 'JSON', extensions: ['json'] }],
              properties: ['openFile'],
            });
            if (!result.canceled && result.filePaths[0]) {
              const confirm = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Cancel', 'Import'],
                defaultId: 0,
                message: 'This will replace all existing data. Are you sure?',
              });
              if (confirm.response === 1) {
                try {
                  await importAllData(result.filePaths[0]);
                  dialog.showMessageBox(mainWindow, { type: 'info', message: 'Data imported successfully.' });
                  mainWindow.webContents.send('data-changed');
                } catch (err) {
                  dialog.showErrorBox('Import Error', err.message);
                }
              }
            }
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Dashboard', click: () => mainWindow.webContents.send('navigate', 'dashboard') },
        { label: 'Activity', click: () => mainWindow.webContents.send('navigate', 'activity') },
        { label: 'Diet Plan', click: () => mainWindow.webContents.send('navigate', 'diet') },
        { label: 'Energy Balance', click: () => mainWindow.webContents.send('navigate', 'energy') },
        { label: 'Body Measurements', click: () => mainWindow.webContents.send('navigate', 'measurements') },
        { label: 'Strength Training', click: () => mainWindow.webContents.send('navigate', 'training') },
        { type: 'separator' },
        { label: 'Profile & Settings', click: () => mainWindow.webContents.send('navigate', 'profile') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Personal Pollo',
              message: 'Personal Pollo v0.1.0\nAdaptive Health Foundation',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
  registerIpcHandlers(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
