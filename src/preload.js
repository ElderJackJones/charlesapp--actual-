// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge} = require('electron')

const WINDOW_API = {
    requestZones: () => ipcRenderer.invoke('get/zones'),
    saveLogin: (login) => ipcRenderer.invoke('save/login', login),
    sendZones: (zoneObj) => ipcRenderer.invoke('save/zones', zoneObj),
    charles: (e2ee) => ipcRenderer.invoke('send/charles', e2ee),
    personUpdate: (callback) => ipcRenderer.on('person/update', (_event, data) => callback(data)),
    personBegin: (callback) => ipcRenderer.on('person/begin', (_event, data) => callback(data)),
    personComplete: (callback) => ipcRenderer.on('person/complete', (_event, data) => callback(data)),
    messageBegin: (callback) => ipcRenderer.on('message/begin', (_event, data) => callback(data)),
    messageSent: (callback) => ipcRenderer.on('message/sent', (_event, data) => callback(data)),
    httpError: (callback) => ipcRenderer.on('httpError', (event, data) => callback(data)),
    messageComplete: (callback) => ipcRenderer.on('message/complete', (_event, data) => callback(data)),
    requestReport: () => ipcRenderer.invoke('get/report'),
    closeWindow: () => ipcRenderer.send('close/window'),
    broadcast: (args) => ipcRenderer.invoke('send/broadcast', args),
    test: (args) => ipcRenderer.invoke('send/test', args),
    custom: (args) => ipcRenderer.invoke('send/custom', args),
    connectInfo: () => ipcRenderer.invoke('get/connection'),
    getTheme: () => ipcRenderer.invoke('get/theme')
}

contextBridge.exposeInMainWorld('api', WINDOW_API)