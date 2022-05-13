"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGeojson = void 0;
/**
 * This parser supports both Geojson Feature collections or arrays
 * of Features
 * @param text
 */
function parseGeojson(text) {
    const parsed = JSON.parse(text);
    const features = parsed.type === 'FeatureCollection' ? parsed.features : parsed;
    if (!Array.isArray(features)) {
        throw new Error('Could not parse GeoJSON, expected a features collection or an array of features at root level');
    }
    return features;
}
exports.parseGeojson = parseGeojson;
//# sourceMappingURL=geojson.js.map