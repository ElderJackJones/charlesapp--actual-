// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge} = require('electron')

const WINDOW_API = {
    requestZones: () => ipcRenderer.invoke('get/zones'),
    saveLogin: (login) => ipcRenderer.invoke('save/login', login),
    sendZones: (zoneObj) => ipcRenderer.invoke('save/zones', zoneObj),
    charles: () => ipcRenderer.invoke('send/charles'),
    personUpdate: (callback) => ipcRenderer.on('person/update', (_event, data) => callback(data)),
    personBegin: (callback) => ipcRenderer.on('person/begin', (_event, data) => callback(data)),
    personComplete: (callback) => ipcRenderer.on('person/complete', (_event, data) => callback(data)),
    messageBegin: (callback) => ipcRenderer.on('message/begin', (_event, data) => callback(data)),
    messageSent: (callback) => ipcRenderer.on('message/sent', (_event, data) => callback(data)),
    messageComplete: (callback) => ipcRenderer.on('message/complete', (_event, data) => callback(data))
}

contextBridge.exposeInMainWorld('api', WINDOW_API)