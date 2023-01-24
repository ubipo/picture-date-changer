/**
 * @type {typeof import('../../picdates/date-from-file.js').extractDate}
 */
let extractDate = null;

module.exports.extractDate = async (filePath) => {
    if (extractDate === null) {
        extractDate = (await import('../../picdates/date-from-file.js')).extractDate
    }
    return extractDate(filePath);
};
