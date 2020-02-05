import { BellaReference, BellaCompletionTrigger } from 'bella-grammar';
import { BSTreeKV } from 'typescript-collections';

import { PositionWrapper, CompletionRegistryUtils } from '../../utils/completion-registry.utils';

export class CompletionRegistryNode {

    /**
     * allows to access triggers as binary tree, used for position search
     */
    private triggers: BSTreeKV<PositionWrapper, BellaCompletionTrigger>;

    constructor(nodes: BellaCompletionTrigger[], public namespace: string) {
        const tree = new BSTreeKV<PositionWrapper, BellaCompletionTrigger>(CompletionRegistryUtils.compareTriggers);
        for (const t of nodes) {
            tree.add(t);
        }
        this.triggers = tree;
    }

    getCompletionByPosition(row: number, col: number) {
        let position = { col, row };
        let pos: PositionWrapper = {
            range: { endPosition: position, startPosition: position }
        }
        return this.triggers?.search(pos);
    }

    private getValues(): BellaCompletionTrigger[] {
        return this.triggers.toArray()
    }
}
