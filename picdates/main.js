import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)
import piexif from 'piexifjs'
import {markdownTable} from 'markdown-table'

const NOTFOUND = "(not found)"

const filenameDatePattern = /\d{8}/
// All filename dates in client example have this format: yyyymmdd
// (WhatsApp photos otoh have yyyy-mm-dd)

const dateFromFilename = (filename) => {
    const result = filenameDatePattern.exec(filename)
    if (result === null) return NOTFOUND
    const extracted = result[0]
    return dayjs(extracted, 'YYYYMMDD')
}

const readJPEGAsBase64 = (filepath) => fs.readFileSync(filepath).toString('binary')
const exifOfJPEG = (filepath) => piexif.load(readJPEGAsBase64(filepath))

const lowercaseExtension = (filepath) => path.extname(filepath).toLowerCase()
const isJPEG = (filepath) => [".jpg", ".jpeg"].includes(lowercaseExtension(filepath))

const dateFromExif = (filepath) => {
    if (!isJPEG(filepath)) return NOTFOUND
    let exif
    try { exif = exifOfJPEG(filepath) }
    catch (e) { return NOTFOUND }
    const str = exif['Exif'][piexif.ExifIFD.DateTimeOriginal]
    // There's also `exif['0th'][piexif.ImageIFD.DateTime]`
    // but that is either the same; or a later date (date downloaded from camera to PC?)
    return dayjs(str, 'YYYY:MM:DD HH:MM:SS')
}

const extractDates = (filepath) => {
    const filename = path.basename(filepath)  // (includes extension, but that's ok)
    return {
        filename: filename,
        dateFromFilename: dateFromFilename(filename),
        dateFromExif: dateFromExif(filepath),
    }
}

const dir = "/mnt/c/Users/tfiers/Desktop/voorbeeld-fotos-client"
const filenames = fs.readdirSync(dir)
const filepaths = filenames.map(filename => path.join(dir, filename))
const dateInfo = filepaths.map(extractDates)

const toHumanString = (x) => {
    if (x instanceof dayjs) return x.format("YYYY-MM-DD")
    return x
}
const applyToValues = (f, obj) => Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key, f(val)])
)
const humanize = (obj) => applyToValues(toHumanString, obj)
const humanDateInfo = dateInfo.map(humanize)

const header = Object.keys(humanDateInfo[0])
const rows = [header, ...humanDateInfo.map(Object.values)]
const md = markdownTable(rows)
fs.writeFileSync("picdates/output.md", md)
