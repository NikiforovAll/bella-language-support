"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const diagnostics_factory_1 = require("./diagnostics-factory");
// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
// Create a simple text document manager. The text document manager
// supports full document sync only
let documents = new vscode_languageserver_1.TextDocuments();
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = true;
connection.onInitialize((params) => {
    let capabilities = params.capabilities;
    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
        }
    };
});
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { maxNumberOfProblems: 10 };
let globalSettings = defaultSettings;
// Cache the settings of all open documents
let documentSettings = new Map();
connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    }
    else {
        globalSettings = ((change.settings.languageServerExample || defaultSettings));
    }
    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'bellaLanguageServer'
        });
        documentSettings.set(resource, result);
    }
    return result;
}
// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});
function validateTextDocument(textDocument) {
    return __awaiter(this, void 0, void 0, function* () {
        // In this simple example we get the settings for every validate run.
        let settings = yield getDocumentSettings(textDocument.uri);
        let text = textDocument.getText();
        // let pattern = /out\s+(\w+)/g;
        // TODO: know issue, it doesn't work if procedure is defined as last in this file and there is no capturing end tokens for this case and $ symbol as end of line doesn't work
        let pattern = /(?=out\s+(\w+\b))(?:[\s\S]*?)(?<matched>[^/]\s\1\b\s*\=|(?<stop>procedure|formula|generic|specific|object|setting|service|hosted|persistent|external))/g;
        let m;
        // var result = text.match(new RegExp(number + '\\s(\\w+)'))[1];
        // pattern2 = /(?<=out\s+(\w+\b))(?:[\s\S]*)(?:procedure|object|formula|generic|specific)
        let problems = 0;
        let diagnostics = [];
        while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
            let localParamIndexOf = m[0].indexOf(m[1]);
            let capturedOutParam = {
                name: m[1],
                start: m.index + localParamIndexOf,
                end: m.index + localParamIndexOf + (m[1] || '').length
            };
            // TODO: this should be possible via regex
            let declarationPerformed = !m[3]; // do something with $m
            // 	localDeclaration2.match(new RegExp(matchedContent + '\\\s+=', ''));
            if (!declarationPerformed) {
                let pattern = /out\s+(\w+)/g;
                let factory = new diagnostics_factory_1.DiagnosticsFactory(hasDiagnosticRelatedInformationCapability);
                let range = {
                    start: textDocument.positionAt(capturedOutParam.start),
                    end: textDocument.positionAt(capturedOutParam.end)
                };
                let diagnostic = factory.createDiagnostics(range, `Output parameter "${capturedOutParam.name}" is declared but never assigned.`, textDocument.uri);
                diagnostics.push(diagnostic);
                problems++;
            }
        }
        // Send the computed diagnostics to VSCode.
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    });
}
connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
    connection.console.log('We received an file change event');
});
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map