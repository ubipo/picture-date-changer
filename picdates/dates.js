// Just a wrapper around the dayjs API, with more semantic names

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

export const parse = (str, fmt) => dayjs(str, fmt)
export const now = () => dayjs()
