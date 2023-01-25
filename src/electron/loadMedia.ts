import fs from 'node:fs/promises'
import { fileTypeFromBuffer } from './file-type.cjs'

import { MediaFile } from "../common/MediaFile"
import { extractDate } from './picdates.cjs'
import { BrowserWindow, dialog } from 'electron'
import { getFilePathOrDirFilePaths } from './filePaths.js'

export async function filePathToMediaFile(filePath: string): Promise<MediaFile | null> {
    const fileContent = await fs.readFile(filePath)
    const type = await fileTypeFromBuffer(fileContent)
    if (!type) return null
    const contentBase64 = fileContent.toString('base64')
    const dateTime = await extractDate(filePath)
    return {
        path: filePath,
        dataUri: `data:${type.mime};base64,${contentBase64}`,
        dateTime: dateTime === null ? null : dateTime.toISOString()
    }
}

export async function loadImagesWithFilePicker(
    win: BrowserWindow,
    onLoadStart?: () => void,
): Promise<MediaFile[]> {
    const openResult = await dialog.showOpenDialog(win, { properties: ["openDirectory"] })
    if (openResult.canceled) return []
    const filePaths = (await Promise.all(
        openResult.filePaths.map(getFilePathOrDirFilePaths)
    )).flat()
    if (onLoadStart) onLoadStart()
    const mediaFiles = (await Promise.all(filePaths.map(filePathToMediaFile)))
        .filter(imgUrl => imgUrl != null) as MediaFile[]
    return mediaFiles
}
