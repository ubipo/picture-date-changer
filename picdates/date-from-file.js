import { readFileSync } from 'fs'
import { extname, basename } from 'path'
import piexif from 'piexifjs'
import { parse } from './dates.js'

/**
 * Given the path to a picture or movie file, try to find the date it was taken.
 *
 * If the file is a JPEG, look in the file's Exif metadata for the 'Date taken' attribute.
 * If it is not a JPEG, or if that metadata is not found, look for a date in the filename.
 * If that is not found either, return `null`. Else, return a 'dayjs' datetime object.
 */
export const extractDate = (path) => {
    if (isJPEG(path)) {
        const date = dateFromExif(path)
        if (date != NOTFOUND) return date
    }
    const filename = basename(path)
    const date = dateFromFilename(filename)
    if (date == NOTFOUND) return null
    return date
}

export const extractDates = (path) => {
    const filename = basename(path)  // (includes extension)
    return {
        dateFromFilename: dateFromFilename(filename),
        dateFromExif: dateFromExif(path),
    }
}

const NOTFOUND = "(not found)"


const dateFromFilename = (filename) => {
    const result = filenameDatePattern.exec(filename)
    if (result === null) return NOTFOUND
    const extracted = result[0]
    return parse(extracted, 'YYYYMMDD')
}
const filenameDatePattern = /\d{8}/
// All filename dates in client example have this format: yyyymmdd
// (WhatsApp photos otoh have yyyy-mm-dd)


const dateFromExif = (path) => {
    if (!isJPEG(path)) return NOTFOUND
    let exif
    try { exif = exifOfJPEG(path) }
    catch (e) { return NOTFOUND }
    const str = exif['Exif'][piexif.ExifIFD.DateTimeOriginal]
    if (str === undefined) return NOTFOUND
    // There's also `exif['0th'][piexif.ImageIFD.DateTime]`
    // but that is either the same; or a later date (date downloaded from camera to PC?)
    return parse(str, 'YYYY:MM:DD HH:mm:ss')
}
const isJPEG = (path) => [".jpg", ".jpeg"].includes(lowercaseExtension(path))
const lowercaseExtension = (path) => extname(path).toLowerCase()

const exifOfJPEG = (path) => piexif.load(readJPEGAsBase64(path))
const readJPEGAsBase64 = (path) => readFileSync(path).toString('binary')
