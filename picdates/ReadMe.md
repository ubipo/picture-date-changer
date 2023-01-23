
## On Date parsing
Built-in `Date` does not do arbitrary format parsing (at least not officially).\
moment.js is being deprecated.\
I choose dayjs instead, which is one of the libs that the momentjs authors now recommend.

Currently we have hardcoded parse date formats.\
We could supply an array of them to handle multiple (https://day.js.org/docs/en/parse/string-format)

## On exif I/O.
There's just one library that also writes: `pixief`.\
This tutorial is good: https://auth0.com/blog/read-edit-exif-metadata-in-photos-with-javascript/#Getting-Started

## Not done yet:
- Comparing parsed dates w/ client labels (ground truth)
- Fix `dateInfo[2].dateFromExif: Invalid Date` (wss een ander formaat voor dayjs nodig)
- _Writing_ EXIF data. (See https://piexifjs.readthedocs.io/en/latest/about.html#how-to-use)
