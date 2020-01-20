import { BellaReference, Range } from 'bella-grammar';
import * as NodeCache from 'node-cache';
import { BSTreeKV } from 'typescript-collections';

import { CommonUtils } from '../../utils/common.utils';
import { PositionWrapper, ReferenceRegistryUtils, LocatedBellaReference } from '../../utils/reference-registry.utils';
import { ReferencesRegistryNode } from './references-registry-node';
import { ReferencesRegistrySearchQuery } from './references-registry-query';
import { isEmpty, isNil } from 'lodash';
import * as LSP from 'vscode-languageserver';
import { ReferenceFactoryMethods } from '../../factories/reference.factory';

export class LSPReferenceRegistry {

    private referencesCache: NodeCache;

    constructor() {
        this.referencesCache = new NodeCache({
            checkperiod: 0,
            stdTTL: 0
        });
    }

    public setReferences(refs: BellaReference[], uri: string) {
        let nrURI = CommonUtils.normalizeURI(uri);
        this.referencesCache.set(nrURI, ReferenceRegistryUtils.createRegistryNode(refs, nrURI));
    }

    public getReference(row: number, col: number, uri: string): BellaReference | undefined{
        // if(this.referencesCache.has(uri)){
        //     let node = this.referencesCache.get<ReferencesRegistryNode>(uri);
        //     if(!node) {
        //         throw new Error(`getReference. node for ${uri} is not found`);
        //     }
        //     return node.getReferenceByPosition(row, col);
        // }
        // console.warn('file is not indexed');
        return this.getRegistryNode(uri).getReferenceByPosition(row, col);
    }


    public getLSPReferencesForQuery(query: ReferencesRegistrySearchQuery): LSP.Location[] {
        let refs = this.getReferencesForQuery(query);
        return ReferenceFactoryMethods.toLSPLocations(refs)
    }

    // TODO: consider to factor out common querying logic into common module for declarations and references queries
    public getReferencesForQuery(query: ReferencesRegistrySearchQuery): LocatedBellaReference[] {
        let result: LocatedBellaReference[] = [];
        if (query.uriFilter.active) {
            result = this.getRegistryNode(query.uriFilter.uri || '').getReferences(query).map(
                r => ({...r, uri: query.uriFilter.uri || '' })
            );
        } else {
            // global search
            let selectedKeys = this.referencesCache.keys();
            //nrURI
            for (const registry_key of selectedKeys) {
                let registry = this.referencesCache.get<ReferencesRegistryNode>(registry_key);
                if (isNil(registry)) {
                    continue;
                }
                if (query.namespaceFilter?.active &&
                    registry?.namespace !== query.namespaceFilter.namespace) {
                    continue;
                }
                let resultRefs = registry.getReferences(query).map(
                    r => ({...r, uri: registry_key}));
                result.push(...resultRefs);
            }
        }
        return result;
    }

    private getRegistryNode(uri: string): ReferencesRegistryNode {
        let nrURI = CommonUtils.normalizeURI(uri);
        if (isEmpty(nrURI) || !this.referencesCache.has(nrURI)) {
            console.warn(`Registry with specified key ${nrURI} is not found`);
            return ReferenceRegistryUtils.createRegistryNode([], nrURI);
        }
        return this.referencesCache.get(nrURI) as ReferencesRegistryNode;
    }
}

