const path = require('node:path');
const os = require('node:os');
const { app, BrowserWindow, ipcMain, screen } = require('electron');

const isSmokeTest = process.argv.includes('--smoke-test');
const isGlobalSmokeTest = process.argv.includes('--smoke-global');
const isSmokeMode = isSmokeTest || isGlobalSmokeTest;
let mainWindow;
let currentFacingDirection = 'right';
let orientationToolsPromise = null;
let globalHookState = {
  enabled: false,
  available: false,
  error: '',
  hook: null,
  translate: null,
  keydownHandler: null
};

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
if (isSmokeMode) {
  app.setPath('userData', path.join(os.tmpdir(), `bird-companion-smoke-${process.pid}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 282,
    height: 268,
    minWidth: 240,
    minHeight: 220,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    show: !isSmokeMode,
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => updateWindowFacingDirection());
  mainWindow.on('move', () => updateWindowFacingDirection());

  if (isSmokeMode) {
    runSmokeCheck(mainWindow);
  }
}

function runSmokeCheck(window) {
  const timer = setTimeout(() => {
    console.error('SMOKE_TIMEOUT');
    app.exit(1);
  }, 12000);

  window.webContents.once('did-fail-load', (_event, code, description) => {
    clearTimeout(timer);
    console.error(`SMOKE_LOAD_FAILED ${code} ${description}`);
    app.exit(1);
  });

  window.webContents.once('did-finish-load', async () => {
    try {
      const ready = await window.webContents.executeJavaScript(`
        new Promise(resolve => {
          const started = Date.now();
          const check = () => {
            if (window.__BIRD_COMPANION_READY === true) {
              resolve(true);
            } else if (Date.now() - started > 5000) {
              resolve(false);
            } else {
              setTimeout(check, 50);
            }
          };
          check();
        })
      `);
      if (!ready) throw new Error('renderer was not ready');
      if (isGlobalSmokeTest) {
        await startGlobalListening();
        const status = getGlobalStatus();
        if (!status.enabled || !status.available) {
          throw new Error(status.error || 'global hook was not enabled');
        }
        stopGlobalListening();
      }
      clearTimeout(timer);
      console.log('SMOKE_READY');
      app.exit(0);
    } catch (error) {
      clearTimeout(timer);
      console.error(`SMOKE_SCRIPT_FAILED ${error.message}`);
      app.exit(1);
    }
  });
}

ipcMain.on('companion:close', () => {
  mainWindow?.close();
});

ipcMain.on('companion:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('companion:get-global-status', () => getGlobalStatus());
ipcMain.handle('companion:get-facing-direction', () => currentFacingDirection);

ipcMain.handle('companion:set-global-listening', async (_event, enabled) => {
  if (enabled) {
    await startGlobalListening();
  } else {
    stopGlobalListening();
  }
  return getGlobalStatus();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopGlobalListening();
  app.quit();
});

app.on('will-quit', () => {
  stopGlobalListening();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

async function startGlobalListening() {
  if (isSmokeTest && !isGlobalSmokeTest) {
    globalHookState = {
      ...globalHookState,
      enabled: true,
      available: true,
      error: ''
    };
    return;
  }

  if (globalHookState.enabled) return;

  try {
    if (!globalHookState.hook) {
      const [{ uIOhook, UiohookKey }, { createGlobalKeyTranslator }] = await Promise.all([
        import('uiohook-napi'),
        import('./global-key-events.mjs')
      ]);
      globalHookState.hook = uIOhook;
      globalHookState.translate = createGlobalKeyTranslator(UiohookKey, { anonymousLetters: false });
    }

    globalHookState.keydownHandler = event => {
      const key = globalHookState.translate?.(event);
      if (!key) return;
      mainWindow?.webContents.send('companion:global-key', {
        key,
        at: Date.now()
      });
    };
    globalHookState.hook.on('keydown', globalHookState.keydownHandler);
    globalHookState.hook.start();
    globalHookState = {
      ...globalHookState,
      enabled: true,
      available: true,
      error: ''
    };
  } catch (error) {
    globalHookState = {
      ...globalHookState,
      enabled: false,
      available: false,
      error: error?.message || String(error)
    };
  }
}

async function getOrientationTools() {
  if (!orientationToolsPromise) {
    orientationToolsPromise = import('./window-orientation.mjs');
  }
  return orientationToolsPromise;
}

async function updateWindowFacingDirection() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const { chooseFacingDirection } = await getOrientationTools();
    const bounds = mainWindow.getBounds();
    const display = screen.getDisplayMatching(bounds);
    const nextDirection = chooseFacingDirection({
      windowBounds: bounds,
      workArea: display.workArea
    });
    if (nextDirection === currentFacingDirection) return;
    currentFacingDirection = nextDirection;
    mainWindow.webContents.send('companion:facing-direction', currentFacingDirection);
  } catch {
    currentFacingDirection = 'right';
  }
}

function stopGlobalListening() {
  if (!globalHookState.hook) {
    globalHookState.enabled = false;
    return;
  }

  try {
    if (globalHookState.keydownHandler) {
      globalHookState.hook.off?.('keydown', globalHookState.keydownHandler);
      globalHookState.keydownHandler = null;
    }
    globalHookState.hook.stop();
  } catch (error) {
    globalHookState.error = error?.message || String(error);
  } finally {
    globalHookState.enabled = false;
  }
}

function getGlobalStatus() {
  return {
    enabled: globalHookState.enabled,
    available: globalHookState.available,
    error: globalHookState.error
  };
}
