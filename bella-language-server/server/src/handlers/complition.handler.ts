import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { LSPReferenceRegistry } from '../registry/references-registry/lsp-references-registry';
import { BaseHandler } from './base.handler';
import { CompletionParams, CompletionItem } from 'vscode-languageserver';
import { LSPCompletionRegistry } from '../registry/completion-registry.ts/lsp-completion-registry';


export class CompletionHandler extends BaseHandler {
    constructor(
        private cache: LSPDeclarationRegistry,
        private completions: LSPCompletionRegistry) {
        super();
    }

    public complete(params: CompletionParams): CompletionItem[] {
        return [];
    }
}
