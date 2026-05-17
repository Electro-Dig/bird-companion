const path = require('node:path');
const os = require('node:os');
const { app, BrowserWindow, ipcMain, screen } = require('electron');

const isSmokeTest = process.argv.includes('--smoke-test');
const isGlobalSmokeTest = process.argv.includes('--smoke-global');
const isSmokeMode = isSmokeTest || isGlobalSmokeTest;
let mainWindow;
let currentFacingDirection = 'right';
let orientationToolsPromise = null;
let dragState = null;
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
    width: 320,
    height: 286,
    minWidth: 300,
    minHeight: 250,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    show: !isSmokeMode,
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, '..', '..', 'build', 'icon.ico'),
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
      const interaction = await window.webContents.executeJavaScript(`
        (() => {
          const root = document.querySelector('[data-companion]');
          const statsButton = document.querySelector('[data-stats-toggle]');
          const dotCount = document.querySelectorAll('.dot-menu i').length;
          root.dispatchEvent(new PointerEvent('pointerenter'));
          const hoverReveals = root.dataset.panelOpen === 'true';
          statsButton.click();
          const statsOpens = root.dataset.statsOpen === 'true'
            && statsButton.getAttribute('aria-expanded') === 'true';
          return { hoverReveals, statsOpens, dotCount };
        })()
      `);
      if (!interaction.hoverReveals) throw new Error('hover did not reveal panels');
      if (!interaction.statsOpens) throw new Error('stats button did not open details');
      if (interaction.dotCount !== 3) throw new Error('stats detail button dots were not rendered');
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

ipcMain.on('companion:drag-start', (event, payload) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const point = normalizeDragPoint(payload);
  if (!window || !point) return;
  const bounds = window.getBounds();
  dragState = {
    windowId: window.id,
    startScreenX: point.screenX,
    startScreenY: point.screenY,
    startWindowX: bounds.x,
    startWindowY: bounds.y
  };
});

ipcMain.on('companion:drag-move', (event, payload) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const point = normalizeDragPoint(payload);
  if (!window || !point || !dragState || dragState.windowId !== window.id) return;
  const nextX = Math.round(dragState.startWindowX + point.screenX - dragState.startScreenX);
  const nextY = Math.round(dragState.startWindowY + point.screenY - dragState.startScreenY);
  window.setPosition(nextX, nextY, false);
  updateWindowFacingDirection();
});

ipcMain.on('companion:drag-end', () => {
  dragState = null;
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

function normalizeDragPoint(point = {}) {
  const screenX = Number(point.screenX);
  const screenY = Number(point.screenY);
  if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) return null;
  return { screenX, screenY };
}

function getGlobalStatus() {
  return {
    enabled: globalHookState.enabled,
    available: globalHookState.available,
    error: globalHookState.error
  };
}
