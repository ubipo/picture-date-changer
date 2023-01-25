import { IpcMainEvent } from "electron";
import type { UiIpcApi, UiIpcApiEvents } from "src/electron/uiIpc"

declare global {
    interface Window {
        uiIpcApi: UiIpcApi,
        uiIpcApiInvoke: (channel: string, args: any[]) => any,
        onUiIpcApiEvent: <K extends keyof UiIpcApiEvents>(
            channel: K,
            listener: (
                e: IpcMainEvent,
                ...args: Parameters<UiIpcApiEvents[K]>
            ) => void
        ) => void,
    }
}

export const registerUiIpcApi = () => {
    // This proxy object cannot be exposed in the preload script, because it cannot
    // be serialized. 
    window.uiIpcApi = new Proxy({}, {
        get: (_target, prop) => (
            ...args: any[]
        ) =>  window.uiIpcApiInvoke(prop.toString(), args)
    }) as UiIpcApi
}
