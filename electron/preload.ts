import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('set-always-on-top', flag),
  onTogglePrivacyMode: (callback: () => void) => {
    ipcRenderer.on('toggle-privacy-mode', callback);
  },
});
