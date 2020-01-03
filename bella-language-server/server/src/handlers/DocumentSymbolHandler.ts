import * as LSP from 'vscode-languageserver'
import { LanguageServerCacheWrapper } from '../language-server-cache-wrapper';

export class DocumentSymbolHandler {
    constructor(private cache: LanguageServerCacheWrapper) {
        this.cache = cache;
    }
    public findSymbols(params: LSP.DocumentSymbolParams): LSP.SymbolInformation[] {
        let docUri = params.textDocument.uri;
        return this.cache.getDeclarations(docUri);;
        // return this.analyzer.findSymbols(params.textDocument.uri);
    }
}
