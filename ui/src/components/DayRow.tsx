import { PlainDate } from "../dateTime";
import { hostUiBridge } from "../host-ui-bridge";
import { MediaWithDateTime } from "../host-ui-bridge/extra-types";
import LazyMedia from "./LazyMedia";
import MediaDateTimePicker from "./MediaDateTimePicker";

function DayRowMedia(
    { media }: { media: MediaWithDateTime }
) {
    return <div className="relative inline-block h-full group">
        <LazyMedia media={media} />
        {/*  invisible group-hover:visible */}
        <div className='absolute bottom-1 right-1'>
            <MediaDateTimePicker
                media={media}
                onPicked={newDateTime => {
                    console.log(`Picked new date time: ${newDateTime.toString()}`)
                    hostUiBridge.emit('changeMediaDateTime', {
                        path: media.path,
                        // Don't include timeZoneName as it cannot be parsed by
                        // rust's chrono::DateTime::parse_from_rfc3339
                        // TODO: Maybe transmit the time zone name separately?
                        newDateTime: newDateTime.toString({ timeZoneName: 'never' })
                    })
                }} />
        </div>
    </div>
}

export default function DayRow(
    { date, medias }: { date: PlainDate, medias: MediaWithDateTime[] }
) {
    return <div className='flex flex-col mb-2 overflow-auto'>
        <h4>{date.toLocaleString(undefined, { dateStyle: 'medium' })}</h4>
        <div className='inline-flex flex-row h-60 gap-2'>
            {medias.map(media => <DayRowMedia key={media.path} media={media} /> )}
        </div>
    </div>
}
