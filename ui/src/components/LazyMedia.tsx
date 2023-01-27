import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { hostUiBridge } from "../host-ui-bridge";
import { Media } from "../host-ui-bridge/generated-bindings";

export default function LazyMedia(
    { media }: { media: Media }
) {
    const [dataUri, setDataUri] = useState<string | null>(null)

    useEffect(() => {
        console.log('Loading lazy media...')
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

    return <div className="inline-block h-full bg-slate-100">{ dataUri == null
        ? <div className="h-full aspect-square flex justify-center items-center">
            <CircularProgress />
        </div>
        : <img className="h-full inline-block" src={dataUri} />
    }</div>
}
