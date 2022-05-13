"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHeaders = void 0;
const types_1 = require("../mime/types");
function parseHeaders(httpHeaders) {
    const result = {};
    if (httpHeaders.has('Content-Type')) {
        result.mimeType = httpHeaders.get('Content-Type').split(';')[0];
        const supported = types_1.SupportedTypes.filter((type) => types_1.AllMimeTypes[type].indexOf(result.mimeType) > -1)[0] || null;
        if (supported !== null)
            result.supportedType = supported;
    }
    if (httpHeaders.has('Content-Length')) {
        result.fileSizeBytes = parseInt(httpHeaders.get('Content-Length'));
    }
    if (httpHeaders.has('Last-Modified')) {
        const date = new Date(httpHeaders.get('Last-Modified'));
        if (Number.isNaN(date.valueOf()))
            result.lastUpdateInvalid = true;
        else
            result.lastUpdate = date;
    }
    return result;
}
exports.parseHeaders = parseHeaders;
//# sourceMappingURL=headers.js.map