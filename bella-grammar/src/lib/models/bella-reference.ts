import { Range } from './base-declaration';
import { DeclarationType } from './declaration-type.enum';
export interface BellaReference {
    context?: string;
    range: Range;
    nameTo: string;
    referenceTo: DeclarationType
    isDeclaration: boolean
    referenceType?: BellaReferenceType
}

//TODO: consider get rid of this and move to class + instanceof for strategy pattern
export enum BellaReferenceType {
    AmbiguousReference,
    NestedReference
}
