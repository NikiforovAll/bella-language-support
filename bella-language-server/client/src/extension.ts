import * as path from 'path';
import { workspace, ExtensionContext, commands, env, Uri} from 'vscode';

const COOKBOOK_URL='https://serene-mcnulty-01b0f0.netlify.com/syntax/bella-services.html/'

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	registerCommands(context);
	registerServer(context);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

function registerCommands(context: ExtensionContext) {

	const command = 'bellaLanguageSupport.openCookBook';

	const commandHandler = () => {
		env.openExternal(Uri.parse(COOKBOOK_URL));
	};
	context.subscriptions.push(
		commands
			.registerCommand(command, commandHandler)
	);
}

function registerServer(context: ExtensionContext) {
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
	client = new LanguageClient(
		'bellaLanguageServer',
		'Bella Language Server',
		serverOptions,
		clientOptions,
		forceDebug
	);

	// Start the client. This will also launch the server
	client.start();
}
