import { PlainDate } from "../dateTime";
import { MediaFile } from "../MediaFile";

export default function DayRow(
    { date, mediaFiles }: { date: PlainDate, mediaFiles: MediaFile[] }
) {
    return <div className='flex flex-col mb-2 overflow-auto'>
        <h4>{date.toLocaleString(undefined, { dateStyle: 'medium' })}</h4>
        <div className='flex flex-row h-60'>
            {mediaFiles.map(mediaFiles =>
                <img className='h-full' key={mediaFiles.path} src={mediaFiles.dataUri} />
            )}
        </div>
    </div>
}
