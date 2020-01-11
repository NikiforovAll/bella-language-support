import {DocumentSymbolParams, LocationLink} from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../lsp-declaration-registry';

export class DefinitionHandler {
    constructor(private cache: LSPDeclarationRegistry) {
        this.cache = cache;
    }
    public findDefinitions(params: DocumentSymbolParams): LocationLink[] {

        // return this.cache.getLSPDeclarations(docUri);
        return [];
    }


}
