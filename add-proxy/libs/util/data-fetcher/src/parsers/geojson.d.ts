import { Feature } from 'geojson';
/**
 * This parser supports both Geojson Feature collections or arrays
 * of Features
 * @param text
 */
export declare function parseGeojson(text: string): Feature[];
