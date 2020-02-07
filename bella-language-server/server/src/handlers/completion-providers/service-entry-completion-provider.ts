import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { CompletionProvider } from './completion-provider';
export class ServiceEntryCompletionProvider implements CompletionProvider {
    constructor(private cache: LSPDeclarationRegistry, private docUri: string, private sourceName: string) { }
    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery({
            uriFilter: { active: false },
            nameFilter: {
                active: true,
                name: this.sourceName
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Service
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
        const serviceEntryName = CommonUtils.getProcedureTruncatedName(declaration.name);
        const sortingPrefix = '0';
        return {
            label: serviceEntryName,
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            kind: CompletionItemKind.Method,
            sortText: sortingPrefix + serviceEntryName
        };
    }
}
