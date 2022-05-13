import { SupportedType } from '../mime/types';
export interface DatasetHeaders {
    mimeType?: string;
    supportedType?: SupportedType;
    fileSizeBytes?: number;
    lastUpdate?: Date;
    lastUpdateInvalid?: true;
}
export declare function parseHeaders(httpHeaders: Headers): DatasetHeaders;
