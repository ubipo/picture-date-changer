import { emit, listen, UnlistenFn } from '@tauri-apps/api/event'
import { MessageToHost, MessageToUi } from './generated-bindings'

type MessageToHostPayload<Kind> = Extract<MessageToHost, { kind: Kind }> extends { payload: infer Payload } ? Payload : never
type MessageToUiPayload<Kind> = Extract<MessageToUi, { kind: Kind }> extends { payload: infer Payload } ? Payload : never

export type ListenerRemover = () => void

class HostUiBridge {
    kindListeners: {
        [kind in MessageToUi['kind']]?: ((payload: MessageToUiPayload<kind>) => void)[]
    } = {}
    bridgeListenerRemoverPromise: Promise<UnlistenFn> | null = null

    private async addBridgeListenerIfNecessary() {
        if (this.bridgeListenerRemoverPromise != null) return
        this.bridgeListenerRemoverPromise = listen(
            HostUiBridge.RX_EVENT_NAME,
            e => {
                const message = e.payload as MessageToUi
                const listeners = this.kindListeners[message.kind]
                if (listeners == null) return
                listeners.forEach(l => l((message as any).payload as never))
            }
        )
        await this.bridgeListenerRemoverPromise
    }

    emit<
        Message extends MessageToHost,
        Kind extends Message['kind'],
        Payload extends MessageToHostPayload<Kind>
    >(
        kind: Kind,
        ...payload: Payload extends never ? [] : [Payload]
    ) {
        emit(HostUiBridge.TX_EVENT_NAME, { kind, payload: payload[0] })
    }

    async addListener<
        Message extends MessageToUi,
        Kind extends Message['kind'],
        Payload extends MessageToUiPayload<Kind>
    >(
        kind: Kind,
        listener: (payload: Payload) => void
    ): Promise<ListenerRemover> {
        await this.addBridgeListenerIfNecessary()
        const listeners = this.kindListeners[kind] ?? []
        listeners.push(listener as never)
        this.kindListeners[kind] = listeners
        return () => {
            const listeners = this.kindListeners[kind]
            if (listeners == null) return
            this.kindListeners[kind] = listeners.filter(l => l !== listener) as never
        }
    }

    on = this.addListener

    // The event names need to be different for the two directions because 
    // Tauri echoes events back to the sender, and we don't want to receive
    // our own messages.
    private static TX_EVENT_NAME = 'host-ui-bridge-ui-to-host'
    private static RX_EVENT_NAME = 'host-ui-bridge-host-to-ui'
}

export const hostUiBridge = new HostUiBridge()
