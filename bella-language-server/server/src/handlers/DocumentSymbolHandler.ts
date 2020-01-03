import * as LSP from 'vscode-languageserver'

export class DocumentSymbolHandler {
    public findSymbols(params: LSP.DocumentSymbolParams): LSP.SymbolInformation[] {
        let docUri = params.textDocument.uri;
        return [];
        // return this.analyzer.findSymbols(params.textDocument.uri);
    }
}
