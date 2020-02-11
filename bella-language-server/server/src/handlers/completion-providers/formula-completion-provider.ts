import { DeclarationType, FormulaDeclaration } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { BaseCompletionProvider } from './completion-provider';

export class FormulaCompletionProvider extends BaseCompletionProvider {
    constructor(private cache: LSPDeclarationRegistry, private docUri: string, private objectName: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery({
            uriFilter: { active: false },
            typeFilter: {
                active: true,
                type: DeclarationType.Formula
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(this.docUri),
            },
        }) as any;
        return declarations
            .filter((d: FormulaDeclaration) => d.signatureContext.params[0]?.type === this.objectName)
            .map(this.toCompletionItem);
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
