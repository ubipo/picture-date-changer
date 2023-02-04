import { CircularProgress } from "@mui/material";
import { DragEvent, useEffect, useState } from "react";
import { hostUiBridge } from "../host-ui-bridge";
import { Media } from "../host-ui-bridge/generated-bindings";

class MediaLoadError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MediaLoadError'
    }
}

const mediaPreviewCache = new Map<string, string>()

export default function LazyMedia(
    { media }: { media: Media }
) {
    const dataUriFromCache = mediaPreviewCache.get(media.path)
    const [dataUri, setDataUri] = useState<string | undefined | MediaLoadError>(dataUriFromCache)

    function handleDragStart(event: DragEvent<HTMLDivElement>) {
        // We do not support anything else than moving
        // This overrides whatever the user requested using modifier keys
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.setData('media-path', media.path)
    }

    useEffect(() => {
        if (dataUri != null) return

        const removerPromise = hostUiBridge.on(
            'mediaPreviewLoaded',
            ({ path, result }) => {
                if (path === media.path) {
                    if ("error" in result) {
                        console.error('Error loading media preview', result.error)
                        setDataUri(new MediaLoadError(result.error.message))
                    } else {
                        setDataUri(result.success.dataUri)
                        mediaPreviewCache.set(media.path, result.success.dataUri)
                    }
                    removerPromise.then(remover => remover())
                }
            }
        )
        hostUiBridge.emit('loadMediaPreview', { path: media.path })
        return () => { removerPromise.then(remover => remover()) }
    }, [])

    return (
        <div className="h-60 bg-slate-100 cursor-pointer"
             draggable="true"
             onDragStart={handleDragStart}>
            { dataUri == null
                ? <div className="h-full aspect-square flex justify-center items-center">
                    <CircularProgress />
                </div>
                : (
                    dataUri instanceof MediaLoadError
                    ? <div className="h-full aspect-square flex justify-center items-center">
                        <div className="text-red-500">
                            <p>Error loading preview: </p>
                            <p>{dataUri.message}</p>
                        </div>
                    </div>
                    : <img className="h-full" src={dataUri} />
                )
            }
        </div>
    )
}
