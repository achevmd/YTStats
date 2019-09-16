import { app, BrowserWindow, screen, IpcMain, ipcMain, shell } from 'electron';
import * as Store from 'electron-store';
import * as path from 'path';
import * as url from 'url';

let win, store, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false
  });

  // Create store
  store = new Store();

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  // Open external link
  ipcMain.on('open-link', (event, arg) => {
    shell.openExternal(arg);
  });

  // Add channel id
  ipcMain.on('add-channel', (event, arg) => {

    const channels = store.get('channels');

    if (channels)
      store.set('channels', [...channels, arg]);
      else
      store.set('channels', [arg]);
  });

  // Remove channel id
  ipcMain.on('remove-channel', (event, channel) => {

    const channels = store.get('channels');

    if (channels)
      store.set('channels', channels.filter(e => e !== channel));
      else
      store.set('channels', []);
  });

  // Get all channel ids
  ipcMain.on('get-channels', (event) => {

    const channels = store.get('channels');
    console.log(channels);

    event.sender.send('channels', channels);
  });

  // Clear channels
  ipcMain.on('clear-channels', (event) => {

    store.set('channels', []);
  });

} catch (e) {
  // Catch Error
  // throw e;
}
