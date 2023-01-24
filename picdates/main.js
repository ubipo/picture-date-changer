const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const piexif = require('piexifjs');

const dir = "/mnt/c/Users/tfiers/Desktop/voorbeeld-fotos-client"
const filenames = fs.readdirSync(dir)

const filenameDatePattern = /\d{8}/
// All filename dates in client example have this format: yyyymmdd
// (WhatsApp photos otoh have yyyy-mm-dd)

const dateFromFilename = (filename) => {
    const result = filenameDatePattern.exec(filename)
    if (result === null) return null
    const extracted = result[0]
    return dayjs(extracted, 'YYYYMMDD')
}

const readJPEGAsBase64 = path => fs.readFileSync(path).toString('binary')
const exifOfJPEG = path => piexif.load(readJPEGAsBase64(path))

const lowercaseExtension = filepath => path.extname(filepath).toLowerCase()
const isJPEG = filepath => [".jpg", ".jpeg"].includes(lowercaseExtension(filepath))

const dateFromExif = (filepath) => {
    if (!isJPEG(filepath)) return null
    let exif
    try { exif = exifOfJPEG(filepath) }
    catch (e) { return null }
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

const filepaths = filenames.map(filename => path.join(dir, filename))
const dateInfo = filepaths.map(extractDates)

const prettify = (x) => {
    if (x instanceof dayjs) return x.format("YYYY-MM-DD")
    return x
}
applyToEntries = (f, obj) => Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key, f(val)])
)
prettifyEntries = (obj) => applyToEntries(prettify, obj)
prettyDateInfo = dateInfo.map(prettifyEntries)
json = JSON.stringify(prettyDateInfo, null, 4)
fs.writeFileSync("picdates/output.json", json)
