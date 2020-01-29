import { DocumentSymbolParams, LocationLink, Position } from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { LSPReferenceRegistry } from '../registry/references-registry/lsp-references-registry';
import { ReferenceFactoryMethods } from '../factories/reference.factory';
import { BellaReferenceType, DeclarationType, BellaNestedReference, BellaAmbiguousReference } from 'bella-grammar';
import { NodeRegistrySearchQuery } from '../registry/declaration-registry/declaration-registry-query';
import _ = require('lodash');
export class DefinitionHandler {
    constructor(
        private cache: LSPDeclarationRegistry, private refCache: LSPReferenceRegistry) {
    }
    /**
     * Find all the locations where something named name has been defined.
     */
    public findDefinitions(params: DocumentSymbolParams & HasPosition): LocationLink[] {

        let referenceToken = this.refCache
            .getReference(
                params.position.line,
                params.position.character,
                params.textDocument.uri);
        if (!referenceToken || referenceToken.isDeclaration) {
            return [];
        }
        let nameTo = referenceToken.nameTo;
        let referenceTo = referenceToken.referenceTo;
        let descendantsQuery: NodeRegistrySearchQuery | undefined;
        if (referenceToken.referenceType && referenceToken.referenceType == BellaReferenceType.NestedReference) {
            const childType = (referenceToken as BellaNestedReference).childType//DeclarationType.ServiceEntry
            const childName = (referenceToken as BellaNestedReference).childTo
            descendantsQuery = {
                uriFilter: {
                    active: false
                },
                typeFilter: {
                    active: true,
                    type: childType
                },
                nameFilter: {
                    active: true,
                    name: childName
                }
            };
        }
        let symbols = this.cache.getLSPDeclarationsForNameAndType(
            nameTo,
            referenceTo,
            params.textDocument.uri,
            descendantsQuery
        );
        const ambiguousToken = referenceToken as BellaAmbiguousReference;
        const fallbackTypes = ambiguousToken.possibleTypes;
        if(fallbackTypes && _.isEmpty(symbols)) {
            for (let index = 0; index < fallbackTypes.length; index++) {
                let fallbackSearchResult = this.cache.getLSPDeclarationsForNameAndType(
                    fallbackTypes[index].nameTo,
                    fallbackTypes[index].referenceTo,
                    params.textDocument.uri
                );
                if(!_.isEmpty(fallbackSearchResult)) {
                    symbols = fallbackSearchResult;
                    break;
                }
            }
        }
        let result: LocationLink[] = [];
        for (const symbol of symbols) {
            let ll = ReferenceFactoryMethods.createLSPLocationLink(symbol, referenceToken);
            result.push(ll);
        }
        return result;
    }
}

interface HasPosition {
    position: Position
}
