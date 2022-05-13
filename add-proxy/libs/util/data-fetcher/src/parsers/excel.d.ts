import type { Feature } from 'geojson';
/**
 * This will read the first sheet of the excel workbook and expect the first
 * line to contain the properties names
 * @param buffer
 */
export declare function parseExcel(buffer: ArrayBuffer): Feature[];
