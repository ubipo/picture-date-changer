use std::{time::Duration, collections::HashMap, sync::{Arc, Mutex}};

use chrono::DateTime;
use tauri::AppHandle;

use crate::{
    host_ui_bridge::{
        MessageToHost, MediaLoadingCompletePayload, MessageToUi, ChangeMediaDateTimePayload, LoadMediaPreviewPayload, MediaPreviewLoadedPayload, MediaPreviewLoadErrorPayload, Media, ToUiSender
    },
    load_media::{load_media_preview_data_uri, pick_folders, path_to_media, recursively_find_file_paths}, media_datetime::{save_original_date_time_to_metadata, FixedOffsetOrUtcDateTime}
};

pub fn handle_message_to_host(
    app_handle: AppHandle,
    shared_loaded_media_by_path: Arc<Mutex<HashMap<String, Media>>>,
    message: MessageToHost
) {
    match message {
        MessageToHost::SendLatestMedia => {
            let loaded_media_by_path = shared_loaded_media_by_path.lock().unwrap();
            app_handle.send_to_ui(MessageToUi::MediaLoadingComplete { 
                payload: MediaLoadingCompletePayload {
                    new_media: loaded_media_by_path.values().cloned().collect()
                }
            });
        },
        MessageToHost::AddMedia => {
            tokio::spawn(async move {
                let folder_paths = match pick_folders().await {
                    Some(media) => media,
                    None => return,
                };
                app_handle.send_to_ui(MessageToUi::MediaLoading);
                let media_paths = recursively_find_file_paths(folder_paths);
                let new_media = media_paths.into_iter().map(path_to_media).collect::<Vec<Media>>();
                let mut loaded_media_by_path = shared_loaded_media_by_path.lock().unwrap();
                for media in &new_media {
                    loaded_media_by_path.insert(media.path.clone(), media.clone());
                }
                app_handle.send_to_ui(MessageToUi::MediaLoadingComplete { 
                    payload: MediaLoadingCompletePayload {
                        // TODO: Maybe renew since its all media, not just new
                        new_media: loaded_media_by_path.values().cloned().collect()
                    }
                });
            });
        },
        MessageToHost::ChangeMediaDateTime {
            payload: ChangeMediaDateTimePayload { path, new_date_time }
         } => {
            println!("Changing date time for: {} to {}", path, new_date_time);
            let fixed_offset_date_time = DateTime::parse_from_rfc3339(&new_date_time).expect("Could not parse date time");
            println!("Parsed to: {}", fixed_offset_date_time);
            save_original_date_time_to_metadata(
                &path.clone().into(),
                &FixedOffsetOrUtcDateTime::Offset(fixed_offset_date_time)
            );
            let mut loaded_media_by_path = shared_loaded_media_by_path.lock().unwrap();
            let media = loaded_media_by_path.get_mut(&path).unwrap();
            media.date_time = Some(new_date_time);
            app_handle.send_to_ui(MessageToUi::MediaLoadingComplete { 
                payload: MediaLoadingCompletePayload {
                    new_media: loaded_media_by_path.values().cloned().collect()
                }
            });
        },
        MessageToHost::LoadMediaPreview {
            payload: LoadMediaPreviewPayload { path }
        } => {
            tokio::spawn(async move {
                let message = match load_media_preview_data_uri(&path).await {
                    Ok(data_uri) => MessageToUi::MediaPreviewLoaded {
                        payload: MediaPreviewLoadedPayload { path, data_uri }
                    },
                    Err(err) => MessageToUi::MediaPreviewLoadError {
                        payload: MediaPreviewLoadErrorPayload { path, error: err }
                    }
                };
                app_handle.send_to_ui(message);
            });
        },
    }
}
