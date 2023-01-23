import { contextBridge, ipcRenderer } from 'electron'
import PictureDateChangerAPI from '../common/PictureDateChangerAPI'

const pictureDateChangerAPI: PictureDateChangerAPI = {
    addNewImages: () => ipcRenderer.invoke('showOpenDialog'),
}

contextBridge.exposeInMainWorld('pictureDateChangerAPI', pictureDateChangerAPI)
console.log('Preload exposed')
