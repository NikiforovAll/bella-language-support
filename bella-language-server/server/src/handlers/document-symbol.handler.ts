import * as LSP from 'vscode-languageserver'
import { LSPDeclarationRegistry } from '../lsp-declaration-registry';

export class DocumentSymbolHandler {
    constructor(private cache: LSPDeclarationRegistry) {
        this.cache = cache;
    }
    public findSymbols(params: LSP.DocumentSymbolParams): LSP.SymbolInformation[] {
        let docUri = params.textDocument.uri;
        return this.cache.getDeclarations(docUri);;
        // return this.analyzer.findSymbols(params.textDocument.uri);
    }
}
