import { Dayjs } from "dayjs"
import { BrowserWindow } from "electron"
import { MediaFile } from "../common/MediaFile"
import { IpcApiMethodsForHandlers, createSendIpcApiEvent, typedIpcApiHandlers, registerIpcApiHandlers } from "./IpcApi"
import { loadImagesWithFilePicker } from "./loadMedia"

const media = [] as MediaFile[]

export interface UiIpcApiEvents {
    'mediaLoading': () => void
    'mediaLoadingComplete': (newMedia: MediaFile[]) => void
    'mediaLoadingError': (message: string) => void
}

const sendUiIpcApiEvent = createSendIpcApiEvent<UiIpcApiEvents>()

const uiIpcApiHandlers = typedIpcApiHandlers({
    addMedia: async e => {
        const browserWindow = BrowserWindow.fromWebContents(e.sender)
        if (!browserWindow) return null
        const newMedia = await (async () => { try {
            return await loadImagesWithFilePicker(
                browserWindow,
                () => sendUiIpcApiEvent(browserWindow, 'mediaLoading')
            )
        } catch (error) {
            sendUiIpcApiEvent(browserWindow, 'mediaLoadingError', String(error))
            console.error(error)
            throw error
        }})()
        media.push(...newMedia)
        sendUiIpcApiEvent(browserWindow, 'mediaLoadingComplete', newMedia)
        return newMedia
    },
    changeMediaDateTime: async (_e, _path: string, _newDateTime: Dayjs) => {
        // TODO: implement
    }
})

export type UiIpcApi = IpcApiMethodsForHandlers<typeof uiIpcApiHandlers>
export const registerUiIpcApi = () => registerIpcApiHandlers('uiIpcApi', uiIpcApiHandlers)
