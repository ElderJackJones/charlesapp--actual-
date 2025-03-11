// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge} = require('electron')

const WINDOW_API = {
    requestZones: () => ipcRenderer.invoke('get/zones'),
    saveLogin: (login) => ipcRenderer.invoke('save/login', login)
}

contextBridge.exposeInMainWorld('api', WINDOW_API)