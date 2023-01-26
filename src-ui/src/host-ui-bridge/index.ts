import { emit } from '@tauri-apps/api/event'
import { ToHostMessage } from './generated-bindings'

export const emitToHost = (msg: ToHostMessage) => emit('host-ui-bridge', msg)
