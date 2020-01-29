import { DeclarationType } from './declaration-type.enum';
import { BellaReference, ReferenceIdentifier } from './bella-reference';
/**
 * This type is used when it is not possible to determine reference type without full context (all parsed files)
 */
export interface BellaAmbiguousReference  extends BellaReference{
    possibleTypes: ReferenceIdentifier[];
}
