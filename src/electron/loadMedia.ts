import fs from 'node:fs/promises'
import { fileTypeFromBuffer } from './file-type.cjs'

import { MediaFile } from "../common/MediaFile"
import { extractDate } from './picdates.cjs'

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
