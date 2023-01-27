import { PlainDate } from "../dateTime";
import { MediaWithDateTime } from "../host-ui-bridge/extra-types";
import LazyMedia from "./LazyMedia";

export default function DayRow(
    { date, medias }: { date: PlainDate, medias: MediaWithDateTime[] }
) {
    return <div className='flex flex-col mb-2 overflow-auto'>
        <h4>{date.toLocaleString(undefined, { dateStyle: 'medium' })}</h4>
        <div className='inline-flex flex-row h-60 gap-2'>
            {medias.map(media =>
                <div className="relative inline-block h-full group" key={media.path}>
                    <LazyMedia media={media} />
                    <span className='absolute top-0 right-0 hidden group-hover:block'>
                        Edit
                    </span>
                </div>
            )}
        </div>
    </div>
}
