export function chunkArray<T>(array: Array<T>, chunkSize: number) {
    return Array(Math.ceil(array.length / chunkSize)).fill(null)
        .map((_, index) => index * chunkSize)
        .map(begin => array.slice(begin, begin + chunkSize))
}
