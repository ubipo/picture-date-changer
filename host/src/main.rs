#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod host_ui_bridge;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
            app.listen_global("host-ui-bridge", |event| {
                let payload_str = event.payload().unwrap();
                let payload = serde_json::from_str::<host_ui_bridge::MessageToHost>(payload_str).unwrap();
                match payload {
                    host_ui_bridge::MessageToHost::AddMedia => {
                        println!("AddMedia");
                    },
                    host_ui_bridge::MessageToHost::ChangeMediaDateTime { path, new_date_time } => {
                        println!("ChangeMediaDateTime ffsdsadf");
                        // println!("ChangeMediaDateTime: path: {:?}, new_date_time: {:?}", path, new_date_time);
                        // let meta = rexiv2::Metadata::new_from_path(&path).unwrap();
                        // let tag = "Exif.Image.DateTime";
                        // let previous_date_time = meta.get_tag_string(tag).unwrap();
                        // println!("previous_date_time: {:?}, new_date_time: {:?}", previous_date_time, new_date_time);
                        // meta.set_tag_string(tag, &new_date_time).unwrap();
                        // meta.save_to_file(&path).unwrap();
                    },
                }
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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
