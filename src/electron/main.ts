import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { fileTypeFromBuffer } from './file-type.cjs'
import { promises as fs } from 'fs'
import path from 'path'
import { Image } from '../common/Image.js'
import { chunkArray } from '../common/arrays.js'
import { Day } from '../common/Day.js'

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

async function filePathToImage(filePath: string): Promise<Image | null> {
    const fileContent = await fs.readFile(filePath)
    const type = await fileTypeFromBuffer(fileContent)
    if (!type) return null
    const contentBase64 = fileContent.toString('base64')
    return {
        path: filePath,
        dataUri: `data:${type.mime};base64,${contentBase64}`
    }
}

async function loadImages(win: BrowserWindow): Promise<Image[]> {
    const openResult = await dialog.showOpenDialog(win, { properties: ["openDirectory"] })
    if (openResult.canceled) return []
    const filePaths = (await Promise.all(
        openResult.filePaths.map(getFilePathOrDirFilePaths)
    )).flat()
    const images = (await Promise.all(filePaths.map(filePathToImage)))
        .filter(imgUrl => imgUrl != null) as Image[]
    return images
}

app.whenReady().then(() => {
    console.info('App ready')
    ipcMain.handle('showOpenDialog', async e => {
        const browserWindow = BrowserWindow.fromWebContents(e.sender)
        if (!browserWindow) return
        const images = await loadImages(browserWindow)
        console.log('images', images)
        const days: Day[] = chunkArray(images, 3).map((images, index) => ({
            date: `2023-01-${index}`,
            images
        }))
        console.log('Days: ', days)
        return days
    })

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
