import * as vscode from 'vscode';
import { workspace} from 'vscode';
import * as path from 'path';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

export function registerLanguageFeatures(context: vscode.ExtensionContext): LanguageClient {

		// The server is implemented in node
        let serverModule = context.asAbsolutePath(
            path.join('server', 'out', 'server.js')
        );
        // The debug options for the server
        // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
        let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        let serverOptions: ServerOptions = {
            run: { module: serverModule, transport: TransportKind.ipc },
            debug: {
                module: serverModule,
                transport: TransportKind.ipc,
                options: debugOptions
            }
        };

        // Options to control the language client
        let clientOptions: LanguageClientOptions = {
            documentSelector: [{ scheme: 'file', language: 'bella' }],
            synchronize: {
                // Notify the server about file changes to '.clientrc files contained in the workspace
                fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
            }
        };

        // Create the language client and start the client.
        //TODO: this is dirty fix, need to determine why it is not possible to attach debugger without this flag equals true
        let forceDebug = true
        const client: LanguageClient | any = new LanguageClient('bellaLanguageServer', 'Bella Language Server',
            serverOptions,
            clientOptions,
            forceDebug
        );
        // Start the client. This will also launch the server
        let languageServerDisposable = client.start();
        context.subscriptions.push(languageServerDisposable);
        client.onReady().then(() => {
            const capabilities = client._capabilites;
            if (!capabilities) {
                return vscode.window.showErrorMessage('The language server is not able to serve any features at the moment.');
            }

            // Fallback to default providers for unsupported or disabled features.

            if (!capabilities.completionProvider) {
                console.warn('CompletionItemProvider is not provided');
                // const provider = new GoCompletionItemProvider(ctx.globalState);
                // context.subscriptions.push(provider);
                // context.subscriptions.push(vscode.languages.registerCompletionItemProvider(GO_MODE, provider, '.', '\"'));
            }
        });
        return client;
}


