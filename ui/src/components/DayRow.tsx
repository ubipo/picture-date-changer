import { PlainDate } from "../dateTime";
import { MediaWithDateTime } from "../host-ui-bridge/extra-types";
import LazyMedia from "./LazyMedia";

export default function DayRow(
    { date, medias }: { date: PlainDate, medias: MediaWithDateTime[] }
) {
    return <div className='flex flex-col mb-2 overflow-auto'>
        <h4>{date.toLocaleString(undefined, { dateStyle: 'medium' })}</h4>
        <div className='flex flex-row h-60'>
            {medias.map(media =>
                <LazyMedia media={media} key={media.path} />
            )}
        </div>
    </div>
}
