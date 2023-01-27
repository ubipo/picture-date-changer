import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { hostUiBridge } from "../host-ui-bridge";
import { Media } from "../host-ui-bridge/generated-bindings";

export default function LazyMedia(
    { media }: { media: Media }
) {
    const [dataUri, setDataUri] = useState<string | null>(null)

    useEffect(() => {
        const removerPromise = hostUiBridge.on(
            'mediaPreviewLoaded',
            ({ path, dataUri }) => {
                if (path === media.path) {
                    setDataUri(dataUri)
                    removerPromise.then(remover => remover())
                }
            }
        )
        hostUiBridge.emit('loadMediaPreview', { path: media.path })
        return () => { removerPromise.then(remover => remover()) }
    }, [])

    return dataUri == null
        ? <div className="h-full aspect-square">
            <CircularProgress />
        </div>
        : <img className="h-full" src={dataUri} />
}
