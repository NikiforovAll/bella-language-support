import { DeclarationType, BellaCompletionTrigger, SimpleObjectDeclaration, ObjectBase } from "bella-grammar";
import { LSPDeclarationRegistry } from "../registry/declaration-registry/lsp-declaration-registry";
import { CommonUtils } from "./common.utils";

export class TypeResolver {
    constructor(private declarationRegistry: LSPDeclarationRegistry, private docUri: string) {

    }
    public resolveCompletionTrigger(context?: BellaCompletionTrigger): ResolvedTypeResult[] {
        const typeResult = [];
        if (!!context) {

            const completionSource = context?.completionBase?.completionSource;
            if (!completionSource || completionSource.length === 0) {
                // throw new Error('Completion source could not be resolved, please provide correct one');
                // in this case we actually don't expect anything to be returned.
                typeResult.push({ name: '<empty completion source array>', resolved: true });
            }else {
                // const relatedSource = completionSource.find(s => s.type === expectedCompletionType);
                //TODO: traverse hierarchy of completions
                const completionSourceName = completionSource[0].name;

                const declarations = this.declarationRegistry.getDeclarationsForQuery(
                    {
                        uriFilter: {
                            active: false,
                        },
                        namespaceFilter: {
                            active: true,
                            namespace: CommonUtils.getNamespaceFromURI(this.docUri)
                        },
                        typeFilter: {
                            active: true,
                            type: DeclarationType.Object
                        },
                        nameFilter: {
                            active: true,
                            name: completionSourceName
                        }
                    }
                )
                if(declarations.length > 0) {
                    const objectDeclaration = declarations[0] as any as SimpleObjectDeclaration;
                    if(objectDeclaration.returnType?.objectBase === ObjectBase.PrimitiveType) {
                        typeResult.push(
                            {
                                name: objectDeclaration.returnType?.name,
                                type: DeclarationType.Type, resolved: true
                            }
                        );
                    }
                    if(objectDeclaration.returnType?.objectBase === ObjectBase.Alias) {
                        typeResult.push(
                            {
                                name: objectDeclaration.returnType?.name,
                                type: DeclarationType.Object, resolved: true
                            }
                        );
                    }
                }
                typeResult.push({ name: completionSourceName, type: DeclarationType.Object, resolved: true});
            }
        }else {
            typeResult.push({ name: '<completion trigger is not specified>', resolved: true});
        }
        return typeResult;
    }

}
export interface ResolvedTypeResult {
    type?: DeclarationType;
    resolved: boolean;
    name: string;
}
export namespace CompletionUtils {
    export function extractCompletionSourceName(registry: LSPDeclarationRegistry,
        docUri: string,
        context?: BellaCompletionTrigger, ): ResolvedTypeResult[]{
        const resolver = new TypeResolver(registry, docUri);
        return resolver.resolveCompletionTrigger(context);
    }
}
