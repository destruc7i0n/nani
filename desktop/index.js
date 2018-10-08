const {app, BrowserWindow} = require('electron')

const { Client } = require('discord-rpc')

const open = require('open')
const path = require('path')

require('electron-debug')({ enabled: true })

let win

const rpc = new Client({ transport: 'ipc' })

rpc.on('ready', () => {
  console.log('Connected to Discord!')
})

const RPCClientID = '428640542033969163'
rpc.login(RPCClientID).catch(console.error)

function createWindow () {
  win = new BrowserWindow({
    icon: path.join(__dirname, 'build', 'icon.ico'),
    title: 'nani',
    show: false,
    backgroundColor: '#eee',
    webPreferences: {
      experimentalFeatures: true,
      webSecurity: false
    }
  })
  win.setMenu(null)
  win.maximize()

  // only show when ready
  win.once('ready-to-show', () => {
    win.show()
  })

  // load into view
  win.loadURL('https://nani.ninja')

  let lastRPCUpdate = ''
  win.on('page-title-updated', (event, title) => {
    // split into parts
    const parts = title.split(' - ')
    // check if on an episode page
    if (parts[0].startsWith('Episode')) {
      // check if not a repeat
      if (lastRPCUpdate !== parts[0]) {
        rpc.setActivity({
          details: parts[0],
          state: parts[1],
          largeImageKey: 'ninja',
          instance: false
        })
        // update the last RPC update
        lastRPCUpdate = parts[0]
      }
    } else { // otherwise, 'Browsing'
      // check if not a repeat
      if (lastRPCUpdate !== 'Browsing') {
        rpc.setActivity({
          details: 'Browsing...',
          largeImageKey: 'ninja',
          instance: false
        })
        // update the last RPC update
        lastRPCUpdate = 'Browsing'
      }
    }
  })

  win.on('closed', () => {
    win = null
  })

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    // only open on links that aren't the login
    if (url !== 'about:blank') {
      open(url)
    }
  })
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

// fix scaling
// app.commandLine.appendSwitch('high-dpi-support', 1)
// app.commandLine.appendSwitch('force-device-scale-factor', 1)
