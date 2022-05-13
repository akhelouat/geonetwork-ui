"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExcel = void 0;
const tslib_1 = require("tslib");
const XLSX = tslib_1.__importStar(require("xlsx"));
const json_1 = require("./json");
/**
 * This will read the first sheet of the excel workbook and expect the first
 * line to contain the properties names
 * @param buffer
 */
function parseExcel(buffer) {
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    if (!json.length) {
        return [];
    }
    return json.map(json_1.jsonToGeojsonFeature);
}
exports.parseExcel = parseExcel;
//# sourceMappingURL=excel.js.map