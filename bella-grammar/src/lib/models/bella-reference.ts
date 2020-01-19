import { Range } from './base-declaration';
import { DeclarationType } from './declaration-type.enum';

export interface ReferenceIdentifier {
    nameTo: string;
    referenceTo: DeclarationType
}
export interface BellaReference extends ReferenceIdentifier {
    context?: string;
    range: Range;
    isDeclaration: boolean
    referenceType?: BellaReferenceType
    container?: ReferenceIdentifier
}

//TODO: consider get rid of this and move to class + instanceof for strategy pattern
export enum BellaReferenceType {
    AmbiguousReference,
    NestedReference
}
