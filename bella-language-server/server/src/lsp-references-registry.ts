import { BellaReference, Range } from 'bella-grammar';
import * as NodeCache from 'node-cache';
import { BSTreeKV } from 'typescript-collections';

import { RegistryUtils } from './registry-utils';

export class LSPReferenceRegistry {

    private referencesCache: NodeCache;

    constructor() {
        this.referencesCache = new NodeCache({
            checkperiod: 0,
            stdTTL: 0
        });
    }

    public setReferences(refs: BellaReference[], uri: string) {
        let nrURI = RegistryUtils.normalizeURI(uri);
        this.referencesCache.set(nrURI, this.createRegistryNode(refs));
    }

    public getReference(row: number, col: number, uri: string) {
        if(this.referencesCache.has(uri)){
            let node = this.referencesCache.get<BSTreeKV<PositionWrapper, BellaReference>>(uri);
            let position = {col, row};
            let pos: PositionWrapper = {
                range: {endPosition: position, startPosition: position }
            }
            return node?.search(pos);
        }
        console.warn('references are not added to indexed file');
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

interface PositionWrapper {
    range: Range;
}

namespace ReferenceRegistryUtils {
    export function compareReferences(ref1: PositionWrapper, ref2: PositionWrapper) {
        const r1 = ref1.range, r2 = ref2.range;
        return compareRanges(r1, r2);
    }

    function compareRanges(r1:Range , r2: Range) {
        // THIS logic is based on assumption than tokens are not overleaped so we could compare them
        if(r1.startPosition.row > r2.startPosition.row) {
            return 1;
        } else if(r1.startPosition.row < r2.startPosition.row) {
            return -1;
        }
        let r1SC = r1.startPosition.col;
        if(r1SC === r1.endPosition.col && r1SC >= r2.startPosition.col && r1SC <= r2.endPosition.col) {
            return 0;
        }
        if(r1.startPosition.col > r2.startPosition.col) {
            return 1;
        } else if(r1.startPosition.col > r2.startPosition.col) {
            return -1;
        }
        return 0;
    }
}
