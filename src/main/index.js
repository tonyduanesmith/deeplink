const {app, BrowserWindow, ipcMain, Tray, shell, Notification} = require('electron')
const path = require('path')
const fs = require('fs')

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  createWindow()
  createNotification()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

app.setAsDefaultProtocolClient('idbdeeplink')
// Protocol handler for osx
app.on('open-url', function (event, url) {
  event.preventDefault()
  openFile(url)
})

const createTray = () => {
  tray = new Tray(__dirname + '/assets/icons/png/deepLink.png')
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
}

const createNotification = () => {
  errorNotification = new Notification({
    title: 'File Not Found',
    body: 'The file has not been found, please make sure you are connected to the correct server',
  })
} 

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    radii: [5, 5, 5, 5],
    transparent: true,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)
  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

ipcMain.on('weather-updated', (event, weather) => {
  
})




function openFile(filePath) {
  const strippedFilePath = filePath.replace('idbdeeplink://', '')
  console.log('opening...', strippedFilePath);
    fs.access(strippedFilePath, (err) => {
      if(err){
        errorNotification.show()
      }else{
        shell.openItem(strippedFilePath);
      }
    })
}