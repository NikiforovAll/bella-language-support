import NodeCache = require('node-cache');
import { CompletionItem } from 'vscode-languageserver';

import { NodeRegistrySearchQuery } from '../../registry/declaration-registry/declaration-registry-query';
import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../../utils/common.utils';
import { BaseCompletionProvider, CompletionCacheIdentifier } from './completion-provider';

export abstract class CachedCompletionProvider extends BaseCompletionProvider {

    protected CACHE_EXP_TIME = 3 * 60;

    getCompletions():CompletionItem[] {
        const namespace = CommonUtils.getNamespaceFromURI(this.docUri);
        const cacheIdentifier = new CompletionCacheIdentifier(CommonUtils.getClassName(this) || 'shared', namespace).toString();
        let declarations = this.declarationCompletionCache.get<KeyedDeclaration[]>(cacheIdentifier)
        if (!declarations) {
            declarations = this.cache.getDeclarationsForQuery(this.query);
            this.declarationCompletionCache.set(cacheIdentifier, declarations, this.CACHE_EXP_TIME);
        }
        return declarations.map(this.toCompletionItem);
    }

    // completion-provider-name + namespace
    declarationCompletionCache: NodeCache = new NodeCache();

    constructor(private cache: LSPDeclarationRegistry, private docUri: string, private query: NodeRegistrySearchQuery) {
        super();
    }


}
