import { DeclarationType, BellaCompletionTrigger } from "bella-grammar";
import { LSPDeclarationRegistry } from "../registry/declaration-registry/lsp-declaration-registry";

export class TypeResolver {
    constructor(private declarationRegistry: LSPDeclarationRegistry) {

    }
    public resolveCompletionTrigger(
        expectedCompletionType: DeclarationType,
        context?: BellaCompletionTrigger): ResolvedTypeResult {
        if (!!context) {
            const completionSource = context?.completionBase?.completionSource;
            if (!completionSource) {
                // throw new Error('Completion source could not be resolved, please provide correct one');
                // in this case we actually don't expect anything to be returned.
                return { name: '<empty completion source array>', resolved: true };
            }
            const relatedSource = completionSource.find(s => s.type === expectedCompletionType);
            const completionSourceName = relatedSource
                ? relatedSource.name
                : completionSource[0].name;
            return { name: completionSourceName, type: DeclarationType.Object, resolved: true};
        }
        return { name: '<completion trigger is not specified>', resolved: true};
    }

}
export interface ResolvedTypeResult {
    type?: DeclarationType;
    resolved: boolean;
    name: string;
}
export namespace CompletionUtils {
    export function extractCompletionSourceName(
        expectedCompletionType: DeclarationType,
        registry: LSPDeclarationRegistry,
        context?: BellaCompletionTrigger, ): ResolvedTypeResult {
        const resolver = new TypeResolver(registry);
        return resolver.resolveCompletionTrigger(expectedCompletionType, context);
    }
}
