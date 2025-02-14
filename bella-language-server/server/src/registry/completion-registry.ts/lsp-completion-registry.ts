import { BellaReference, BellaCompletionTrigger, BellaScope } from 'bella-grammar';
import * as NodeCache from 'node-cache';

import { CommonUtils } from '../../utils/common.utils';
import { CompletionRegistryNode } from './completion-registry-node';
import { CompletionRegistryUtils } from '../../utils/completion-registry.utils';
import { isEmpty } from 'lodash';
import { DeclarationCacheProvider } from './declaration-cache-provider';

export class LSPCompletionRegistry implements DeclarationCacheProvider{

    private completionRegistry: NodeCache;

    declarationCompletionCache: NodeCache;

    constructor() {
        this.completionRegistry = new NodeCache({
            checkperiod: 0,
            stdTTL: 0
        });
        this.declarationCompletionCache = new NodeCache({
            checkperiod: 30,
            stdTTL: 30 * 5
        });
    }

    public setTriggers(triggers: BellaCompletionTrigger[], uri: string) {
        // let nrURI = CommonUtils.normalizeURI(uri);
        // this.completionRegistry.set(nrURI, CompletionRegistryUtils.createRegistryNode(triggers, nrURI));
        throw new Error('obsolete');
    }

    public setScopes(scopes: BellaScope[], uri: string) {
        let nrURI = CommonUtils.normalizeURI(uri);
        this.completionRegistry.set(nrURI, CompletionRegistryUtils.createRegistryNode(scopes, nrURI));
    }


    public getCompletion(row: number, col: number, uri: string){
        return this.getRegistryNode(uri).getCompletionByPosition(row, col);
    }

    public getCompletions(row: number, col: number, uri: string) {
        return this.getRegistryNode(uri).getCompletionsByPosition(row, col);
    }

    private getRegistryNode(uri: string): CompletionRegistryNode {
        let nrURI = CommonUtils.normalizeURI(uri);
        if (isEmpty(nrURI) || !this.completionRegistry.has(nrURI)) {
            console.warn(`Registry with specified key ${nrURI} is not found`);
            return CompletionRegistryUtils.createRegistryNode([], nrURI);
        }
        return this.completionRegistry.get(nrURI) as CompletionRegistryNode;
    }
}

