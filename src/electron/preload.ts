import { contextBridge, ipcRenderer } from 'electron'
import PictureDateChangerAPI from '../common/PictureDateChangerAPI.js'

const pictureDateChangerAPI: PictureDateChangerAPI = {
    addNewImages: () => ipcRenderer.invoke('showOpenDialog'),
}

contextBridge.exposeInMainWorld('pictureDateChangerAPI', pictureDateChangerAPI)
console.log('Preload exposed')
