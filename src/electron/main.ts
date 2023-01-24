import { app, BrowserWindow } from 'electron'
import path from 'path'
import { registerUiIpcApi } from './uiIpc.js'

const isDev = !app.isPackaged

const createMainWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    if (isDev) {
        const port = process.env.PORT ?? 3000
        window.loadURL(`http://localhost:${port}`)
    } else {
        window.loadFile(path.join(__dirname, '../main-window/index.html'))
    }
    return window
}

app.whenReady().then(() => {
    registerUiIpcApi()
    createMainWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
