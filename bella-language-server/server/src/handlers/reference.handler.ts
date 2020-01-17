import { DocumentSymbolParams, Location, Position, ReferenceParams } from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../lsp-declaration-registry';
import { LSPReferenceRegistry } from '../lsp-references-registry';
import { ReferenceFactoryMethods } from '../factories/reference.factory';

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
        if (!referenceToken) {
            return [];
        }
        console.log('referenceToken', referenceToken);
        return [];
    }

}
