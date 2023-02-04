import { DragEvent } from "react";
import { PlainDate } from "../service/dateTime";
import { hostUiBridge } from "../host-ui-bridge";
import { MediaWithDateTime } from "../host-ui-bridge/extra-types";
import LazyMedia from "./LazyMedia";
import MediaDateTimePicker from "./MediaDateTimePicker";
import { getDataTransferPath } from "../service/dragDrop";
import WithSideDropZone, { SideDropZonePosition } from "./WithSideDropZone";

function DayRowMedia(
    { media }: { media: MediaWithDateTime }
) {
    return <div className="h-full group relative">
        <LazyMedia media={media} />
        <div className='absolute bottom-1 right-1' style={{ zIndex: 11 }}>
            <MediaDateTimePicker
                media={media}
                onPicked={newDateTime => {
                    console.log(`Picked new date time: ${newDateTime.toString()}`)
                    hostUiBridge.emit('changeMediaDateTimeExact', {
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
    function handleMediaDrop(
        event: DragEvent<HTMLDivElement>,
        mediaBefore: MediaWithDateTime,
        mediaAfter: MediaWithDateTime,
    ) {
        const targetPath = getDataTransferPath(event.dataTransfer)
        if (targetPath == null) {
            console.warn('No path in data transfer')
            return
        }
        console.log('Media dropped!', targetPath, mediaBefore, mediaAfter)
        hostUiBridge.emit('changeMediaDateTimeInterpolated', {
            beforePath: mediaBefore.path,
            targetPath,
            afterPath: mediaAfter.path,
        })
    }

    return <div className='flex flex-col mb-2'>
        <h4>{date.toLocaleString(undefined, { dateStyle: 'medium' })}</h4>
        <div className='flex flex-row flex-wrap gap-y-2 justify-start'>
            {medias.map((media, mediaIndex) => (
                <WithSideDropZone
                    key={media.path}
                    position={SideDropZonePosition.RIGHT}
                    hideZone={mediaIndex === medias.length - 1}
                    onDrop={e => handleMediaDrop(e, media, medias[mediaIndex + 1])}>
                    {mediaIndex === 0
                        ? <WithSideDropZone
                            position={SideDropZonePosition.LEFT}
                            hideZone={true}
                            onDrop={e => handleMediaDrop(e, medias[medias.length - 1], media)}>
                            <DayRowMedia media={media} />
                        </WithSideDropZone>
                        : <DayRowMedia media={media} />}
                </WithSideDropZone>
            ))}
        </div>
    </div>
}
