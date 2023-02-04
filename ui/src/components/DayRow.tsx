import { DragEvent, ReactNode, useState } from "react";
import { PlainDate } from "../service/dateTime";
import { hostUiBridge } from "../host-ui-bridge";
import { MediaWithDateTime } from "../host-ui-bridge/extra-types";
import LazyMedia from "./LazyMedia";
import MediaDateTimePicker from "./MediaDateTimePicker";
import { getDataTransferPath } from "../service/dragDrop";

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

enum DragZonePosition {
    LEFT,
    RIGHT
}

/**
 * Wrapper component that adds a drop zone next to the wrapped component (left
 * or right).
 */
function WithSideDropZone(
    { className, position, onDrop, hideZone, children }: {
        className?: string,
        position: DragZonePosition,
        hideZone: boolean,
        onDrop: (event: DragEvent<HTMLDivElement>) => void,
        children: ReactNode,
    }
) {
    const WIDTH_DEFAULT = 0.5 // rem
    const WIDTH_DRAGGED_OVER = 1
    // Extra space on both sides of the drop zone to make it easier to drop
    const EXTRA_WIDTH_SIDES = 1
    const [isDraggedOver, setIsDraggedOver] = useState(false)

    const visibleDropZone = <div
        className={`
            h-full
            transition-all duration-75
            ${isDraggedOver ? 'bg-slate-300' : ''}
        `}
        style={{
            width: `${(isDraggedOver ? WIDTH_DRAGGED_OVER : (hideZone ? 0 : WIDTH_DEFAULT))}rem`
        }}
        >
    </div>

    return <div className={`${className ?? ''} flex flex-row relative`}>
        {position === DragZonePosition.LEFT ? visibleDropZone : null}
        {children}
        {position === DragZonePosition.RIGHT ? visibleDropZone : null}
        <div
            className="absolute top-0 h-full"
            style={{
                left: position === DragZonePosition.LEFT ? `-${EXTRA_WIDTH_SIDES}rem` : undefined,
                right: position === DragZonePosition.RIGHT ? `-${EXTRA_WIDTH_SIDES}rem` : undefined,
                width: `${(isDraggedOver ? WIDTH_DRAGGED_OVER : WIDTH_DEFAULT) + EXTRA_WIDTH_SIDES * 2}rem`,
                zIndex: 1000,
                background: 'red'
            }}
            // preventDefault() on 'dragover' event is needed to allow dropping
            onDragOver={e => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={e => {
                console.log('Dropped!', e.dataTransfer)
                e.preventDefault()
                setIsDraggedOver(false)
                onDrop(e)
            }}
            onDragEnter={() => setIsDraggedOver(true)}
            onDragLeave={() => setIsDraggedOver(false)}>
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
        console.log('Dropped!', event.dataTransfer)
        const mediaPath = getDataTransferPath(event.dataTransfer)
        console.log('Media dropped!', mediaPath, mediaBefore, mediaAfter)
    }

    return <div className='flex flex-col mb-2'>
        <h4>{date.toLocaleString(undefined, { dateStyle: 'medium' })}</h4>
        <div className='flex flex-row flex-wrap gap-y-2 justify-start'>
            {medias.map((media, mediaIndex) => (
                <WithSideDropZone
                    key={media.path}
                    position={DragZonePosition.RIGHT}
                    hideZone={mediaIndex === medias.length - 1}
                    onDrop={e => handleMediaDrop(e, media, medias[mediaIndex + 1])}>
                    {mediaIndex === 0
                        ? <WithSideDropZone
                            position={DragZonePosition.LEFT}
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
