import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
    'uiIpcApiInvoke',
    (channel: string, args: any[]) => ipcRenderer.invoke(
        'uiIpcApiInvoke',
        channel,
        ...args
    )
)

contextBridge.exposeInMainWorld(
    'onUiIpcApiEvent',
    (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener)
    }
)
