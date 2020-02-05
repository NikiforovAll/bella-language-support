import { DeclarationType } from 'bella-grammar';
import { DeclarationIdentifier } from 'bella-grammar/dist/lib/models/bella-completion';
import { CompletionItem, CompletionItemKind, CompletionParams } from 'vscode-languageserver';

import { LSPCompletionRegistry } from '../registry/completion-registry.ts/lsp-completion-registry';
import { KeyedDeclaration, LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../utils/common.utils';
import { BaseHandler } from './base.handler';


export class CompletionHandler extends BaseHandler {
    constructor(
        private cache: LSPDeclarationRegistry,
        private completions: LSPCompletionRegistry) {
        super();
    }

    public complete(params: CompletionParams): CompletionItem[] {
        const docUri = params.textDocument.uri;
        let completionToken = this.completions
            .getCompletion(
                params.position.line,
                params.position.character,
                docUri);
        let items = [];
        if (!completionToken) {
            items = new KeywordCompletionProvider().getCompletions()
        }else {
            items = this.createProvider(
                completionToken.completionBase,
                completionToken.expectedCompletions[0],
                docUri).getCompletions();
        }
        return items;
    }

    private createProvider(
        context: DeclarationIdentifier,
        expectedCompletionType: DeclarationType,
        docUri: string): CompletionProvider {
        switch (expectedCompletionType) {
            case DeclarationType.Procedure:
                return new ProcedureCompletionProvider(this.cache, docUri);
                break;
            case DeclarationType.Object:
                return new ObjectCompletionProvider(this.cache, docUri);
            default:
                throw new Error('Completion provider could not be resolved');
                break;
        }
    }
}

interface CompletionProvider {
    getCompletions(): CompletionItem[];
}

class KeywordCompletionProvider implements CompletionProvider {
    getCompletions(): CompletionItem[] {
        return [
        {
            label: 'new',
            insertText: 'new ',
            kind: CompletionItemKind.Keyword
        },
        {
            label: 'call',
            insertText: 'call ',
            kind: CompletionItemKind.Keyword
        }
    ];
    }
}

class ProcedureCompletionProvider implements CompletionProvider {

    constructor(private cache: LSPDeclarationRegistry, private docUri: string) {}

    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery(
            {
                uriFilter: { active: false },
                typeFilter: {
                    active: true,
                    type: DeclarationType.Procedure
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.getNamespaceFromURI(this.docUri),
                    // componentName: CommonUtils.getNamespaceFromURI(this.docUri)
                }
            }
        );
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: CommonUtils.getProcedureTruncatedName(declaration.name),
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            // detail: 'test',
            kind: CompletionItemKind.Method
        }
    }
}

class ObjectCompletionProvider implements CompletionProvider {

    constructor(private cache: LSPDeclarationRegistry, private docUri: string) {}

    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery(
            {
                uriFilter: { active: false },
                typeFilter: {
                    active: true,
                    type: DeclarationType.Object
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.getNamespaceFromURI(this.docUri),
                }
            }
        );
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: CommonUtils.getProcedureTruncatedName(declaration.name),
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            kind: CompletionItemKind.Class
        }
    }
}
