import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
    'uiIpcApiInvoke',
    (channel: string, ...args: any[]) => {
        return ipcRenderer.invoke('uiIpcApiInvoke', channel, ...args)
    }
)

contextBridge.exposeInMainWorld(
    'uiIpcApiOn',
    (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener)
    }
)
