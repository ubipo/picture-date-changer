use std::time::Duration;

use tauri::{AppHandle};
use tokio::time::sleep;

use crate::{
    host_ui_bridge::{
        MessageToHost, MediaLoadingCompletePayload, MessageToUi, ChangeMediaDateTimePayload, LoadMediaPreviewPayload, MediaPreviewLoadedPayload, MediaPreviewLoadErrorPayload, Media, ToUiSender
    },
    load_media::{load_media_preview_data_uri, pick_folders, path_to_media, recursively_find_file_paths}
};

pub fn handle_message_to_host(
    app_handle: &AppHandle,
    message: MessageToHost
) {
    match message {
        MessageToHost::AddMedia => {
            let cloned_handle = app_handle.clone();
            tokio::spawn(async move {
                let folder_paths = match pick_folders().await {
                    Some(media) => media,
                    None => return,
                };
                cloned_handle.send_to_ui(MessageToUi::MediaLoading);
                let media_paths = recursively_find_file_paths(folder_paths);
                let media = media_paths.into_iter().map(path_to_media).collect::<Vec<Media>>();
                cloned_handle.send_to_ui(MessageToUi::MediaLoadingComplete { 
                    payload: MediaLoadingCompletePayload { new_media: media }
                });
            });
        },
        MessageToHost::ChangeMediaDateTime {
            payload: ChangeMediaDateTimePayload {
                path,
                new_date_time,
            }
         } => {
            println!("ChangeMediaDateTime ffsdsadf");
            // println!("ChangeMediaDateTime: path: {:?}, new_date_time: {:?}", path, new_date_time);
            // let meta = rexiv2::Metadata::new_from_path(&path).unwrap();
            // let tag = "Exif.Image.DateTime";
            // let previous_date_time = meta.get_tag_string(tag).unwrap();
            // println!("previous_date_time: {:?}, new_date_time: {:?}", previous_date_time, new_date_time);
            // meta.set_tag_string(tag, &new_date_time).unwrap();
            // meta.save_to_file(&path).unwrap();
        },
        MessageToHost::LoadMediaPreview {
            payload: LoadMediaPreviewPayload { path }
        } => {
            let cloned_handle = app_handle.clone();
            tokio::spawn(async move {
                sleep(Duration::from_millis(10000)).await;
                let message = match load_media_preview_data_uri(&path).await {
                    Ok(data_uri) => MessageToUi::MediaPreviewLoaded {
                        payload: MediaPreviewLoadedPayload { path, data_uri }
                    },
                    Err(err) => MessageToUi::MediaPreviewLoadError {
                        payload: MediaPreviewLoadErrorPayload { path, error: err }
                    }
                };
                cloned_handle.send_to_ui(message);
            });
        },
    }
}
