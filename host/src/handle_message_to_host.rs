use tauri::{AppHandle, Manager};

use crate::{
    host_ui_bridge::{
        MessageToHost, MediaLoadingCompletePayload, MessageToUi, ChangeMediaDateTimePayload, LoadMediaPreviewPayload, MediaPreviewLoadedPayload, MediaPreviewLoadErrorPayload, EVENT_NAME
    },
    load_media::{load_media_with_file_picker, load_media_preview_data_uri}
};

pub fn handle_message_to_host(
    app_handle: &AppHandle,
    message: MessageToHost
) {
    match message {
        MessageToHost::AddMedia => {
            let cloned_handle = app_handle.clone();
            tokio::spawn(async move {
                let media = match load_media_with_file_picker().await {
                    Some(media) => media,
                    None => return,
                };
                let payload = MediaLoadingCompletePayload { new_media: media };
                let message = MessageToUi::MediaLoadingComplete { payload };
                cloned_handle.emit_all(EVENT_NAME, message).unwrap();
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
                let message = match load_media_preview_data_uri(&path).await {
                    Ok(data_uri) => MessageToUi::MediaPreviewLoaded {
                        payload: MediaPreviewLoadedPayload { path, data_uri }
                    },
                    Err(err) => MessageToUi::MediaPreviewLoadError {
                        payload: MediaPreviewLoadErrorPayload { path, error: err }
                    }
                };
                cloned_handle.emit_all(EVENT_NAME, message).unwrap();
            });
        },
    }
}
