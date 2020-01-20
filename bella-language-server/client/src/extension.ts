import { commands, env, ExtensionContext, Uri } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

import { registerLanguageFeatures } from './bella-server-bootstrap';
import { generateAssets } from './assets';

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

	context.subscriptions.push(
		commands.registerCommand('bellaLanguageSupport.openCookBook', () => {
			env.openExternal(Uri.parse(COOKBOOK_URL));
		}
	));
	context.subscriptions.push(
		commands.registerCommand('bellaLanguageSupport.generateAssets',
			async () => generateAssets()));

	context.subscriptions.push(
		commands.registerCommand('bella.makeServerSnapshot',
			async () => (client as LanguageClient).sendNotification("parser/make-snapshot")));
}

function registerServer(context: ExtensionContext) {
	client = registerLanguageFeatures(context)
}
