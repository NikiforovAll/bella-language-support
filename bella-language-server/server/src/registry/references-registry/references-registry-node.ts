import { BellaReference, BellaReferenceType, BellaNestedReference } from 'bella-grammar';
import { isNil } from 'lodash';
import { BSTreeKV } from 'typescript-collections';

import { PositionWrapper, ReferenceRegistryUtils } from '../../utils/reference-registry.utils';
import { ReferencesRegistrySearchQuery } from './references-registry-query';

export class ReferencesRegistryNode {

    /**
     * allows to access references as binary tree, used for position search
     */
    private referencesToSearch: BSTreeKV<PositionWrapper, BellaReference>;

    constructor(nodes: BellaReference[], public namespace: string) {
        const tree = new BSTreeKV<PositionWrapper, BellaReference>(ReferenceRegistryUtils.compareReferences);
        // TODO: measure potential impact of working with this data structure
        for (const ref of nodes) {
            tree.add(ref);
        }
        this.referencesToSearch = tree;
    }

    getReferenceByPosition(row: number, col: number) {
        let position = { col, row };
        let pos: PositionWrapper = {
            range: { endPosition: position, startPosition: position }
        }
        return this.referencesToSearch?.search(pos);
    }

    /**
     * Returns all references that are not declaration (currently, declarations are all stored in this registry)
     * @param query - query to search through declarations
     */
    getReferences(query: ReferencesRegistrySearchQuery): BellaReference[] {

        if (!isNil(query)) {
            let { typeFilter, nameFilter, descendantsFilter } = query;
            if (typeFilter?.active || nameFilter?.active) {
                return this.getValues().filter(ref => {
                    let passed = true;
                    if(ref.isDeclaration) {
                        return false;
                    }
                    if (!isNil(typeFilter) && typeFilter?.active) {
                        passed = passed && (ref.referenceTo === typeFilter.type);
                    }
                    if (!isNil(nameFilter) && nameFilter.active) {
                        passed = passed && (ref.nameTo === nameFilter.name);
                    }
                    //descendant references is declared like this
                    if(descendantsFilter
                        && descendantsFilter.active
                        && ref.referenceType === BellaReferenceType.NestedReference) {
                        let nestedRef = ref as BellaNestedReference
                        passed = passed
                            && nestedRef.childTo === descendantsFilter.query.name
                            && nestedRef.childType === descendantsFilter.query.type
                    }
                    return passed;
                });
            }
        }
        console.warn('getReferences - all values are returned - query is empty');
        return this.getValues();
    }

    private getValues(): BellaReference[] {
        return this.referencesToSearch.toArray()
    }
}
