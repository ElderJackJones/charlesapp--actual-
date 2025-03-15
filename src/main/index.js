const { app, BrowserWindow, ipcMain } = require('electron');
const charles = require('charlesbrain')
const path = require('node:path');
const { EventEmitter } = require('node:stream');


const emitter = new EventEmitter()
let mainWindow
const Charles = new charles(emitter)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('get/zones', async (event, args) => {
  console.log('received zone request')
  let zones
  try {
    zones = await Charles.zones()
  } catch (e) {
    console.log(e)
    return false
  }
  return zones
})

ipcMain.handle('save/login', async (event, args) => {
  try {
    await Charles.createUser(args.username, args.password, args.botname, args.botpassword)
    return true
  } catch (e) {
    console.log('writing error: ', e)
    return false
  }
})

ipcMain.handle('save/zones', async (event, args) => {
  try {
    await Charles.saveConfig(args)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
})

ipcMain.handle('send/charles', async (event, args) => {
  try {
    const user = await Charles.user()
    await Charles.message(args, user.username, user.password)
  } catch (e) {
    throw new Error(e)
  }
})



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


// Emitter handle

emitter.on('person/update', (data) => {
  mainWindow.webContents.send('person/update')
})
emitter.on('person/begin', (data) => {
  mainWindow.webContents.send('person/begin', data)
})
emitter.on('person/complete', (data) => {
  mainWindow.webContents.send('person/complete')
})
emitter.on('message/begin', (data) => {
  mainWindow.webContents.send('message/begin', data)
})
emitter.on('message/sent', (data) => {
  mainWindow.webContents.send('message/sent')
})
emitter.on('message/complete', (data) => {
  mainWindow.webContents.send('message/complete')
})