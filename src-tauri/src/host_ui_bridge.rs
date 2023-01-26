use ts_rs::TS;
use serde::{Serialize, Deserialize};

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

bridge_items! (
    #[serde(tag = "kind")]
    pub enum ToHostMessage {
        AddMedia,
        ChangeMediaDateTime { path: String, new_date_time: String },
    },

    #[serde(tag = "kind")]
    pub enum ToUiMessage {
        MediaLoading,
        MediaLoadingComplete,
        MediaLoadingError,
    }
);
