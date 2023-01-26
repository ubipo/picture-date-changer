import { emit, listen } from '@tauri-apps/api/event'
import { MessageToHost, MessageToUi } from './generated-bindings'

// type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export const emitToHost = <M extends MessageToHost>(
    kind: M['kind'],
    ...payload: keyof Omit<M, 'kind'> extends never ? [] : [Omit<M, 'kind'>]
) => emit('host-ui-bridge', {
    kind,
    ...payload
})

// export const listenToHost = <M extends MessageToUi>(
//     kind: M['kind'],
//     callback: (payload: M) => void
// ) => listen('host-ui-bridge', e => {
//     const message = e.payload as M
//     if (message.kind === kind) {
//         const messageWithoutKind = message as PartialBy<M, 'kind'>
//         delete messageWithoutKind.kind
//         callback(messageWithoutKind as M)
//     }
// })
