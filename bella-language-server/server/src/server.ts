import * as LSP from 'vscode-languageserver';

import { DocumentSymbolHandler } from './handlers/document-symbol.handler';
import BellaAnalyzer from './bella-analyzer';
import { LSPParserProxy } from './lsp-parser-proxy';
import { DiagnosticsHandler } from './handlers/diagnostics.handler';
import { DefinitionHandler } from './handlers/definition.handler';
import { ReferenceHandler } from './handlers/reference.handler';
import { SnapshotHandler } from './handlers/snapshot.handler';
import { CodeLensHandler, CodeLensPayload } from './handlers/codeLens.handler';
import { CommonUtils } from './utils/common.utils';
import { ReferenceFactoryMethods } from './factories/reference.factory';
import { DeclarationFactoryMethods } from './factories/declaration.factory';
import { KeyedDeclaration } from './registry/declaration-registry/lsp-declaration-registry';
import { CompletionHandler } from './handlers/complition.handler';
import { LSPCompletionRegistry } from './registry/completion-registry.ts/lsp-completion-registry';


/**
 * The BashServer glues together the separate components to implement
 * the various parts of the Language Server Protocol.
 */
export default class BellaServer {
	/**
	 * Initialize the server based on a connection to the client and the protocols
	 * initialization parameters.
	 */
	public static async initialize(
		connection: LSP.Connection,
		{ rootPath }: LSP.InitializeParams,
	): Promise<BellaServer> {
		const parser = BellaServer.initializeParser()
		let serverInitialization = Promise.all([BellaAnalyzer.fromRoot({ connection, rootPath, parser }),
		]).then(xs => {
			const analyzer = xs[0]
			return new BellaServer(connection, analyzer);
		});
		serverInitialization.catch((onrejection) => {
			connection.console.log('Error during component initialization' + onrejection);
		});
		return serverInitialization;

	}

	private analyzer: BellaAnalyzer

	private documents: LSP.TextDocuments = new LSP.TextDocuments()
	private connection: LSP.Connection
	private diagnosticsHandler: DiagnosticsHandler;

	private constructor(
		connection: LSP.Connection,
		analyzer: BellaAnalyzer,
	) {
		this.connection = connection;
		this.analyzer = analyzer;
		this.diagnosticsHandler = new DiagnosticsHandler(this.connection);
	}

	/**
	 * Register handlers for the events from the Language Server Protocol that we
	 * care about.
	 */
	public register(connection: LSP.Connection): void {
		this.documents.listen(this.connection)
		this.documents.onDidChangeContent((change: LSP.TextDocumentChangeEvent) => {
			const { uri } = change.document
			// this.diagnosticsHandler.validateTextDocument(change.document);
			this.analyzer.analyze(change.document);
		})
		// Register all the handlers for the LSP events.
		// connection.onHover(this.onHover.bind(this))
		connection.onDefinition(this.onDefinition.bind(this));
		connection.onDocumentSymbol(this.onDocumentSymbol.bind(this));
		connection.onWorkspaceSymbol(this.onWorkspaceSymbol.bind(this));
		// connection.onDocumentHighlight(this.onDocumentHighlight.bind(this))
		connection.onReferences(this.onReferences.bind(this))
		connection.onNotification("parser/make-snapshot", this.onMakeSnapshot.bind(this));
		connection.onNotification("core/findReferences", this.onLazyReferences.bind(this));
		connection.onNotification("core/goToDeclaration", this.onLazyDeclaration.bind(this));
		connection.onCodeLens(this.onCodeLens.bind(this));
		connection.onCodeLensResolve(this.onCodeLensResolve.bind(this));
		connection.onCompletion(this.onCompletion.bind(this))
		connection.onCompletionResolve(this.onCompletionResolve.bind(this))
	}

	/**
	 * The parts of the Language Server Protocol that we are currently supporting.
	 */
	public capabilities(): LSP.ServerCapabilities {
		return {
			// For now we're using full-sync even though tree-sitter has great support
			// for partial updates.
			textDocumentSync: this.documents.syncKind,
			completionProvider: {
				resolveProvider: true,
			},
			// hoverProvider: true,
			// documentHighlightProvider: true,
			definitionProvider: true,
			documentSymbolProvider: true,
			workspaceSymbolProvider: true,
			referencesProvider: true,
			codeLensProvider: {
				resolveProvider: true
			}
		}
	}

	private onDocumentSymbol(params: LSP.DocumentSymbolParams): LSP.SymbolInformation[] {
		let handler = new DocumentSymbolHandler(this.analyzer.declarationCache);
		return handler.findSymbols(params);
	}
	private onWorkspaceSymbol(params: LSP.WorkspaceSymbolParams): LSP.SymbolInformation[] {
		let handler = new DocumentSymbolHandler(this.analyzer.declarationCache);
		return handler.findSymbolsInWorkspace(params);
	}

	private onDefinition(params: LSP.TextDocumentPositionParams) : LSP.LocationLink[] {
		let handler = new DefinitionHandler(
			this.analyzer.declarationCache,
			this.analyzer.referencesCache);
		return handler.findDefinitions(params);
	}

	private onReferences(params : LSP.ReferenceParams): LSP.Location[]{
		let handler = new ReferenceHandler(this.analyzer.declarationCache,this.analyzer.referencesCache);
		return handler.findReferences(params);
	}

	private onCodeLens(params: LSP.CodeLensParams): LSP.CodeLens[] {
		let handler = new CodeLensHandler(this.analyzer.declarationCache, this.analyzer.referencesCache);
		return handler.getCodeLens(params.textDocument);
	}

	private onCodeLensResolve(codeLens: LSP.CodeLens): LSP.CodeLens{
		let handler = new CodeLensHandler(this.analyzer.declarationCache, this.analyzer.referencesCache);
		return handler.resolve(codeLens);
	}

	private onMakeSnapshot() {
		let handler =  new SnapshotHandler(
			this.analyzer.declarationCache,
			this.analyzer.referencesCache);
		handler.setConnection(this.connection);
		handler.makeSnapshot();
	}

	private onLazyReferences(payload: CodeLensPayload) {
        let { uri, declaration, parentDeclaration }: CodeLensPayload = (payload as CodeLensPayload);
		let handler = new CodeLensHandler(this.analyzer.declarationCache, this.analyzer.referencesCache);
		let refs = handler.resolveDeclaration(uri, declaration, parentDeclaration);
		let referencesResult = [
			uri,
			CommonUtils.position(declaration.range.startPosition),
			ReferenceFactoryMethods.toLSPLocations(refs)
		]
		this.connection.sendNotification("core/showReferencesCallback", referencesResult);
	}

	private onLazyDeclaration(payload: CodeLensPayload) {
		let { uri, declaration }: CodeLensPayload = (payload as CodeLensPayload);
		let referencesResult = [
			uri,
			CommonUtils.position(declaration.range.startPosition),
			[DeclarationFactoryMethods.toLSPLocation((declaration as KeyedDeclaration))]
		]
		this.connection.sendNotification("core/goToDeclarationCallback", referencesResult);
	}

	private onCompletion(payload: LSP.CompletionParams): LSP.CompletionItem[]  {
		let handler = new CompletionHandler(this.analyzer.declarationCache, new LSPCompletionRegistry());
		return handler.complete(payload);
	}

	private onCompletionResolve(item: LSP.CompletionItem): LSP.CompletionItem {
		throw new Error('Not implemented exception');
	}

	private static initializeParser() {
		return new LSPParserProxy();
	}
}


// export interface BellaLanguageServerParsingResult {
// 	server: BellaServer;
// 	initialParsingInfo: InitialParsingInfo

// }

// export interface InitialParsingInfo {
// 	numberOfProcessedFiles: number;
// 	numberOFErrors: number;
// }
