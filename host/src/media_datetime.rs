use std::path::PathBuf;

use chrono::{NaiveDate, DateTime, Utc, Local, TimeZone, NaiveDateTime};
use lazy_static::lazy_static;
use regex::Regex;

pub enum LocalOrUtcDateTime {
    Local(DateTime<Local>),
    Utc(DateTime<Utc>)
}

impl LocalOrUtcDateTime {
    pub fn to_rfc3339(&self) -> String {
        match self {
            LocalOrUtcDateTime::Local(date_time) => date_time.to_rfc3339(),
            LocalOrUtcDateTime::Utc(date_time) => date_time.to_rfc3339(),
        }
    }
}

const DATE_TIME_TAG: &str = "Exif.Image.DateTime";
const DATE_TIME_ORIGINAL_TAG: &str = "Exif.Photo.DateTimeOriginal";
const DATE_TIME_DIGITIZED_TAG: &str = "Exif.Photo.DateTimeDigitized";
fn date_time_from_metadata(path: &PathBuf) -> Option<LocalOrUtcDateTime> {
    let meta = rexiv2::Metadata::new_from_path(&path).unwrap();
    let date_time_str = meta.get_tag_string(DATE_TIME_TAG).ok().or_else(|| {
        meta.get_tag_string(DATE_TIME_ORIGINAL_TAG).ok().or_else(|| {
            meta.get_tag_string(DATE_TIME_DIGITIZED_TAG).ok()
        })
    })?;
    let date_time = NaiveDateTime::parse_from_str(&date_time_str, "%Y:%m:%d %H:%M:%S").ok()?;
    // We don't know the timezone, maybe the app user's timezone would be
    // better? At least this is consistent.
    Some(LocalOrUtcDateTime::Utc(
        Utc.from_utc_datetime(&date_time)
    ))
}

lazy_static! {
    static ref WHATSAPP_DATE_TIME_RE: Regex = Regex::new(r"^IMG-(\d{8})-").unwrap();
}

fn date_time_from_filename(path: &PathBuf) -> Option<LocalOrUtcDateTime> {
    let filename = path.file_name().unwrap().to_str().unwrap();
    WHATSAPP_DATE_TIME_RE.captures(filename).and_then(|captures| {
        let date_str = captures.get(1).unwrap().as_str();
        let date = NaiveDate::parse_from_str(date_str, "%Y%m%d").ok()?;
        let naive_date_time = date.and_hms_opt(12, 0, 0)?;
        Some(LocalOrUtcDateTime::Utc(
            Utc.from_utc_datetime(&naive_date_time)
        ))
    })
}

pub fn date_time_from_path(path: &PathBuf) -> Option<LocalOrUtcDateTime> {
    date_time_from_metadata(path).or_else(|| date_time_from_filename(path))
}
