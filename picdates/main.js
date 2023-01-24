import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)
import piexif from 'piexifjs'
import {markdownTable} from 'markdown-table'
import {clientLabels} from './client-labels.js'

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
        dateFromFilename: dateFromFilename(filename),
        dateFromExif: dateFromExif(filepath),
    }
}

const trueDates = {}
clientLabels.forEach(day => {
    day['filenames'].forEach(filename => {
        trueDates[filename] = dayjs(day['date'], "YYYY-MM-DD")
    })
})
const labelledFilenames = Object.keys(trueDates)

const pictureDir = "/mnt/c/Users/tfiers/Desktop/voorbeeld-fotos-client"
const toPath = (filename) => path.join(pictureDir, filename)

const fileDates = labelledFilenames.map(filename => ({
    filename,
    trueDate: trueDates[filename],
    ...extractDates(toPath(filename)),
}))
const compareBy = (f) => ((a, b) => f(a) - f(b))
fileDates.sort(compareBy(obj => obj['trueDate'].unix()))

const formatDate = (x) => {
    if (x instanceof dayjs) return x.format("YYYY-MM-DD")
    return x
}
const camelCaseToSpaced = (str) => str.replace(/([^A-Z])([A-Z])/g, "$1 $2").toLowerCase()

const identity = x => x
const mapEntries = (obj, {keys = identity, vals = identity} = {}) => Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [keys(key), vals(val)])
)

const humanize = (obj) => mapEntries(obj, {keys: camelCaseToSpaced, vals: formatDate})
const humanFileDates = fileDates.map(humanize)

const header = Object.keys(humanFileDates[0])
const rows = [header, ...humanFileDates.map(Object.values)]
const md = markdownTable(rows)
fs.writeFileSync("picdates/output.md", md)
