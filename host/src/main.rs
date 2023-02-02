#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod host_ui_bridge;
mod load_media;
mod handle_message_to_host;
mod media_datetime;

use std::{collections::HashMap, sync::{Arc, Mutex}};

use host_ui_bridge::{RX_EVENT_NAME, Media};
use tauri::Manager;

use crate::handle_message_to_host::handle_message_to_host;

fn main() {
    let shared_loaded_media_by_path = Arc::new(Mutex::new(
        HashMap::<String, Media>::new()
    ));

    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            app.listen_global(RX_EVENT_NAME,  move |event| {
                let event_payload_str = event.payload().expect("Event must have a payload");
                let message = serde_json::from_str::<host_ui_bridge::MessageToHost>(event_payload_str).expect("Event payload must be a MessageToHost");
                handle_message_to_host(
                    app_handle.clone(),
                    shared_loaded_media_by_path.clone(),
                    message
                );
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
