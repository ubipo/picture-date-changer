/* Forgive the type magic below. Its purpose is to combine the declaration
(interface) and definition (implementation) for an IPC API into a single
definition, while retaining type checking for both the handlers on the Main side
and the API methods on the Renderer side. */
export type IpcApiHandler = (e: Electron.IpcMainInvokeEvent, ...args: any[]) => any
export type IpcApiHandlers = Record<string, IpcApiHandler>
export  const typedIpcApiHandlers = <T extends IpcApiHandlers> (api: T): T => api

export type IpcApiMethodForHandler<H> = H extends (e: Electron.IpcMainInvokeEvent, ...args: infer A) => any ? (...args: A) => Promise<ReturnType<H>> : never
export type IpcApiMethodsForHandlers<T extends IpcApiHandlers> = {
    [K in keyof T]: IpcApiMethodForHandler<T[K]>
}