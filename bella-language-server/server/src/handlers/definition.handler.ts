import {DocumentSymbolParams, LocationLink, Position} from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../lsp-declaration-registry';
import { LSPReferenceRegistry } from '../lsp-references-registry';

export class DefinitionHandler {
    constructor(
        private cache: LSPDeclarationRegistry, private refCache: LSPReferenceRegistry) {
    }
    public findDefinitions(params: DocumentSymbolParams & HasPosition): LocationLink[] {

        let referenceToken = this.refCache
            .getReference(
                params.position.line,
                params.position.character,
                params.textDocument.uri);
        if(!referenceToken){
            return [];
        }
        let declarations = this.cache
            .getLSPDeclarationsForName(
                referenceToken.nameTo,
                params.textDocument.uri);
        //TODO: major Map Declaration to LocationLink
        return [];
    }
}

interface HasPosition {
    position: Position
}
