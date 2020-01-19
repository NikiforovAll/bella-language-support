import { DeclarationType } from './declaration-type.enum';
import { BellaReference } from './bella-reference';
export interface BellaNestedReference  extends BellaReference{
    childTo: string;
    childType: DeclarationType;
    // <parentContainer>.invocationExpression()
    // parentContainer?: string
}
