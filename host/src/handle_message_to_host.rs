use std::{collections::HashMap, sync::{Arc, Mutex}, hash::Hash};

use chrono::DateTime;
use tauri::AppHandle;

use crate::{
    host_ui_bridge::{
        MessageToHost, MediaLoadingCompletePayload, MessageToUi,
        ChangeMediaDateTimeExactPayload, LoadMediaPreviewPayload,
        MediaPreviewLoadedPayload, Media, ToUiSender, MediaPreviewLoadedResult, MediaPreviewSuccess, ChangeMediaDateTimeInterpolatedPayload
    },
    load_media::{
        load_media_preview_data_uri, pick_folders, path_to_media,
        recursively_find_file_paths
    },
    media_datetime::{
        save_original_date_time_to_metadata, FixedOffsetOrUtcDateTime
    }
};

fn handle_change_media_date_time_interpolated(
    loaded_media_by_path: &mut HashMap<String, Media>,
    before_path: String,
    target_path: String,
    after_path: String,
) {
    println!("Changing date time for: {} to interpolated", target_path);
    
    let before_media = loaded_media_by_path.get(&before_path).unwrap();
    let target_media = loaded_media_by_path.get(&target_path).unwrap();
    let after_media = loaded_media_by_path.get(&after_path).unwrap();
    let before_date_time = DateTime::parse_from_rfc3339(&before_media.date_time.clone().unwrap()).expect("Could not parse date time");
    let target_old_date_time = DateTime::parse_from_rfc3339(&target_media.date_time.clone().unwrap()).expect("Could not parse date time");
    let after_date_time = DateTime::parse_from_rfc3339(&after_media.date_time.clone().unwrap()).expect("Could not parse date time");
    println!("Before: {}, Target: {}, After: {}", before_date_time, target_old_date_time, after_date_time);
    if before_date_time > after_date_time {
        panic!("'Before date time' ({}) is not before 'after date time' ({})", before_date_time, after_date_time);
    }
    let before_after_delta = after_date_time - before_date_time;
    let before_new_delta = before_after_delta / 2;
    let target_new_date_time = before_date_time + before_new_delta;
    println!("Changing date time from {} to {}", target_old_date_time, target_new_date_time);
    save_original_date_time_to_metadata(
        &target_path.clone().into(),
        &FixedOffsetOrUtcDateTime::Offset(target_new_date_time)
    );
    let media = loaded_media_by_path.get_mut(&target_path).unwrap();
    media.date_time = Some(target_new_date_time.to_rfc3339());
}

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
        MessageToHost::LoadMediaPreview {
            payload: LoadMediaPreviewPayload { path }
        } => {
            tokio::spawn(async move {
                let result = match load_media_preview_data_uri(&path).await {
                    Ok(data_uri) => MediaPreviewLoadedResult::Success(MediaPreviewSuccess { data_uri }),
                    Err(err) => MediaPreviewLoadedResult::Error { message: err.to_string() },
                };
                app_handle.send_to_ui(MessageToUi::MediaPreviewLoaded {
                    payload: MediaPreviewLoadedPayload { path, result }
                },);
            });
        },
        MessageToHost::ChangeMediaDateTimeExact {
            payload: ChangeMediaDateTimeExactPayload { path, new_date_time }
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
        MessageToHost::ChangeMediaDateTimeInterpolated {
            payload: ChangeMediaDateTimeInterpolatedPayload { 
                before_path,
                target_path,
                after_path,
            }
        } => {
            let mut loaded_media_by_path = shared_loaded_media_by_path.lock().unwrap();
            handle_change_media_date_time_interpolated(
                &mut loaded_media_by_path,
                before_path,
                target_path,
                after_path,
            );
            app_handle.send_to_ui(MessageToUi::MediaLoadingComplete { 
                payload: MediaLoadingCompletePayload {
                    new_media: loaded_media_by_path.values().cloned().collect()
                }
            });
        }
    }
}
