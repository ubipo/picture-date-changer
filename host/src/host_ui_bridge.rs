use ts_rs::TS;
use serde::{Serialize, Deserialize};

pub const EVENT_NAME: &str = "host-ui-bridge";

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

    pub struct MediaLoadingErrorPayload {
        pub error: String,
    },

    pub struct MediaPreviewLoadedPayload {
        pub path: String,
        pub data_uri: String,
    },

    pub struct MediaPreviewLoadErrorPayload {
        pub path: String,
        pub error: String,
    },

    #[serde(tag = "kind")]
    pub enum MessageToUi {
        MediaLoading,
        MediaLoadingComplete { payload: MediaLoadingCompletePayload },
        MediaLoadingError { error: MediaLoadingErrorPayload },
        MediaPreviewLoaded { payload: MediaPreviewLoadedPayload },
        MediaPreviewLoadError { payload: MediaPreviewLoadErrorPayload },
    }
);
