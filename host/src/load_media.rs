use std::path::PathBuf;

use tauri::api::dialog::FileDialogBuilder;
use tokio::sync::oneshot;
use walkdir::WalkDir;
use base64::{Engine as _, engine::general_purpose};
use magick_rust::MagickWand;

use crate::{host_ui_bridge::Media, media_datetime::date_time_from_path};

static MAX_WIDTH: usize = 480;
static MAX_HEIGHT: usize = 480;

type DataUri = String;

pub fn recursively_find_file_paths(path_vec: Vec<PathBuf>) -> Vec<PathBuf> {
    let mut file_paths = Vec::new();
    for path in path_vec {
        if path.is_dir() {
            for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
                if entry.path().is_file() {
                    file_paths.push(entry.path().to_path_buf());
                }
            }
        } else {
            file_paths.push(path);
        }
    }
    file_paths
}

pub fn path_to_media(path: PathBuf) -> Media {
    let date_time = date_time_from_path(&path).map(|date_time| date_time.to_rfc3339());
    Media {
        path: path.to_str().expect("Media path must be valid UTF-8").to_owned(),
        date_time,
    }
}

pub async fn pick_folders() -> Option<Vec<PathBuf>> {
    let (media_tx, media_rx) = oneshot::channel();
    FileDialogBuilder::new().pick_folders(|file_paths| {
        media_tx.send(file_paths).unwrap();
    });
    media_rx.await.unwrap()
}

pub async fn load_media_preview_data_uri(
    path: &str
) -> Result<DataUri, String> {
    let wand = MagickWand::new();
    wand.read_image(path).map_err(|e| e.to_string())?;
    wand.fit(MAX_WIDTH, MAX_HEIGHT);
    let blob = wand.write_image_blob("webp").map_err(|e| e.to_string())?;
    // let mime = mime_guess::from_path(path).first().ok_or("Could not guess media MIME type")?;
    // let file_content = read(path).await.map_err(|e| e.to_string())?;
    let base64 = general_purpose::STANDARD.encode(blob);
    Ok(format!("data:image/webp;base64,{}", base64))
}
