import { BellaReference } from 'bella-grammar';
import * as NodeCache from 'node-cache';

import { CommonUtils } from '../../utils/common.utils';

export class LSPCompletionRegistry {

    private completionRegistry: NodeCache;

    constructor() {
        this.completionRegistry = new NodeCache({
            checkperiod: 0,
            stdTTL: 0
        });
    }

    public setReferences(refs: BellaReference[], uri: string) {
        let nrURI = CommonUtils.normalizeURI(uri);
        // this.referencesCache.set(nrURI, ReferenceRegistryUtils.createRegistryNode(refs, nrURI));
    }

    public getCompletion(row: number, col: number, uri: string){

    }
}

