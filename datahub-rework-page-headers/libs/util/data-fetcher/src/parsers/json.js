"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonToGeojsonFeature = exports.parseJson = void 0;
/**
 * This parser only supports arrays of simple flat objects with properties
 * @param text
 */
function parseJson(text) {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
        throw new Error('Could not parse JSON, expected an array at root level');
    }
    return parsed.map(jsonToGeojsonFeature);
}
exports.parseJson = parseJson;
function jsonToGeojsonFeature(object) {
    const { id, properties } = Object.keys(object)
        .map((property) => (property ? property : 'unknown')) //prevent empty strings
        .reduce((prev, curr) => curr.toLowerCase().endsWith('id')
        ? {
            ...prev,
            id: object[curr],
        }
        : {
            ...prev,
            properties: { ...prev.properties, [curr]: object[curr] },
        }, { id: undefined, properties: {} });
    return {
        type: 'Feature',
        geometry: null,
        properties,
        ...(id !== undefined && { id }),
    };
}
exports.jsonToGeojsonFeature = jsonToGeojsonFeature;
//# sourceMappingURL=json.js.map