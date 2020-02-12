import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { BaseCompletionProvider } from './completion-provider';
import { CachedCompletionProvider } from './cached-completion-provider';

export class ObjectCompletionProvider extends CachedCompletionProvider {

    constructor(cache: LSPDeclarationRegistry, docUri: string) {
        super(cache, docUri, {
            uriFilter: { active: false },
            typeFilter: {
                active: true,
                type: DeclarationType.Object
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
            kind: CompletionItemKind.Class,
            documentation: {
                value: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
                kind: "markdown"
            }
        };
    }
}
