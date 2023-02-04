export const DATA_TRANSFER_URI_LIST = 'text/uri-list'
export const DATA_TRANSFER_TEXT = 'text/plain'

export function setDataTransferPath(
    dataTransfer: DataTransfer,
    path: string
) {
    const uri = `file://${path}`
    // Explicitly do not use text/uri-list, if we do the webview (correctly) 
    // recognizes the dataTransfer as a file. On drop, some security mechanism
    // seems to then clear the path, presumable to prevent websites from gaining
    // knowledge about the local file system.
    // dataTransfer.setData(DATA_TRANSFER_URI_LIST, uri)
    dataTransfer.setData(DATA_TRANSFER_TEXT, uri)
}

export function getDataTransferPath(
    dataTransfer: DataTransfer
): string | null {
    const uriList = dataTransfer.getData(DATA_TRANSFER_TEXT)
    if (uriList == null || uriList.length === 0) return null

    const uriStrings = uriList.split(/[\r\n]+/)
        .map(uri => uri.trim())
        .filter(uri => !uri.startsWith('#') && uri.length > 0)
    const [uriString, ...extraUris] = uriStrings;
    if (uriString == null || extraUris.length > 0) return null
    const uri = new URL(uriString)
    if (uri.protocol !== 'file:') return null
    return uri.pathname
}
