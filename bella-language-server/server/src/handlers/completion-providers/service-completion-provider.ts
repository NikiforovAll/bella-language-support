import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { CachedCompletionProvider } from './cached-completion-provider';

export class ServiceCompletionProvider extends CachedCompletionProvider {

    constructor(cache: LSPDeclarationRegistry, docUri: string) {
        super(cache, docUri, {
            uriFilter: { active: false },
            typeFilter: {
                active: true,
                type: DeclarationType.Service
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(docUri),
            }
        });
    }

    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: declaration.name,
            detail: declaration.name,
            kind: CompletionItemKind.Interface,
            documentation: {
                value: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
                kind: "markdown"
            }
        };
    }
}
