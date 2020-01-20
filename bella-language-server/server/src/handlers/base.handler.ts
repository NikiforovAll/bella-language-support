import * as LSP from 'vscode-languageserver';
import { LSPReferenceRegistry } from '../registry/references-registry/lsp-references-registry';
import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';

export class BaseHandler {
    protected get connection(): LSP.Connection{
        if(!this._connection) {
            throw Error("Connection is not set");
        }
        return this._connection;
    }
    private _connection: LSP.Connection | undefined;

    setConnection(connection: LSP.Connection) {
        this._connection = connection;
    }
}
