import { BellaCompletionTrigger, DeclarationType, ObjectBase, SimpleObjectDeclaration } from 'bella-grammar';

import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from './common.utils';

class CompletionVisitor {

    constructor(private resolver: TypeResolver) { }

    visit(context: BellaCompletionTrigger): ResolvedTypeResult[] {
        const result: ResolvedTypeResult[] = [];
        const completionSource = context?.completionBase?.completionSource;
        const compoundCompletionSource = context?.completionBase?.compoundCompletionSource;
        if (compoundCompletionSource) {
            if (compoundCompletionSource.length === 1) {
                const [descendant] = compoundCompletionSource;
                const fieldName = descendant.completionBase.context.split('.').pop();
                if (!fieldName) {
                    throw new Error('Completion source right operand is empty, couldn\'t calculate compound completion');
                }
                const resolvedBaseTypes = this.visit(descendant);
                const resolvedTypes = resolvedBaseTypes.map(
                    baseType => this.resolver.resolveFieldType(baseType.name, fieldName))
                    .reduce((acc, el) => acc.concat(el));
                result.push(...resolvedTypes);
            }


        } else if (!completionSource || completionSource.length === 0) {
            // throw new Error('Completion source could not be resolved, please provide correct one');
            // in this case we actually don't expect anything to be returned.
            result.push(...this.visitEmpty(context));
        } else {
            result.push(...this.visitType(context));
        }
        return result;
    }
    visitEmpty(context: BellaCompletionTrigger): ResolvedTypeResult[] {
        return [{ name: CompletionUtils.EMPTY_COMPLETION_SOURCE_ARRAY_LABEL, resolved: true }];
    }

    visitType(context: BellaCompletionTrigger): ResolvedTypeResult[] {
        const completionSource = context?.completionBase?.completionSource;
        if (!completionSource) {
            throw new Error('Couldn\'t not visit empty context');
        }
        const completionSourceName = completionSource[0].name;
        const objectHierarchyResolvedTypes: ResolvedTypeResult[] = [];
        this.resolver.resolveTypeResult(completionSourceName, objectHierarchyResolvedTypes);
        return objectHierarchyResolvedTypes;
    }
}

export class TypeResolver {
    constructor(private declarationRegistry: LSPDeclarationRegistry, private docUri: string) {

    }
    public resolveCompletionTrigger(context?: BellaCompletionTrigger): ResolvedTypeResult[] {
        const typeResult = [];
        if (!!context) {
            return new CompletionVisitor(this).visit(context);
        } else {
            typeResult.push({ name: CompletionUtils.COMPLETION_TRIGGER_IS_NOT_SPECIFIED_LABEL, resolved: true });
        }
        return typeResult;
    }

    public resolveFieldType(objectName: string, fieldName: string): ResolvedTypeResult[] {
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
                    name: objectName
                },
                descendantsFilter: {
                    active: true,
                    discardParent: true,
                    query: {
                        uriFilter: { active: false },
                        nameFilter: { active: true, name: fieldName }
                    }
                }
            }
        )
        if (declarations.length > 0) {
            const objectDeclaration = declarations[0] as any as SimpleObjectDeclaration;
            return this.extractReturnTypeResults(objectDeclaration);
        }
        return [];
    }

    public resolveTypeResult(sourceName: string, acc: ResolvedTypeResult[]) {
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
                },
                fallbackRules: {
                    fallbackTypeProbe: {
                        type: DeclarationType.Object,
                        fallbackTypes: [DeclarationType.Enum, DeclarationType.Service, DeclarationType.PersistentObject]
                    }
                },
            }
        )
        if (declarations.length > 0) {
            const objectDeclaration = declarations[0] as any as SimpleObjectDeclaration;
            acc.push(...this.extractReturnTypeResults(objectDeclaration));
            // const objectDeclaration = declarations[0] as any as SimpleObjectDeclaration;
            // if (objectDeclaration.returnType?.objectBase === ObjectBase.PrimitiveType) {
            //     acc.push({ name: objectDeclaration.returnType?.name, resolved: true });
            // }
            // if (objectDeclaration.returnType?.objectBase === ObjectBase.Alias) {
            //     const returnTypeName = objectDeclaration.returnType?.name;
            //     if (!!returnTypeName) {
            //         this.resolveTypeResult(returnTypeName, acc);
            //     }
            // }
            // if (objectDeclaration.returnType?.objectBase === ObjectBase.Collection) {
            //     const returnTypeName = objectDeclaration.returnType?.name;
            //     acc.push({ name: returnTypeName, resolved: true });
            // }
            // // top level object
            // acc.push({ name: objectDeclaration.name, resolved: true });
        }
    }

    private extractReturnTypeResults(objectDeclaration: SimpleObjectDeclaration): ResolvedTypeResult[] {
        const result: ResolvedTypeResult[] = [];
        if (objectDeclaration.returnType?.objectBase === ObjectBase.PrimitiveType) {
            result.push({ name: objectDeclaration.returnType?.name, resolved: true });
        }
        if (objectDeclaration.returnType?.objectBase === ObjectBase.Alias) {
            const returnTypeName = objectDeclaration.returnType?.name;
            if (!!returnTypeName) {
                this.resolveTypeResult(returnTypeName, result);
            }
        }
        if (objectDeclaration.returnType?.objectBase === ObjectBase.Collection) {
            const returnTypeName = objectDeclaration.returnType?.name;
            result.push({ name: returnTypeName, resolved: true });
        }
        // top level object
        result.push({ name: objectDeclaration.name, resolved: true });
        return result;
    }

}
export interface ResolvedTypeResult {
    // type?: DeclarationType;
    resolved: boolean;
    name: string;
}
export namespace CompletionUtils {
    export function extractCompletionSourceName(registry: LSPDeclarationRegistry,
        docUri: string,
        context?: BellaCompletionTrigger, ): ResolvedTypeResult[] {
        const resolver = new TypeResolver(registry, docUri);
        return resolver.resolveCompletionTrigger(context);
    }
    export const EMPTY_COMPLETION_SOURCE_ARRAY_LABEL: string = '<empty completion source array>';
    export const COMPLETION_TRIGGER_IS_NOT_SPECIFIED_LABEL: string = '<completion trigger is not specified>';
}
