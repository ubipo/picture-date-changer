import { compareIso8601, toLocalDateTime } from './dateTime.js'
import { MediaFile, MediaFileWithDateTime } from './MediaFile.js'

export type DayOfMonthMedia = { day: number, media: MediaFile[] }
export type MonthOfYearMedia = { month: number, days: DayOfMonthMedia[] }
export type YearMedia = { year: number, months: MonthOfYearMedia[] }

const numberKeyEntries = <T extends Record<string, any>>(obj: T) =>
  Object.entries(obj).map(
    ([key, value]) => [Number(key), value]
  ) as T extends Record<number, infer V> ? [number, V][] : never

export const organizeMediaByDate = (
    media: MediaFileWithDateTime[]
): YearMedia[] => numberKeyEntries(
    media.reduce((years, media) => {
        const dateTime = toLocalDateTime(media.dateTime)
        const [year, month, day] = [dateTime.year, dateTime.month, dateTime.day]
        const months = years[year] ?? []
        const days = months[month] ?? []
        const dayMedia = days[day] ?? []
        dayMedia.push(media)
        return { ...years, [year]: { ...months, [month]: { ...days, [day]: dayMedia } } }
    }, {} as Record<number, Record<number, Record<number, MediaFileWithDateTime[]>>>)
).map(([year, months]) => ({
    year,
    months: numberKeyEntries(months).map(([month, days]) => ({
        month,
        days: numberKeyEntries(days).map(([day, media]) => ({
            day,
            media: media.sort((a, b) => compareIso8601(a.dateTime, b.dateTime))
        })).sort((a, b) => a.day - b.day)
    })).sort((a, b) => a.month - b.month)
})).sort((a, b) => a.year - b.year)