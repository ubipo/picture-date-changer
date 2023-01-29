# Picture Date Changer 🖼️📆

Change the date or time of multiple pictures at a time, with visual previews
and drag-and-drop reordering. 

## Development

### Dependencies

* [Rust](https://www.rust-lang.org/tools/install) (tested on 1.69.0)
* [Node.js](https://nodejs.org) (tested on 19.4.0)
* [Python 3](https://www.python.org/downloads/) (tested on 3.10.9)
* Tauri CLI: `cargo install tauri-cli`
* UI dependencies: `cd ui && npm install && cd ..`

### Run with hot reload

```bash
cargo tauri dev
```

### Build (/bundle)

```bash
cargo tauri build
```

### Architecture

The app is split into two parts: the `host` and the `ui`. The host is the
application entrypoint and is written in Rust, using
[rexiv2](https://felixcrux.com/files/doc/rexiv2/index.html) for file metadata
editing, [Chrono](https://docs.rs/chrono/latest/chrono/) for date/time,
[Tokio](https://docs.rs/tokio/latest/tokio/) for async, and
[magic-rust](https://docs.rs/crate/magick_rust/0.4.0) (wrapper around
[ImageMagick](https://imagemagick.org/index.php)) to preview/thumbnailify
images. It uses the [Tauri framework](https://tauri.app/) to interact with the
OS and to open a window for the UI WebView. The UI is written in
[TypeScript](https://www.typescriptlang.org/) and bundled with
[Vite](https://vitejs.dev/)/Rollup. It uses, among other libraries,
[React](https://reactjs.org/), [Tailwind](https://tailwindcss.com/),
[MUI](https://mui.com/material-ui/), and a
[Polyfill](https://www.npmjs.com/package/@js-temporal/polyfill) for the [Ecma
TC39 Temporal proposal](https://tc39.es/proposal-temporal/docs/).

The host and UI communicate via the [Tauri event
system](https://tauri.app/v1/guides/features/events/). The specification for
this two-way API is defined in `host/src/host_ui_bridge.rs`. On build, the
`host/generate_bindings.py` script automatically generates  TypeScript
definitions for the UI (saved in
`ui/src/host_ui_bridge/generated-bindings.d.ts`).

The UI is purposefully thin and simply reflects the state on the host. This
state is initialized in `host/src/main.rs` and updated in response to messages
from the UI in `host/src/handle_message_to_host.rs`. 

### Picdates

The [picdates library](picdates/ReadMe.md) (in `picdates/`) is a Node.js module
to extract and change the date of a picture. Since switching from electron to
tauri, it is no longer used but kept for reference. See
`host/src/media_datetime.rs` for the ported Rust code.

## License

Code copyright 2023 - Pieter Fiers & Tomas Fiers

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License version 3 as published by the Free
Software Foundation. The license is included in the source code in `License.txt`
or online at https://www.gnu.org/licenses/.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.
