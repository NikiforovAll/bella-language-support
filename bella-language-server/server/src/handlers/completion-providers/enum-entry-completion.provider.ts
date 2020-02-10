import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { BaseCompletionProvider } from './completion-provider';

export class EnumEntryCompletionProvider extends BaseCompletionProvider {
    constructor(private cache: LSPDeclarationRegistry, private docUri: string, private sourceName: string) {
        super();
    }

    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery({
            uriFilter: { active: false },
            nameFilter: {
                active: true,
                name: this.sourceName
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Enum
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(this.docUri),
            },
            descendantsFilter: {
                active: true,
                discardParent: true
            }
        });
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        const enumEntryName = declaration.name;
        const sortingPrefix = '0';
        return {
            label: enumEntryName,
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            kind: CompletionItemKind.EnumMember,
            sortText: sortingPrefix + enumEntryName
        };
    }
}
