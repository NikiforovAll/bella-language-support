import { BellaCompletionTrigger } from 'bella-grammar';
import { BSTreeKV } from 'typescript-collections';

import { PositionWrapper, CompletionRegistryUtils } from '../../utils/completion-registry.utils';

export class CompletionRegistryNode {

    // /**
    //  * allows to access triggers as binary tree, used for position search
    //  */
    // private triggers: BSTreeKV<PositionWrapper, BellaCompletionTrigger>;
    private storage: BellaCompletionTrigger[];

    constructor(nodes: BellaCompletionTrigger[], public namespace: string) {
        this.storage = nodes;
        // const tree = new BSTreeKV<PositionWrapper, BellaCompletionTrigger>(CompletionRegistryUtils.compareTriggers);
        // for (const t of nodes) {
        //     tree.add(t);
        // }
        // this.triggers = tree;
    }

    getCompletionByPosition(row: number, col: number) {
        // let position = { col, row };
        // let pos: PositionWrapper = {
        //     range: { endPosition: position, startPosition: position }
        // }
        // return this.triggers?.search(pos);
        return this.getCompletionsByPosition(row, col)[0];
    }

    getCompletionsByPosition(row: number, col: number) {
        // this.storage.sort(CompletionRegistryUtils.compareTriggers);
        let position = { col, row };
        let pos: PositionWrapper = {
            range: { endPosition: position, startPosition: position }
        }
        return this.storage.filter((t) => CompletionRegistryUtils.compareTriggers(pos, t) === 0);
    }


}

// TODO: optimize with binary search + proper generic implementation for this data structure
// also good as exercise

// export namespace ArrayUtils {
//     function binarySearch(sortedArray: BellaCompletionTrigger[], elToFind: PositionWrapper) {
//         var lowIndex = 0;
//         var highIndex = sortedArray.length - 1;
//         while (lowIndex <= highIndex) {
//             var midIndex = Math.floor((lowIndex + highIndex) / 2);
//             if (sortedArray[midIndex] == elToFind) {
//                 return midIndex;
//             } else if (sortedArray[midIndex] < elToFind) {
//                 lowIndex = midIndex + 1;
//             } else {
//                 highIndex = midIndex - 1;
//             }
//         } return null;
//     }
// }
