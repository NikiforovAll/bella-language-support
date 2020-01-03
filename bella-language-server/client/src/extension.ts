import { commands, env, ExtensionContext, Uri, workspace } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

import { registerLanguageFeatures } from './bella-server-bootstrap';

const COOKBOOK_URL = 'https://serene-mcnulty-01b0f0.netlify.com/syntax/bella-services.html/'

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
	client = registerLanguageFeatures(context)
}
