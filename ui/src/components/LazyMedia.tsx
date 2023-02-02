import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { hostUiBridge } from "../host-ui-bridge";
import { Media } from "../host-ui-bridge/generated-bindings";

class MediaLoadError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MediaLoadError'
    }
}

export default function LazyMedia(
    { media }: { media: Media }
) {
    const [dataUri, setDataUri] = useState<string | null | MediaLoadError>(null)

    useEffect(() => {
        console.log('Loading lazy media...')
        const removerPromise = hostUiBridge.on(
            'mediaPreviewLoaded',
            ({ path, result }) => {
                if (path === media.path) {
                    setDataUri(
                        "error" in result
                        ? new MediaLoadError(result.error.message)
                        : result.success.dataUri
                    )
                    removerPromise.then(remover => remover())
                }
            }
        )
        hostUiBridge.emit('loadMediaPreview', { path: media.path })
        return () => { removerPromise.then(remover => remover()) }
    }, [])

    return <div className="inline-block h-full bg-slate-100">
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
                : <img className="h-full inline-block" src={dataUri} />
            )
        }
    </div>
}
