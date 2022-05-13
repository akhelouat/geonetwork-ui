import type { Feature } from 'geojson';
/**
 * This parser only supports arrays of simple flat objects with properties
 * @param text
 */
export declare function parseJson(text: string): Feature[];
export declare function jsonToGeojsonFeature(object: {
    [key: string]: any;
}): Feature;
