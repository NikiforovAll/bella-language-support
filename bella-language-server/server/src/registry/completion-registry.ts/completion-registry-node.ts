import { BellaCompletionTrigger, BellaScope } from 'bella-grammar';
import { BSTreeKV } from 'typescript-collections';

import { PositionWrapper, CompletionRegistryUtils } from '../../utils/completion-registry.utils';
import { DeclarationRegistryUtils } from '../../utils/declaration-registry.utils';
import { ReferenceRegistryUtils } from '../../utils/reference-registry.utils';
import { LSPParserProxy } from '../../lsp-parser-proxy';



export class CompletionRegistryNode {

    // /**
    //  * allows to access triggers as binary tree, used for position search
    //  */
    // private triggers: BSTreeKV<PositionWrapper, BellaCompletionTrigger>;
    // private storage: BellaCompletionTrigger[];

    // constructor(nodes: BellaCompletionTrigger[], public namespace: string) {
    //     this.storage = nodes;
    //     // for (const t of nodes) {
    //     //     tree.add(t);
    //     // }
    //     // this.triggers = tree;
    // }

    private scopes: BSTreeKV<PositionWrapper, BellaScope>;

    constructor(nodes: BellaScope[], public namespace: string) {

        const tree = new BSTreeKV<PositionWrapper, BellaScope>(
            CompletionRegistryUtils.compareTriggers);
        for (const t of nodes) {
            tree.add(t);
        }
        this.scopes = tree;
    }

    getCompletionByPosition(row: number, col: number) {
        // let position = { col, row };
        // let pos: PositionWrapper = {
        //     range: { endPosition: position, startPosition: position }
        // }
        // return this.triggers?.search(pos);
        return this.getCompletionsByPosition(row, col)[0];
    }

    getCompletionsByPosition(row: number, col: number): BellaCompletionTrigger[] {
        // this.storage.sort(CompletionRegistryUtils.compareTriggers);
        // let position = { col, row };
        // let pos: PositionWrapper = {
        //     range: { endPosition: position, startPosition: position }
        // }
        // return this.storage.filter((t) => CompletionRegistryUtils.compareTriggers(pos, t) === 0);
        let position = { col, row };
        let pos: PositionWrapper = {
            range: { endPosition: position, startPosition: position }
        }
        let scope = this.scopes.search(pos);
        if (!scope || !scope?.content) {
            // empty scope
            return [];
        }

        //try parse
        const parser = new LSPParserProxy();
        const triggers = parser.scanForCompletions(scope.content).triggers;
        // find context triggers
        const relativePosition: PositionWrapper = {
            range: {
                startPosition: {
                    row: pos.range.startPosition.row - scope.range.startPosition.row,
                    col: pos.range.startPosition.col,
                },
                endPosition: {
                    row: pos.range.endPosition.row - scope.range.startPosition.row,
                    col: pos.range.endPosition.col,
                },
            }
        }
        const result = triggers.filter((t) =>
            CompletionRegistryUtils.compareTriggers(relativePosition, t) === 0);
        return result;
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
