import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { BaseCompletionProvider, CompletionCacheIdentifier } from './completion-provider';

export class ProcedureCompletionProvider extends BaseCompletionProvider {
    constructor(private cache: LSPDeclarationRegistry, private docUri: string) {
        super();
    }

    getCompletions(): CompletionItem[] {
        const namespace = CommonUtils.getNamespaceFromURI(this.docUri);
        const cacheIdentifier = new CompletionCacheIdentifier(CommonUtils.getClassName(this) || 'shared', namespace).toString();
        let declarations = this.declarationCompletionCache.get<KeyedDeclaration[]>(cacheIdentifier)
        if (!declarations) {
            declarations = this.cache.getDeclarationsForQuery({
                uriFilter: { active: false },
                typeFilter: {
                    active: true,
                    type: DeclarationType.Procedure
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.getNamespaceFromURI(this.docUri),
                }
            });
            this.declarationCompletionCache.set(cacheIdentifier, declarations);
        }
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: CommonUtils.getProcedureTruncatedName(declaration.name),
            detail: declaration.name,
            kind: CompletionItemKind.Method,
            documentation: {
                value: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
                kind: "markdown"
            }
        };
    }
}
