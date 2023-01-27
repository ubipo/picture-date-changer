#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod host_ui_bridge;
mod load_media;
mod handle_message_to_host;
mod media_datetime;

use tauri::Manager;
use crate::handle_message_to_host::handle_message_to_host;

fn main() {
    // let file = "/data/photo/egypt-2010-04/CSC_8249.JPG";
    // let meta = rexiv2::Metadata::new_from_path(&file).unwrap();
    // let tag = "Exif.Image.DateTime";
    // let previous_date_time = meta.get_tag_string(tag).unwrap();
    // let new_date_time = "2010:04:14 17:36:53";
    // println!("previous_date_time: {:?}, new_date_time: {:?}", previous_date_time, new_date_time);
    // meta.set_tag_string(tag, new_date_time).unwrap();
    // meta.save_to_file(file).unwrap();

    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            app.listen_global("host-ui-bridge",  move |event| {
                let second_handle = app_handle.clone();
                let event_payload_str = event.payload().expect("Event must have a payload");
                let message = serde_json::from_str::<host_ui_bridge::MessageToHost>(event_payload_str).expect("Event payload must be a MessageToHost");
                handle_message_to_host(&second_handle, message);
            });
            // app.listen_global("aaa", |event| {
            //     event.payload().unwrap()
            //     let a = event.id();
            // });
            // app.emit_all("aa", User {
            //     user_id: 0,
            //     first_name: "Hello".to_owned(),
            //     last_name: "Yoooo".to_owned()
            // }).unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
