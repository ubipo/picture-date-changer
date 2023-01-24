import { Day } from "./Day";

export default interface PictureDateChangerAPI {
    addNewImages: () => Promise<Day[]>,
}

declare global {
    interface Window {
        pictureDateChangerAPI: PictureDateChangerAPI
    }
}
