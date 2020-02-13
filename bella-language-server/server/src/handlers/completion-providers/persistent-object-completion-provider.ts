import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { CachedCompletionProvider } from './general-purpose-providers/cached-completion-provider';

export class PersistentObjectCompletionProvider extends CachedCompletionProvider {
    constructor(cache: LSPDeclarationRegistry,docUri: string) {
        super(cache, docUri, {
            uriFilter: { active: false },
            typeFilter: {
                active: true,
                type: DeclarationType.PersistentObject
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
            kind: CompletionItemKind.Variable,
            documentation: {
                value: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
                kind: "markdown"
            }
        };
    }
}
