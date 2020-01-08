'use strict'

import { app, protocol, BrowserWindow, ipcMain, net, dialog, shell, Menu } from 'electron'
import {
  createProtocol,
  // installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
import cv from './opencv.js'
import Jimp from 'jimp/dist'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

const menu = Menu.buildFromTemplate([
  {
    label: '파일',
    submenu: [
      process.platform === 'darwin' ? { role: 'close' } : { label: '끝내기', role: 'quit' }
    ]
  },
  {
    label: '보기',
    submenu: [
      { label: '새로고침', role: 'forcereload' }
    ]
  },
  {
    label: '도움말',
    submenu: [
      {
        label: '피드백',
        click: () => {
          shell.openExternal('https://github.com/hummingengineer/image-processing-app/issues')
        }
      },
      {
        label: '업데이트 확인',
        click: () => {
          checkForUpdate()
        }
      }
    ]
  }
])
Menu.setApplicationMenu(menu)

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600, webPreferences: {
    nodeIntegration: true
  } })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

/* Event handler for asynchronous incoming messages */
ipcMain.on('convert-image', (event, originalFilePath, selectedTechnique) => {
  onRuntimeInitialized(event, originalFilePath, selectedTechnique)
})

// Load the open.js. The function `onRuntimeInitialized` contains our program.
let Module = {
  onRuntimeInitialized
}

// Dilate example
function onRuntimeInitialized (event, originalFilePath, selectedTechnique) {
  switch (selectedTechnique) {
    case 'Image Thresholding': {
      thresholdImg(event, originalFilePath)
      break
    }
    case 'Dilate': {
      dilateImg(event, originalFilePath)
      break
    }
  }
}

async function thresholdImg (event, originalFilePath) {
  let jimpSrc = await Jimp.read(originalFilePath)
  let src = cv.matFromImageData(jimpSrc.bitmap)
  let dst = new cv.Mat()
  cv.threshold(src, dst, 177, 200, cv.THRESH_BINARY)
  new Jimp({
    width: dst.cols,
    height: dst.rows,
    data: Buffer.from(dst.data)
  })
  .getBase64Async(jimpSrc.getMIME())
  .then(dataURI => {
    event.reply('convert-image', dataURI)
  })
  src.delete()
  dst.delete()
}

async function dilateImg (event, originalFilePath) {
  let jimpSrc = await Jimp.read(originalFilePath)
  let src = cv.matFromImageData(jimpSrc.bitmap)
  let dst = new cv.Mat()
  let M = cv.Mat.ones(5, 5, cv.CV_8U)
  let anchor = new cv.Point(-1, -1)
  cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue())
  new Jimp({
    width: dst.cols,
    height: dst.rows,
    data: Buffer.from(dst.data)
  })
  .getBase64Async(jimpSrc.getMIME())
  .then(dataURI => {
    event.reply('convert-image', dataURI)
  })
  src.delete()
  dst.delete()
}

function checkForUpdate () {
  let body = '' // let body = []
  const checkUpdateRequest = net.request('https://github.com/hummingengineer/image-processing-app/releases/latest')
  checkUpdateRequest.on('response', res => {
    res.on('data', chunk => {
      body += chunk  // body.push(chunk)
    })
    res.on('end', () => {
      // body = Buffer.concat(body).toString() // 여기 'body'에 응답 받은 전체 바디가 문자열로 담겨있다
      let startIndex = body.indexOf(':', body.indexOf('Recent Commits to'))
      let endIndex = body.indexOf('"', startIndex)
      let latestVer = body.slice(startIndex + 1, endIndex)
      if(latestVer !== app.getVersion() && latestVer !== 'master') {
        dialog.showMessageBox({
          type: 'none',
          buttons: ['Cancel', 'Ok'],
          title: '업데이트',
          message: '새로운 버전이 있습니다',
          detail: '다운로드 페이지로 이동하시겠습니까?'
        }).then(result => {
          if(result.response === 1) shell.openExternal('https://github.com/hummingengineer/image-processing-app/releases/latest')
        })
      }
      else {
        dialog.showMessageBox({
          type: 'none',
          title: '업데이트',
          message: '현재 최신버전입니다'
        })
      }
    })
  })
  checkUpdateRequest.end()
}
