import dayjs from 'dayjs'
import { markdownTable } from 'markdown-table'

/**
 * Convert "myLongString" to "my long string"
 */
export const camelCaseToSpaced = (str) =>
    str.replace(/([^A-Z])([A-Z])/g, "$1 $2").toLowerCase()

/**
 * Given a Dayjs object, format it as an ISO8601 date. Other types are left as is.
 */
export const formatDate = (x) => {
    if (x instanceof dayjs) return x.format("YYYY-MM-DD")
    return x
}

/**
 * Render an array of objects as a markdown table (which is returned as a string)
 *
 * The objects are assumed to all have the same keys.
 * Those keys are used as the table header.
 */
export function toMarkdownTable(data) {
    const header = Object.keys(data[1])
    const rows = [header, ...data.map(Object.values)]
    return markdownTable(rows)
}

export const humanize = (obj) => (
    mapEntries(obj, {
        keys: camelCaseToSpaced,
        vals: formatDate
    })
)
// (can't provide the keys and vals funcs as optional arguments:
//  this func could then not be used as `.map(humanize)`)

/**
 * Transform the given object by applying the `keys` function to each of its keys, and
 * the `vals` function to each of its values.
 */
const mapEntries = (obj, {keys = identity, vals = identity} = {}) => {
    // Rename the two functions that transform keys and values, so that it's more clear
    // they're functions
    const [f, g] = [keys, vals]
    const transform = ([key, val]) => [f(key), g(val)]
    return Object.fromEntries(Object.entries(obj).map(transform))
}
const identity = x => x
