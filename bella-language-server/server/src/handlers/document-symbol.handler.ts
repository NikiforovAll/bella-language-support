import {DocumentSymbolParams, WorkspaceSymbolParams, SymbolInformation} from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';

export class DocumentSymbolHandler {
    constructor(private cache: LSPDeclarationRegistry) {
        this.cache = cache;
    }

    public findSymbols(params: DocumentSymbolParams): SymbolInformation[] {
        let docUri = params.textDocument.uri;
        return this.cache.getLSPDeclarations(docUri);
    }

    public findSymbolsInWorkspace(params: WorkspaceSymbolParams): SymbolInformation[] {
        return this.cache.getLSPDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            descendantsFilter: {
                active: false
            },
            overloadsFilter: {
                active: true,
                includeOverloads: true
            }
        });
    }
}
