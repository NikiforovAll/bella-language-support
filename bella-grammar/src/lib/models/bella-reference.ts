import { Range } from './base-declaration';
import { DeclarationType } from './declaration-type.enum';
export interface BellaReference {
    context?: string;
    range: Range;
    nameTo: string;
    referenceTo: DeclarationType
    isDeclaration: boolean
    parentContainer?: string
}
