import { app, BrowserWindow, dialog } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

const createWindow = () => {
    console.log(path.join(__dirname, 'preload.js'))
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    })
    
    win.loadFile(path.join(__dirname, '../main-window/index.html'))

    return win
}

async function showOpenDialog(win: BrowserWindow): Promise<string[]> {
    const openResult = await dialog.showOpenDialog(win, { properties: ["openDirectory"] })
    if (openResult.canceled) return []
    const filePath = await Promise.all(openResult.filePaths.map(async openedPath => {
        if ((await fs.lstat(openedPath)).isDirectory()) {
            // Glob files in directory
            return (await fs.readdir(openedPath)).map(filePath =>
                path.join(openedPath, filePath)
            )
        }
        return [openedPath]
    }))
    return filePath.flat()
}

app.whenReady().then(() => {
    const window = createWindow()


    showOpenDialog(window)
        .catch(e => console.error(e))
        .then(files => {
            console.log(files)
        })
})
