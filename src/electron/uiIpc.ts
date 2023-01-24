import { Dayjs } from "dayjs"
import { BrowserWindow, dialog, ipcMain } from "electron"
import { MediaFile } from "../common/MediaFile"
import { getFilePathOrDirFilePaths } from "./filePaths"
import { filePathToMediaFile } from "./loadMedia"

async function loadImagesWithFilePicker(win: BrowserWindow): Promise<MediaFile[]> {
    const openResult = await dialog.showOpenDialog(win, { properties: ["openDirectory"] })
    if (openResult.canceled) return []
    const filePaths = (await Promise.all(
        openResult.filePaths.map(getFilePathOrDirFilePaths)
    )).flat()
    const mediaFiles = (await Promise.all(filePaths.map(filePathToMediaFile)))
        .filter(imgUrl => imgUrl != null) as MediaFile[]
    return mediaFiles
}

/* Forgive the type magic below. Its purpose is to combine the declaration
(interface) and definition (implementation) for an IPC API into a single
definition, while retaining type checking for both the handlers on the Main side
and the API methods on the Renderer side. */
type IpcApiHandler = (e: Electron.IpcMainInvokeEvent, ...args: any[]) => any
type IpcApiHandlers = Record<string, IpcApiHandler>
const typedIpcApiHandlers = <T extends IpcApiHandlers> (api: T): T => api

type IpcApiMethodForHandler<H> = H extends (e: Electron.IpcMainInvokeEvent, ...args: infer A) => any ? (...args: A) => Promise<ReturnType<H>> : never
type IpcApiMethodsForHandlers<T extends IpcApiHandlers> = {
    [K in keyof T]: IpcApiMethodForHandler<T[K]>
}

export type UiIpcApiEvents = {
    'mediaAdded': (media: MediaFile[]) => void
}

export const sendUiIpcApiEvent = <T extends keyof UiIpcApiEvents>(window: BrowserWindow, channel: T, ...args: Parameters<UiIpcApiEvents[T]>) => {
    window.webContents.send(channel, ...args)
}

// TODO: Move state to better place
const media = [] as MediaFile[]

const uiIpcApiHandlers = typedIpcApiHandlers({
    addMedia: async e => {
        const browserWindow = BrowserWindow.fromWebContents(e.sender)
        if (!browserWindow) return null
        const newMedia = await loadImagesWithFilePicker(browserWindow)
        media.push(...newMedia)
        sendUiIpcApiEvent(browserWindow, 'mediaAdded', newMedia)
        return newMedia
    },
    changeMediaDateTime: async (_e, _path: string, _newDateTime: Dayjs) => {
        // TODO: implement
    }
})

export type UiIpcApi = IpcApiMethodsForHandlers<typeof uiIpcApiHandlers>

export const registerUiIpcApi = () => ipcMain.handle(
    'uiIpcApiInvoke',
    (e, channel: string, ...args: any[]) => {
        console.log('Main: invoking UI IPC API channel:', channel, ...args)
        const handler = uiIpcApiHandlers[channel as keyof typeof uiIpcApiHandlers]
        if (handler == null) throw new Error(`Unknown UI IPC API channel: ${channel}`)
        return (handler as any)(e, ...args)
    }
)
