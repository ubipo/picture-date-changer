import { emit, listen } from '@tauri-apps/api/event'
import { MessageToHost, MessageToUi } from './generated-bindings'

type MessageToHostPayload<Kind> = Extract<MessageToHost, { kind: Kind }> extends { payload: infer Payload } ? Payload : never
type MessageToUiPayload<Kind> = Extract<MessageToUi, { kind: Kind }> extends { payload: infer Payload } ? Payload : never

export const emitToHost = <
    Message extends MessageToHost,
    Kind extends Message['kind'],
    Payload extends MessageToHostPayload<Kind>
>(
    kind: Kind,
    ...payload: Payload extends never ? [] : [Payload]
) => emit('host-ui-bridge', { kind, payload: payload[0] })

export const listenToHost = <
    Message extends MessageToUi,
    Kind extends Message['kind'],
    Payload extends MessageToUiPayload<Kind>
>(
    kind: Kind,
    callback: (payload: Payload) => void
) => listen('host-ui-bridge', e => {
    const message = e.payload as MessageToUi
    if (message.kind === kind) {
        callback((message as any).payload)
    }
})
