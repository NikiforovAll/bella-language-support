import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { CompletionProvider, BaseCompletionProvider } from './completion-provider';
export class PersistentObjectCompletionProvider extends BaseCompletionProvider {
    constructor(private cache: LSPDeclarationRegistry, private docUri: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery({
            uriFilter: { active: false },
            typeFilter: {
                active: true,
                type: DeclarationType.PersistentObject
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
            // detail: 'test',
            kind: CompletionItemKind.Variable
        };
    }
}
