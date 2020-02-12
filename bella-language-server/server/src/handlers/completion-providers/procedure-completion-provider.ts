import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { CachedCompletionProvider } from './cached-completion-provider';

export class ProcedureCompletionProvider extends CachedCompletionProvider {


    constructor(cache: LSPDeclarationRegistry, docUri: string) {
        super(cache, docUri, {
            uriFilter: { active: false },
            typeFilter: {
                active: true,
                type: DeclarationType.Procedure
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(docUri),
            }
        });
        this.CACHE_EXP_TIME = 1 * 60;
    }

    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
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
