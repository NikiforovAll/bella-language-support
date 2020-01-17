import { DocumentSymbolParams, LocationLink, Position } from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../lsp-declaration-registry';
import { LSPReferenceRegistry } from '../lsp-references-registry';
import { ReferenceFactoryMethods } from '../factories/reference.factory';

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
        let symbols = this.cache.getLSPDeclarationsForNameAndType(
            referenceToken.nameTo,
            referenceToken.referenceTo,
            params.textDocument.uri);
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
