export const DATA_TRANSFER_URI_LIST = 'text/uri-list'
export const DATA_TRANSFER_TEXT = 'text/plain'

export function setDataTransferPath(
    dataTransfer: DataTransfer,
    path: string
) {
    const uri = `file://${path}`
    dataTransfer.setData(DATA_TRANSFER_URI_LIST, uri)
    dataTransfer.setData(DATA_TRANSFER_TEXT, uri)
}

export function getDataTransferPath(
    dataTransfer: DataTransfer
): string | null {
    const uriList = dataTransfer.getData(DATA_TRANSFER_URI_LIST)
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
