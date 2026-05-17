const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('birdCompanionShell', {
  close: () => ipcRenderer.send('companion:close'),
  minimize: () => ipcRenderer.send('companion:minimize'),
  startDrag: point => ipcRenderer.send('companion:drag-start', normalizeDragPoint(point)),
  moveDrag: point => ipcRenderer.send('companion:drag-move', normalizeDragPoint(point)),
  endDrag: () => ipcRenderer.send('companion:drag-end'),
  getGlobalStatus: () => ipcRenderer.invoke('companion:get-global-status'),
  setGlobalListening: enabled => ipcRenderer.invoke('companion:set-global-listening', Boolean(enabled)),
  getFacingDirection: () => ipcRenderer.invoke('companion:get-facing-direction'),
  onFacingDirection: callback => {
    const handler = (_event, direction) => callback(direction);
    ipcRenderer.on('companion:facing-direction', handler);
    return () => ipcRenderer.removeListener('companion:facing-direction', handler);
  },
  onGlobalKey: callback => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('companion:global-key', handler);
    return () => ipcRenderer.removeListener('companion:global-key', handler);
  }
});

function normalizeDragPoint(point = {}) {
  return {
    screenX: Number(point.screenX),
    screenY: Number(point.screenY)
  };
}
