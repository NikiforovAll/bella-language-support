import { DeclarationType, SimpleObjectDeclaration } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { BaseCompletionProvider } from './completion-provider';

export class ObjectFieldCompletionProvider extends BaseCompletionProvider {
    constructor(private cache: LSPDeclarationRegistry, private docUri: string, private objectName: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery({
            uriFilter: { active: false },
            nameFilter: {
                active: true,
                name: this.objectName
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Object
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
        const typeDeclaration = (declaration as any as SimpleObjectDeclaration).returnType;
        const objectFieldName = declaration.name;
        const sortingPrefix = '0';
        return {
            label: objectFieldName,
            detail: declaration.name + (typeDeclaration?.fullQualifier ? (': ' + typeDeclaration.fullQualifier) : ''),
            kind: CompletionItemKind.Property,
            documentation: {
                value: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
                kind: "markdown"
            },
            sortText: sortingPrefix + objectFieldName
        };
    }
}
