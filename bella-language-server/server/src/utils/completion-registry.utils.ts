import { BellaCompletionTrigger, Range, BellaScope } from 'bella-grammar';

import { CompletionRegistryNode } from '../registry/completion-registry.ts/completion-registry-node';
import { CommonUtils } from './common.utils';

export interface PositionWrapper {
    range: Range;
}
export namespace CompletionRegistryUtils {
    export function compareTriggers(ref1: PositionWrapper, ref2: PositionWrapper) {
        const r1 = ref1.range, r2 = ref2.range;
        return compareRanges(r1, r2);
    }

    // export function createRegistryNode(triggers: BellaCompletionTrigger[], uri: string) {
    //     let node = new CompletionRegistryNode(triggers, CommonUtils.getNamespaceFromURI(uri));
    //     return node;
    // }

    export function createRegistryNode(scopes: BellaScope[], uri: string) {
        let node = new CompletionRegistryNode(scopes, CommonUtils.getNamespaceFromURI(uri));
        return node;
    }

    function compareRanges(r1:Range , r2: Range) {
        if(isDot(r1) && isInRange(r2, r1.startPosition.col,  r1.startPosition.row)) {
            return 0;
        }
        if(r1.startPosition.row > r2.startPosition.row) {
            return 1;
        } else if(r1.startPosition.row < r2.startPosition.row) {
            return -1;
        }

        if(r1.startPosition.col > r2.startPosition.col) {
            return 1;
        } else if(r1.startPosition.col < r2.startPosition.col) {
            return -1;
        }
        return 0;
    }

    function isInRange(r:Range, col: number, row: number): boolean {
        let inRange = row >= r.startPosition.row && row <= r.endPosition.row;
        if(r.startPosition.row === row) {
            inRange = inRange && r.startPosition.col <= col;
        }
        if(r.endPosition.row === row) {
            inRange = inRange && r.endPosition.col >= col;
        }
        return inRange;
    }
    function isDot(r: Range): boolean {
        let r1SC = r.startPosition.col;
        let r1SR = r.startPosition.row;
        let r1EC = r.endPosition.col;
        let r1ER = r.endPosition.row;
        return r1SC === r1EC && r1SR === r1ER;
    }
}
