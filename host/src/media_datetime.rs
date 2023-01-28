use std::path::PathBuf;

use chrono::{NaiveDate, DateTime, Utc, TimeZone, NaiveDateTime, FixedOffset};
use lazy_static::lazy_static;
use regex::Regex;

pub enum FixedOffsetOrUtcDateTime {
    Offset(DateTime<FixedOffset>),
    Utc(DateTime<Utc>)
}

impl FixedOffsetOrUtcDateTime {
    pub fn to_rfc3339(&self) -> String {
        match self {
            FixedOffsetOrUtcDateTime::Offset(date_time) => date_time.to_rfc3339(),
            FixedOffsetOrUtcDateTime::Utc(date_time) => date_time.to_rfc3339(),
        }
    }
}

/** JEITA CP-3451 § 4.6.8 File change date and time */
const DATE_TIME_TAG: &str = "Exif.Image.DateTime";
/** JEITA CP-3451 § 4.6.5 "Date and time of original data generation" */
const DATE_TIME_ORIGINAL_TAG: &str = "Exif.Photo.DateTimeOriginal";
/** JEITA CP-3451 § 4.6.5 "Date and time of digital data generation" */
const DATE_TIME_DIGITIZED_TAG: &str = "Exif.Photo.DateTimeDigitized";
fn date_time_from_metadata(path: &PathBuf) -> Option<FixedOffsetOrUtcDateTime> {
    let meta = rexiv2::Metadata::new_from_path(&path).unwrap();
    let date_time_str = meta.get_tag_string(DATE_TIME_ORIGINAL_TAG).ok().or_else(|| {
        meta.get_tag_string(DATE_TIME_DIGITIZED_TAG).ok().or_else(|| {
            meta.get_tag_string(DATE_TIME_TAG).ok()
        })
    })?;
    let date_time = NaiveDateTime::parse_from_str(&date_time_str, "%Y:%m:%d %H:%M:%S").ok()?;
    // We don't know the timezone, maybe the app user's timezone would be
    // better? At least this is consistent.
    Some(FixedOffsetOrUtcDateTime::Utc(
        Utc.from_utc_datetime(&date_time)
    ))
}

pub fn save_original_date_time_to_metadata(path: &PathBuf, date_time: &FixedOffsetOrUtcDateTime) {
    let meta = rexiv2::Metadata::new_from_path(&path).unwrap();
    let date_time_str = match date_time {
        FixedOffsetOrUtcDateTime::Offset(date_time) => date_time.format("%Y:%m:%d %H:%M:%S").to_string(),
        FixedOffsetOrUtcDateTime::Utc(date_time) => date_time.format("%Y:%m:%d %H:%M:%S").to_string(),
    };
    meta.set_tag_string(DATE_TIME_ORIGINAL_TAG, &date_time_str).unwrap();
    meta.save_to_file(&path).unwrap();
}

lazy_static! {
    static ref WHATSAPP_DATE_TIME_RE: Regex = Regex::new(r"^IMG-(\d{8})-").unwrap();
}

fn date_time_from_filename(path: &PathBuf) -> Option<FixedOffsetOrUtcDateTime> {
    let filename = path.file_name().unwrap().to_str().unwrap();
    WHATSAPP_DATE_TIME_RE.captures(filename).and_then(|captures| {
        let date_str = captures.get(1).unwrap().as_str();
        let date = NaiveDate::parse_from_str(date_str, "%Y%m%d").ok()?;
        let naive_date_time = date.and_hms_opt(12, 0, 0)?;
        Some(FixedOffsetOrUtcDateTime::Utc(
            Utc.from_utc_datetime(&naive_date_time)
        ))
    })
}

pub fn date_time_from_path(path: &PathBuf) -> Option<FixedOffsetOrUtcDateTime> {
    date_time_from_metadata(path).or_else(|| date_time_from_filename(path))
}
