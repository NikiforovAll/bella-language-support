import { DeclarationType } from './declaration-type.enum';
import { BellaReference } from './bella-reference';
/**
 * This type is used in case when declaration is defined as nested token, in this case we search for parent and than get it's members
 */
export interface BellaNestedReference extends BellaReference{
    childTo: string;
    childType: DeclarationType;
    // <parentContainer>.invocationExpression()
    // parentContainer?: string
}
