use std::path::PathBuf;

use tauri::api::dialog::FileDialogBuilder;
use walkdir::WalkDir;

use crate::host_ui_bridge::Media;

fn path_vec_to_recursive_file_paths(path_vec: Vec<PathBuf>) -> Vec<PathBuf> {
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

fn path_to_media(path: PathBuf) -> Media {
    Media {
        path: path.to_str().expect("Media path must be valid UTF-8").to_owned(),
        date_time: None,
    }
}

pub fn load_images_with_file_picker() -> Vec<Media> {
    FileDialogBuilder::new().pick_folders(|file_paths| {
        match file_paths {
            Some(file_paths) => {
                let file_paths = path_vec_to_recursive_file_paths(file_paths);
                let media = file_paths.into_iter().map(path_to_media).collect::<Vec<Media>>();
            },
            None => {},
        }
    });
    Vec::new()
}
