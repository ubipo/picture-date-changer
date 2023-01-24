import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
    'uiIpcApiInvoke',
    (channel: string, ...args: any[]) => {
        console.log('Preload: invoking UI IPC API channel:', channel, ...args)
        const result = ipcRenderer.invoke('uiIpcApiInvoke', channel, ...args)
        console.log('Preload: UI IPC API channel result:', channel, result)
        return result
    }
)

contextBridge.exposeInMainWorld(
    'uiIpcApiOn',
    (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener)
    }
)
