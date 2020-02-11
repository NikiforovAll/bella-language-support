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
                const objectHierarchyResolvedTypes:ResolvedTypeResult[]  = [];
                this.resolveTypeResult(completionSourceName, objectHierarchyResolvedTypes);
                typeResult.push(...objectHierarchyResolvedTypes);
            }
        }else {
            typeResult.push({ name: '<completion trigger is not specified>', resolved: true});
        }
        return typeResult;
    }

    private resolveTypeResult(sourceName: string, acc: ResolvedTypeResult[]) {
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
                    name: sourceName
                }
            }
        )
        if(declarations.length > 0) {
            const objectDeclaration = declarations[0] as any as SimpleObjectDeclaration;
            if(objectDeclaration.returnType?.objectBase === ObjectBase.PrimitiveType) {
                acc.push(
                    {
                        name: objectDeclaration.returnType?.name,
                        type: DeclarationType.Type, resolved: true
                    }
                );
            }
            if(objectDeclaration.returnType?.objectBase === ObjectBase.Alias) {
                const returnTypeName = objectDeclaration.returnType?.name;
                // acc.push(
                //     {
                //         name: returnTypeName,
                //         type: DeclarationType.Object, resolved: true
                //     }
                // );
                if(!!returnTypeName) {
                    this.resolveTypeResult(returnTypeName, acc);
                }
            }
            // top level object
            acc.push({ name: objectDeclaration.name, type: DeclarationType.Object, resolved: true});
        }
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
