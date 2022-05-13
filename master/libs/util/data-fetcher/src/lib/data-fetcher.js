"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDatasetHeaders = exports.readDataset = void 0;
const headers_1 = require("./headers");
const csv_1 = require("../parsers/csv");
const json_1 = require("../parsers/json");
const geojson_1 = require("../parsers/geojson");
const types_1 = require("../mime/types");
const excel_1 = require("../parsers/excel");
const ogc_client_1 = require("@camptocamp/ogc-client");
class FetchError {
    constructor(message, httpStatus = 0, isCrossOriginOrNetworkRelated = false, parsingFailed = false, contentTypeError = false) {
        this.message = message;
        this.httpStatus = httpStatus;
        this.isCrossOriginOrNetworkRelated = isCrossOriginOrNetworkRelated;
        this.parsingFailed = parsingFailed;
        this.contentTypeError = contentTypeError;
    }
    static http(code) {
        return new FetchError('Received HTTP error', code);
    }
    static corsOrNetwork(message) {
        return new FetchError(`Data could not be fetched (probably because of CORS limitations or a network error); error message is: ${message}`, 0, true);
    }
    static parsingFailed(info) {
        return new FetchError(`The received file could not be parsed for the following reason: ${info}`, 0, false, true);
    }
    static unsupportedType(mimeType) {
        return new FetchError(`The following content type is unsupported: ${mimeType}`, 0, false, false, true);
    }
    static unknownType() {
        return new FetchError('The content type could not be inferred and was not hinted, abandoning', 0, false, false, true);
    }
}
/**
 * This fetches the full dataset at the given URL and parses it according to its mime type.
 * All items in the dataset are converted to GeoJSON features, even if they do not bear any spatial geometry.
 * File type can be either inferred (from the HTTP headers or the URL), or hinted using the 2nd argument
 * File type is determined liked so:
 *  1. if a type hint is given, use it
 *  2. otherwise, look for a Content-Type header in the response with a supported mime type
 *  3. if no valid mime type was found, look for an explicit file extension in the url (.csv, .geojson etc.)
 */
function readDataset(url, typeHint) {
    return (0, ogc_client_1.useCache)(() => (0, ogc_client_1.sharedFetch)(url)
        .catch((error) => {
        throw FetchError.corsOrNetwork(error.message);
    })
        .then(async (response) => {
        if (!response.ok) {
            throw FetchError.http(response.status);
        }
        const fileInfo = (0, headers_1.parseHeaders)(response.headers);
        const fileExtensionMatches = new URL(url, typeof window !== 'undefined'
            ? window.location.toString()
            : undefined).pathname.match(/\.(.+)$/);
        const fileExtension = fileExtensionMatches && fileExtensionMatches.length
            ? fileExtensionMatches[1].toLowerCase()
            : null;
        let fileType;
        // 1. type hint
        if (typeHint)
            fileType = typeHint;
        // 2. content-type header
        else if ('supportedType' in fileInfo)
            fileType = fileInfo.supportedType;
        // 3. file extension from url
        else if (types_1.SupportedTypes.indexOf(fileExtension) > -1)
            fileType = fileExtension;
        // no type inferred or hinted
        if (!fileType) {
            if ('mimeType' in fileInfo)
                throw FetchError.unsupportedType(fileInfo.mimeType);
            else
                throw FetchError.unknownType();
        }
        try {
            switch (fileType) {
                case 'csv':
                    return (0, csv_1.parseCsv)(await response.text());
                case 'json':
                    return (0, json_1.parseJson)(await response.text());
                case 'geojson':
                    return (0, geojson_1.parseGeojson)(await response.text());
                case 'excel':
                    return (0, excel_1.parseExcel)(await response.arrayBuffer());
            }
        }
        catch (e) {
            throw FetchError.parsingFailed(e.message);
        }
        throw new Error('Not implemented');
    }), url);
}
exports.readDataset = readDataset;
/**
 * This fetches only the header of the dataset at the given URL, giving info on size, mime-type and last update if available.
 */
function readDatasetHeaders(url) {
    return fetch(url).then((response) => (0, headers_1.parseHeaders)(response.headers));
}
exports.readDatasetHeaders = readDatasetHeaders;
//# sourceMappingURL=data-fetcher.js.map