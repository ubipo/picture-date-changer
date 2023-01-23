import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { fileTypeFromBuffer } from './file-type.cjs'
import { promises as fs } from 'fs'
import path from 'path'

const isDev = !app.isPackaged

const createWindow = () => {
    console.log('preload', path.join(__dirname, 'preload.js'))
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

async function getDirFilePaths(dirPath: string): Promise<string[]> {
    const dirents = await fs.readdir(dirPath, { withFileTypes: true })
    return (await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dirPath, dirent.name);
      return dirent.isDirectory() ? getDirFilePaths(res) : res;
    }))).flat()
}

async function getFilePathOrDirFilePaths(path: string): Promise<string[]> {
    if ((await fs.lstat(path)).isDirectory()) {
        return getDirFilePaths(path)
    }
    return [path]
}

async function loadImages(win: BrowserWindow): Promise<string[]> {
    const openResult = await dialog.showOpenDialog(win, { properties: ["openDirectory"] })
    if (openResult.canceled) return []
    const filePaths = (await Promise.all(
        openResult.filePaths.map(getFilePathOrDirFilePaths)
    )).flat()
    const images = (await Promise.all(filePaths.map(async filePath => {
        const fileContent = await fs.readFile(filePath)
        const type = await fileTypeFromBuffer(fileContent)
        if (!type) return
        const contentBase64 = fileContent.toString('base64')
        return `data:${type.mime};base64,${contentBase64}`
    }))).filter(imgUrl => imgUrl != null) as string[]
    return images
}

app.whenReady().then(() => {
    ipcMain.handle('showOpenDialog', async e => {
        const browserWindow = BrowserWindow.fromWebContents(e.sender)
        if (!browserWindow) return
        return loadImages(browserWindow)
    })

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
