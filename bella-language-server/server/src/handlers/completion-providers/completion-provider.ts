import { DeclarationType } from 'bella-grammar';
import { CompletionItem } from 'vscode-languageserver';
import { LSPCompletionRegistry } from '../../registry/completion-registry.ts/lsp-completion-registry';
import { DeclarationCacheProvider } from '../../registry/completion-registry.ts/declaration-cache-provider';
import NodeCache = require('node-cache');
import { KeyedDeclaration } from '../../registry/declaration-registry/lsp-declaration-registry';

export interface CompletionProvider {
    getCompletions(): CompletionItem[];
    setCompletionTypes(types: DeclarationType[]): CompletionProvider;
    getCompletionTypes(): DeclarationType[];
}

export abstract class BaseCompletionProvider implements CompletionProvider, DeclarationCacheProvider {

    // completion-provider-name + namespace
    declarationCompletionCache: NodeCache = new NodeCache();

    protected completionsOf: DeclarationType[] = [];

    abstract getCompletions(): CompletionItem[];

    abstract toCompletionItem(declaration: KeyedDeclaration): CompletionItem;

    setCompletionTypes(types: DeclarationType[]): CompletionProvider {
        this.completionsOf = types;
        return this;
    }

    setDeclarationCache(cache: DeclarationCacheProvider) {
        this.declarationCompletionCache = cache.declarationCompletionCache;
    }

    getCompletionTypes(): DeclarationType[] {
        return this.completionsOf;
    }

}

export class CompletionCacheIdentifier {
    constructor(private providerName: string, private namespace: string) {}

    toString() {
        return `${this.providerName}.${this.namespace}`;
    }
}
