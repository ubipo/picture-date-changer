# Picture Date Changer

Change the date or time of multiple pictures at a time, with visual previews
and drag-and-drop reordering. 

## Picdates

The picdates library (in `picdates/`) is a Node.js module to extract and change
the date of a pictures. Since switching from electron to tauri, it is no longer
used but kept for reference. See `host/src/media_datetime.rs` for the ported
Rust code.

## Development

### Run with hot reload

```bash
cargo tauri dev
```
