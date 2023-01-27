#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod host_ui_bridge;
mod load_media;
mod handle_message_to_host;
mod media_datetime;

use host_ui_bridge::RX_EVENT_NAME;
use tauri::Manager;
use magick_rust::magick_wand_genesis;

use crate::handle_message_to_host::handle_message_to_host;

fn main() {
    magick_wand_genesis();

    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            app.listen_global(RX_EVENT_NAME,  move |event| {
                let second_handle = app_handle.clone();
                let event_payload_str = event.payload().expect("Event must have a payload");
                let message = serde_json::from_str::<host_ui_bridge::MessageToHost>(event_payload_str).expect("Event payload must be a MessageToHost");
                handle_message_to_host(&second_handle, message);
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
