import * as LSP from 'vscode-languageserver';

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
