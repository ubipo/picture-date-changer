import { DragEvent, ReactNode, useState } from "react"

export enum SideDropZonePosition {
    LEFT,
    RIGHT
}

/**
 * Wrapper component that adds a drop zone next to the wrapped component (left
 * or right).
 */
export default function WithSideDropZone(
    { className, position, onDrop, hideZone, children }: {
        className?: string,
        position: SideDropZonePosition,
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
        {position === SideDropZonePosition.LEFT ? visibleDropZone : null}
        {children}
        {position === SideDropZonePosition.RIGHT ? visibleDropZone : null}
        <div
            className="absolute top-0 h-full"
            style={{
                left: position === SideDropZonePosition.LEFT ? `-${EXTRA_WIDTH_SIDES}rem` : undefined,
                right: position === SideDropZonePosition.RIGHT ? `-${EXTRA_WIDTH_SIDES}rem` : undefined,
                width: `${(isDraggedOver ? WIDTH_DRAGGED_OVER : WIDTH_DEFAULT) + EXTRA_WIDTH_SIDES * 2}rem`,
                zIndex: 10,
            }}
            // preventDefault() on 'dragover' event is needed to allow dropping
            onDragOver={e => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={e => {
                e.preventDefault()
                setIsDraggedOver(false)
                onDrop(e)
            }}
            onDragEnter={() => setIsDraggedOver(true)}
            onDragLeave={() => setIsDraggedOver(false)}>
        </div>
    </div>
}
