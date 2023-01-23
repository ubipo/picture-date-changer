/**
 * @type {typeof import('file-type').fileTypeFromBuffer}
 */
module.exports.fileTypeFromBuffer = async (buffer) => {
    const { fileTypeFromBuffer } = await import('file-type');
    return await fileTypeFromBuffer(buffer);
};
