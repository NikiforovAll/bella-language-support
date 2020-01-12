import { BellaReference, Range } from 'bella-grammar';
import * as NodeCache from 'node-cache';
import { BSTreeKV } from 'typescript-collections';

import { CommonUtils } from './utils/common.utils';
import { PositionWrapper, ReferenceRegistryUtils } from './utils/reference-registry.utils';

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
        this.referencesCache.set(nrURI, this.createRegistryNode(refs));
    }

    public getReference(row: number, col: number, uri: string) {
        if(this.referencesCache.has(uri)){
            let node = this.referencesCache.get<BSTreeKV<PositionWrapper, BellaReference>>(uri);
            let position = {col, row: row};
            let pos: PositionWrapper = {
                range: {endPosition: position, startPosition: position }
            }
            return node?.search(pos);
        }
        console.warn('file is not indexed');
    }

    private createRegistryNode(refs: BellaReference[]) {
        const tree = new BSTreeKV<PositionWrapper, BellaReference>(ReferenceRegistryUtils.compareReferences);
        // TODO: measure potential impact of working with this data structure
        for (const ref of refs) {
            tree.add(ref);
        }
        return tree;
    }
}



