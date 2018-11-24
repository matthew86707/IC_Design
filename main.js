// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
// var ffi = require('ffi')

// let nativeRust = ffi.Library('./native/target/release/ic_designer_native', {
//   'get_native_version': [ 'int', [ 'int' ] ],
//   'get_native_version_rustc': [ 'int', [ 'int' ] ]
// });


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let otherWindows = new Array();

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, frame: false, icon:'IC_Logo.png'})

  // and load the index.html of the app.
  mainWindow.loadFile('pages/startup/welcome.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('open-project', (event, arg) => {
  //TODO : Let the arg be the project file location later...
  mainWindow.maximize()
  mainWindow.loadFile('pages/main/main.html')
});

ipcMain.on('native-get-version', (event, arg) => {
    event.sender.send('native-get-version-response', process.arch);
});

ipcMain.on('native-get-version-rustc', (event, arg) => {
   event.sender.send('native-get-version-rustc-response', 5);
});

ipcMain.on('open-new-layer', (event, arg) => {
    // Create the browser window.
    window = new BrowserWindow({width: 800, height: 600, frame: false, icon:'IC_Logo.png'})

    // and load the index.html of the app.
    window.loadFile('pages/main/creation-wizards/new-layer/new-layer.html')
  
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
  
    // Emitted when the window is closed.
    window.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      window = null
    })
    
    otherWindows.push(window);
});
