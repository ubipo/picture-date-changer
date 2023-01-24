import { join } from 'path'
import { writeFileSync } from 'fs';
import { labelledFilenames, trueDates } from './client-labels.js'
import { extractDates } from "../dates-from-file.js";
import { humanize, toMarkdownTable } from "../humanize.js";
import { now } from '../dates.js';

const pictureDir = "/mnt/c/Users/tfiers/Desktop/voorbeeld-fotos-client"
const path = (filename) => join(pictureDir, filename)

const fileDates = labelledFilenames.map(filename => ({
    filename,
    trueDate: trueDates[filename],
    ...extractDates(path(filename)),
}))
const compareBy = (f) => ((a, b) => f(a) - f(b))
fileDates.sort(compareBy(obj => obj['trueDate'].unix()))

const table = toMarkdownTable(fileDates.map(humanize))

// No __dirname & __filename in an 'ES module', alas.
const mydir = "picdates/test-data"
const mypath = join(mydir, "main.js")

const md = `
${table}

[File generated by \`${mypath}\` on ${now()}]
`
writeFileSync(join(mydir, "output.md"), md)