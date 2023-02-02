use tauri::{AppHandle, Manager};
use ts_rs::TS;
use serde::{Serialize, Deserialize};

pub const RX_EVENT_NAME: &str = "host-ui-bridge-ui-to-host";
pub const TX_EVENT_NAME: &str = "host-ui-bridge-host-to-ui";

macro_rules! bridge_items {
    ($struct:item) => {
        #[derive(TS, Clone, Serialize, Deserialize, Debug)]
        #[ts(export)]
        #[serde(rename_all = "camelCase")]
        $struct
    };

    ($struct:item, $( $other_structs:item ),*) => {
        bridge_items!($struct);
        bridge_items!($($other_structs),+);
    };
}

// UI -> Host
bridge_items! (
    pub struct Media {
        pub path: String,
        pub date_time: Option<String>,
    },

    pub struct ChangeMediaDateTimePayload {
        pub path: String,
        pub new_date_time: String,
    },

    pub struct LoadMediaPreviewPayload {
        pub path: String,
    },

    #[serde(tag = "kind")]
    pub enum MessageToHost {
        SendLatestMedia,
        AddMedia,
        ChangeMediaDateTime { payload: ChangeMediaDateTimePayload },
        LoadMediaPreview { payload: LoadMediaPreviewPayload },
    }
);

// Host -> UI
bridge_items! (
    pub struct MediaLoadingCompletePayload {
        pub new_media: Vec<Media>,
    },

    pub struct MediaPreviewSuccess {
        pub data_uri: String,
    },

    pub enum MediaPreviewLoadedResult {
        // ts-rs doesn't handle serde attributes (camelCase) on enum variants
        Success(MediaPreviewSuccess),
        Error { message: String },
    },

    pub struct MediaPreviewLoadedPayload {
        pub path: String,
        pub result: MediaPreviewLoadedResult,
    },

    #[serde(tag = "kind")]
    pub enum MessageToUi {
        MediaLoading,
        MediaLoadingComplete { payload: MediaLoadingCompletePayload },
        MediaLoadingError { message: String },
        MediaPreviewLoaded { payload: MediaPreviewLoadedPayload },
    }
);

pub trait ToUiSender {
    fn send_to_ui(&self, message: MessageToUi);
}

impl ToUiSender for AppHandle {
    fn send_to_ui(&self, message: MessageToUi) {
        self.emit_all(TX_EVENT_NAME, message).unwrap_or_else(|err| {
            eprintln!("Error sending message to UI: {:?}", err);
        });
    }
}
