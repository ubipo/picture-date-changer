import { Temporal } from '@js-temporal/polyfill'

export const Instant = Temporal.Instant
export type Instant = Temporal.Instant
export const ZonedDateTime = Temporal.ZonedDateTime
export type ZonedDateTime = Temporal.ZonedDateTime
export const PlainDate = Temporal.PlainDate
export type PlainDate = Temporal.PlainDate
export const PlainYearMonth = Temporal.PlainYearMonth
export type PlainYearMonth = Temporal.PlainYearMonth

export type Iso8601DateTime = string

export const compareIso8601 = (
    a: Iso8601DateTime, b: Iso8601DateTime
) => Instant.compare(Instant.from(a), Instant.from(b))

export const toInstant = (iso8601: Iso8601DateTime) => Instant.from(iso8601)

export const getLocalZone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const toLocalDateTime = (
    iso8601: Iso8601DateTime
) => Instant.from(iso8601).toZonedDateTimeISO(getLocalZone())
