"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsv = void 0;
const tslib_1 = require("tslib");
const Papa = tslib_1.__importStar(require("papaparse"));
const json_1 = require("./json");
function parseCsv(text) {
    // first parse the header to guess the delimiter
    // note that we do that to not rely on Papaparse logic for guessing delimiter
    let delimiter;
    try {
        const header = text.split('\n')[0];
        const result = Papa.parse(header, {
            header: false,
        });
        delimiter = result.meta.delimiter;
    }
    catch (e) {
        throw new Error('CSV parsing failed: the delimiter could not be guessed');
    }
    const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter,
    });
    if (parsed.errors.length) {
        throw new Error('CSV parsing failed for the following reasons:\n' +
            parsed.errors
                .map((error) => `* ${error.message} at row ${error.row}, column ${error.index}`)
                .join('\n'));
    }
    return parsed.data.map(json_1.jsonToGeojsonFeature);
}
exports.parseCsv = parseCsv;
//# sourceMappingURL=csv.js.map