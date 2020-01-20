import * as vscode from 'vscode';
import { workspace } from 'vscode';
import * as path from 'path';
import * as WebSocket from 'ws';
import * as fs from 'fs-extra';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
    InitializeParams,
    InitializeResult
} from 'vscode-languageclient';
import { addAssetsIfNecessary, AddAssetResult } from './assets';
import { getWorkspaceInformation } from './common';
import { SessionManager } from './session';

export function registerLanguageFeatures(context: vscode.ExtensionContext): LanguageClient {
    // The server is implemented in node
    let serverModule = context.asAbsolutePath(
        path.join('server', 'dist', 'index.js')
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
        middleware: new SessionManager()
        // synchronize: {
        //     // Notify the server about file changes
        //     fileEvents: workspace.createFileSystemWatcher('**/.bs')
        // }
    };
    let isLSPStreamingMode = vscode.workspace
        .getConfiguration()
        .get('bellaLanguageServer.enableLSPInspectorForwarding', false);

    if (isLSPStreamingMode) {
        // Hijacks all LSP logs and redirect them to a specific port through WebSocket connection
        const websocketOutputChannel: vscode.OutputChannel = createWebSocketListener();
        clientOptions.outputChannel = websocketOutputChannel;
    }

    // Create the language client and start the client.
    const client: LanguageClient | any = new LanguageClient(
        'bellaLanguageServer',
        'Bella Language Server',
        serverOptions,
        clientOptions,
    );

    // client.onNotification("core/showReferences", (payload) => {
    //     console.log("core/showReferences", payload);
    // });

    // Start the client. This will also launch the server
    let languageServerDisposable = client.start();
    context.subscriptions.push(languageServerDisposable);
    client.onReady().then(() => {
        const capabilities = client._capabilities;
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
        if (!capabilities.documentSymbolProvider) {
            console.warn('DocumentSymbolProvider is not provided');
            // const provider = new BellaDocumentSymbolProvider()
        }
        const workspaceInformation = getWorkspaceInformation();
        const shouldGenerateTasks = !(context.workspaceState.get<boolean>('assetPromptDisabled') && workspaceInformation.tasksGenerated);
        //  );
        if (shouldGenerateTasks) {
            addAssetsIfNecessary().then(result => {
                context.workspaceState.update('assetPromptDisabled', true);
            });
        }
        vscode.window.showInformationMessage("Bella Language Server is loaded! 🚀");
    });
    return client;
}

function createWebSocketListener(): vscode.OutputChannel {
    const socketPort = workspace.getConfiguration().get('bellaLanguageServer.LSPInspectorForwardingPortNumber', 7000);
    let socket: WebSocket | null = null;
    vscode.commands.registerCommand('bellaLanguageSupport.startStreaming', () => {
        // Establish websocket connection
        socket = new WebSocket(`ws://localhost:${socketPort}`);
        console.info("Trying to start streaming to LSP");
    });

    let log = '';
    const websocketOutputChannel: vscode.OutputChannel = {
        name: 'websocket',
        // Only append the logs but send them later
        append(value: string) {
            log += value;
            console.log(value);
        },
        appendLine(value: string) {
            log += value;
            // Don't send logs until WebSocket initialization
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(log);
            }
            log = '';
        },
        clear() { },
        show() { },
        hide() { },
        dispose() { }
    };
    return websocketOutputChannel;
}


