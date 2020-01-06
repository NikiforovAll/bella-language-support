import {DocumentSymbolParams, WorkspaceSymbolParams, SymbolInformation} from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../lsp-declaration-registry';

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
            parentFilter: {
                active: true,
                hasParent: false
            }
        });
    }
}
