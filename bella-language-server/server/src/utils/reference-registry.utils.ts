import { BellaReference, Range } from 'bella-grammar';

import { ReferencesRegistryNode } from '../registry/references-registry/references-registry-node';
import { CommonUtils } from './common.utils';

export interface PositionWrapper {
    range: Range;
}
export namespace ReferenceRegistryUtils {
    export function compareReferences(ref1: PositionWrapper, ref2: PositionWrapper) {
        const r1 = ref1.range, r2 = ref2.range;
        return compareRanges(r1, r2);
    }

    export function createRegistryNode(refs: BellaReference[], uri: string) {
        let node = new ReferencesRegistryNode(refs, CommonUtils.getNamespaceFromURI(uri));
        return node;
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
        } else if(r1.startPosition.col < r2.startPosition.col) {
            return -1;
        }
        return 0;
    }
}

export interface LocatedBellaReference extends BellaReference, LocatedResource {

}

export interface LocatedResource {
    uri: string
}
