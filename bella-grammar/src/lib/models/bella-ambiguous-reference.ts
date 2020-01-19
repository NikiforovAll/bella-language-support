import { DeclarationType } from './declaration-type.enum';
import { BellaReference } from './bella-reference';
export interface BellaAmbiguousReference  extends BellaReference{
    possibleTypes: DeclarationType[];
}
