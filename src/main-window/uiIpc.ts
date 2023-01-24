import type { UiIpcApi, UiIpcApiEvents } from "src/electron/uiIpc"

declare global {
    interface Window {
        uiIpcApiInvoke: (channel: string, ...args: any[]) => any,
        uiIpcApiOn: (channel: string, listener: (...args: any[]) => void) => void,
    }
}

export const uiIpcApi = new Proxy({}, {
    get: (target, prop) => (...args: any[]) => {
        return window.uiIpcApiInvoke(prop.toString(), ...args)
    }
}) as UiIpcApi

export const onUiIpcApiEvent = <K extends keyof UiIpcApiEvents>(
    channel: K,
    handler: (e: Electron.IpcRendererEvent, ...args: Parameters<UiIpcApiEvents[K]>) => void
) => {
    window.uiIpcApiOn(channel, handler as any)
}
