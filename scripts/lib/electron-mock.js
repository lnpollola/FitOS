const Module = require('module');
const os = require('os');

function mockElectron(userDataPath) {
  const fakeElectron = {
    app: {
      getPath: (name) => name === 'userData' ? userDataPath : os.homedir(),
      whenReady: () => Promise.resolve(),
      on: () => {},
      commandLine: { appendSwitch: () => {} },
    },
    BrowserWindow: class { static getAllWindows() { return []; } on(_e, _cb) {} webContents = { send: () => {} }; isDestroyed() { return false; } },
    Menu: { buildFromTemplate: () => ({}), setApplicationMenu: () => {} },
    dialog: {},
    screen: { getPrimaryDisplay: () => ({ workArea: { width: 1200, height: 800 } }) },
  };
  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function (request, ...args) {
    if (request === 'electron') return 'electron';
    return origResolve.call(this, request, ...args);
  };
  require.cache.electron = { id: 'electron', filename: 'electron', loaded: true, exports: fakeElectron };
  return fakeElectron;
}

module.exports = { mockElectron };
