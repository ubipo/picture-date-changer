import dayjs from 'dayjs'
import { markdownTable } from 'markdown-table'

export const formatDate = (x) => {
    if (x instanceof dayjs) return x.format("YYYY-MM-DD")
    return x
}

/**
 * Convert "myLongString" to "my long string"
 */
export const camelCaseToSpaced = (str) =>
    str.replace(/([^A-Z])([A-Z])/g, "$1 $2").toLowerCase()

const mapEntries = (obj, {keys = identity, vals = identity} = {}) => {
    // Rename the functions transforming keys and values, so it's more clear they're
    // functions
    const [f, g] = [keys, vals]
    const transform = ([key, val]) => [f(key), g(val)]
    return Object.fromEntries(Object.entries(obj).map(transform))
}
const identity = x => x

export const humanize = (obj) => (
    mapEntries(obj, {
        keys: camelCaseToSpaced,
        vals: formatDate
    })
)
// (can't provide these two funcs as optional arguments:
//  cannot be used then as `.map(humanize)`)

/**
 * Render an array of similar objects as a string containing a markdown table
 */
export function toMarkdownTable(data) {
    const header = Object.keys(data[1])
    const rows = [header, ...data.map(Object.values)]
    return markdownTable(rows)
}
