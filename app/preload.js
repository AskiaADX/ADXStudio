const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:open', options),
  openExternal: (url) => ipcRenderer.send('shell:openExternal', url),
  showTabContextMenu: (data) => ipcRenderer.send('menu:tab-context', data),
  // Generic IPC event bridge
  on: (channel, listener) => ipcRenderer.on(channel, listener),
  once: (channel, listener) => ipcRenderer.once(channel, listener),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
});
