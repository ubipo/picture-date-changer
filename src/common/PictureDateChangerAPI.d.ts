export default interface PictureDateChangerAPI {
    addNewImages: () => Promise<string[]>,
}

declare global {
    interface Window {
        pictureDateChangerAPI: PictureDateChangerAPI
    }
}
