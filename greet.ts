
declare global {
  interface Window {
    __TAURI_INVOKE__<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
  }
}
const invoke = window.__TAURI_INVOKE__;export async function greet(name: string): Promise<string> {
  const result = await invoke<string>("plugin:c81d1d1c0f82e097|greet",{name: name});
  return result
}

