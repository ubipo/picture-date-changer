import { parse } from "../dates.js";

const clientLabels = [
    {
        // Ball
        date: "2019-03-17",
        filenames: [
            'IMG-20190317-WA0002.jpg',
            'IMG-20190317-WA0007.jpg',
            'IMG-20190425-WA0010.jpg',
            'IMG-20190425-WA0021.jpg',
            'VID-20190317-WA0020.mp4',
        ],
    },
    {
        // Klimmen met broers
        date: "2020-08-10",
        filenames: [
            '569-256.jpg',
            'IMG-20200810-WA0005.jpg',
            'DSC_0131.JPG',
        ],
    },
    {
        // Alps: klimmen
        date: "2022-08-17",
        filenames: [
            '20220817-DSC_0471.jpg',
            'IMG-20220817-WA0002.jpg',
            'IMG-20221001-WA0005.jpg',
            'IMG_20221006_190740_850.jpg',
        ],
    },
    {
        // Alps: boven de bergen
        date: "2022-08-18",
        filenames: [
            'IMG-20221001-WA0003.jpg',
            'IMG-20220818-WA0006.jpg',
            'IMG_20221006_190741_094.jpg',
            '20220818-DSC_0497.jpg',
        ],
    }
]

export const trueDates = {}
clientLabels.forEach(day => {
    day['filenames'].forEach(filename => {
        trueDates[filename] = parse(day['date'], "YYYY-MM-DD")
    })
})

export const labelledFilenames = Object.keys(trueDates)
