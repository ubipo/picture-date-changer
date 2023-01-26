import { YearMedia } from "../organizeMediaByDate";
import { PlainDate, PlainYearMonth } from "../dateTime";
import DayRow from "./DayRow";

export default function YearsScrollView(
    { yearsMedia }: { yearsMedia: YearMedia[]}
) {
    return <section className='m-2 mr-0'>
        {yearsMedia.map(({ year, months }) =>
            <section key={year}>
                <h2>{year}</h2>
                {months.map(({ month, days }) =>
                    <section key={month}>
                        <h3>{PlainYearMonth.from({ year, month }).toLocaleString()}</h3>
                        {days.map(({ day, media }) =>
                            <DayRow key={day}
                                    date={PlainDate.from({ year, month, day })}
                                    mediaFiles={media} />
                        )}
                    </section>
                )}
            </section>
        )}
    </section>
}
