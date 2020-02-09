import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { CompletionProvider } from './completion-provider';
export class EnumCompletionProvider implements CompletionProvider {
    constructor(private cache: LSPDeclarationRegistry, private docUri: string) { }
    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery({
            uriFilter: { active: false },
            typeFilter: {
                active: true,
                type: DeclarationType.Enum
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(this.docUri),
            }
        });
        return declarations.map(this.toCompletionItem);
    }
    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: declaration.name,
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            kind: CompletionItemKind.Enum,
        };
    }
}
