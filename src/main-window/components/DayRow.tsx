import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { MediaFile } from "src/common/MediaFile";

export default function DayRow(
    { date, mediaFiles }: { date: Dayjs, mediaFiles: MediaFile[] }
) {
    return <div className='flex flex-col mb-2 overflow-auto'>
        <h4>{dayjs(date).format('ddd, DD MMM YYYY')}</h4>
        <div className='flex flex-row h-60'>
            {mediaFiles.map(mediaFiles =>
                <img className='h-full' key={mediaFiles.path} src={mediaFiles.dataUri} />
            )}
        </div>
    </div>
}
