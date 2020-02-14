import { Range } from './base-declaration';

export interface BellaScope {
    name: string;
    range: Range;
    content?: string;
}
