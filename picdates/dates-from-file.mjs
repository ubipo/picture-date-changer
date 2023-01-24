import { readFileSync } from 'fs'
import { extname, basename } from 'path'
import piexif from 'piexifjs'
import { parse } from './dates.mjs'


/**
 * Given the path to a picture or movie file, try to extract the date it was taken
 * from the filename and, (for JPEG files only), the Exif metadata.
 *
 * The values of the returned object are either a DayJS datetime object, or the
 * `NOTFOUND` string.
 */
export const extractDates = (path) => {
    const filename = basename(path)  // (includes extension)
    return {
        dateFromFilename: dateFromFilename(filename),
        dateFromExif: dateFromExif(path),
    }
}
export const NOTFOUND = "(not found)"


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
    // There's also `exif['0th'][piexif.ImageIFD.DateTime]`
    // but that is either the same; or a later date (date downloaded from camera to PC?)
    return parse(str, 'YYYY:MM:DD HH:MM:SS')
}
const isJPEG = (path) => [".jpg", ".jpeg"].includes(lowercaseExtension(path))
const lowercaseExtension = (path) => extname(path).toLowerCase()

const exifOfJPEG = (path) => piexif.load(readJPEGAsBase64(path))
const readJPEGAsBase64 = (path) => readFileSync(path).toString('binary')
