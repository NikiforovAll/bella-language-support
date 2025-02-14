import { DocumentSymbolParams, Location, Position, ReferenceParams } from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { LSPReferenceRegistry } from '../registry/references-registry/lsp-references-registry';
import { ReferenceFactoryMethods } from '../factories/reference.factory';
import { ReferencesRegistrySearchQuery } from '../registry/references-registry/references-registry-query';
import { CommonUtils } from '../utils/common.utils';
import { DeclarationType } from 'bella-grammar';

export class ReferenceHandler {
    constructor(
        private cache: LSPDeclarationRegistry, private refCache: LSPReferenceRegistry) {
    }

    public findReferences(params: ReferenceParams): Location[] {
        let referenceToken = this.refCache
            .getReference(
                params.position.line,
                params.position.character,
                params.textDocument.uri);
        if (!referenceToken || !referenceToken.isDeclaration) {
            return [];
        }
        // if it is service reference, we need to search everywhere
        let namespaceFilter = {
            active: referenceToken.referenceTo !== DeclarationType.Service,
            // active: referenceToken.referenceTo !== DeclarationType.ServiceEntry,
            namespace: CommonUtils.getNamespaceFromURI(params.textDocument.uri)
        };
        let query: ReferencesRegistrySearchQuery = {
            uriFilter: {
                active: false
            },
            namespaceFilter,
            nameFilter: {
                active: true,
                name: referenceToken.nameTo
            },
            typeFilter: {
                active: true,
                type: referenceToken.referenceTo
            }
        };
        let symbols = this.refCache.getLSPReferencesForQuery(query);
        return symbols;
    }

}
