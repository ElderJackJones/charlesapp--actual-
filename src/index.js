const { app, BrowserWindow, ipcMain } = require('electron');
const ChromeLauncher = require('chrome-launcher')
const path = require('node:path');
const { EventEmitter } = require('node:stream');
const charles = require('charlesbrain');
const log = require('electron-log')

Object.assign(console, log)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

if (process.argv.includes('--squirrel-uninstall')) {
  const appDataPath = path.join(app.getPath("appData"), 'resources');

  try {
    fs.rmSync(appDataPath, { recursive: true, force: true });
    console.log('Deleted app data folder:', appDataPath);
  } catch (err) {
    console.error('Failed to delete app data folder:', err);
  }

  // Optionally create and write to a log file
  // Then quit
  app.quit();
  return;
}

let mainWindow

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,  
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname,'renderer', 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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

const emitter = new EventEmitter()
const Charles = new charles(emitter, app.getPath("appData"))

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
    // Yes, this is ugly code. No, I don't want to refactor it, thank you.
    let user 
    try {
      user = await Charles.user()
    } catch (e) {
      user = {}
    }
    
    if (user) {
      await Charles.createUser(args.username ?? user.username, args.password ?? user.password, args.botname ?? user.botname, args.botpassword ?? user.botpassword, args.theme)
    } else {
      await Charles.createUser(args.username, args.password, args.botname, args.botpassword, args.theme)
    }
    return true
  } catch (e) {
    console.log('writing error: ', e)
    return e
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

ipcMain.handle('get/report', async (event, args) => {
  try {
    let areas = await Charles.report()
    return areas
  }
  catch (e) {
    mainWindow.webContents.send('httpError')
    throw new Error(e)
  }
})

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
emitter.on('httpError', () => {
  mainWindow.webContents.send('httpError')
})

ipcMain.on('close/window', () => {
  app.quit()
});

ipcMain.handle('send/broadcast', async (event, args) => {
  const user = await Charles.user()
  console.log(args)
  await Charles.broadcast(args[0], args[1])
})

ipcMain.handle('send/test', async (event, args) => {
  const user = await Charles.user()
  await Charles.test(args[1], args[0], user.username, user.password)
})

ipcMain.handle('send/custom', async (event, args) => {
  const user = await Charles.user()
  await Charles.customMessage(args[0], args[1], user.username, user.password)
})

ipcMain.handle('get/connection', async (event, args) => {
  try {
    // Initialize the wifi module
    wifi.init({ iface: null });

    // Get current WiFi connections
    const connections = await wifi.getCurrentConnections();

    if (connections.length === 0) {
      console.log('No Wi-Fi connection detected');
      return null;
    }

    const conn = connections[0];
    console.log('Signal level:', conn.signal_level);

    // You can return more if you want
    return conn.signal_level

  } catch (error) {
    console.error('Error getting WiFi info:', error);
    return { error: error.message };
  }
});

ipcMain.handle('get/theme', async () => {
  const user = await Charles.user()
  return user.theme ?? 'lofi'
})