import * as LSP from 'vscode-languageserver';

import { DocumentSymbolHandler } from './handlers/document-symbol.handler';
import BellaAnalyzer from './bella-analyzer';
import { LSPParserProxy } from './lsp-parser-proxy';
import { DiagnosticsHandler } from './handlers/diagnostics.handler';
import { DefinitionHandler } from './handlers/definition.handler';


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

		return Promise.all([BellaAnalyzer.fromRoot({ connection, rootPath, parser }),
		]).then(xs => {
			const analyzer = xs[0]
			return new BellaServer(connection, analyzer);
		})
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
		// connection.onReferences(this.onReferences.bind(this))
		// connection.onCompletion(this.onCompletion.bind(this))
		// connection.onCompletionResolve(this.onCompletionResolve.bind(this))
	}

	/**
	 * The parts of the Language Server Protocol that we are currently supporting.
	 */
	public capabilities(): LSP.ServerCapabilities {
		return {
			// For now we're using full-sync even though tree-sitter has great support
			// for partial updates.
			textDocumentSync: this.documents.syncKind,
			// completionProvider: {
			// 	resolveProvider: true,
			// },
			// hoverProvider: true,
			// documentHighlightProvider: true,
			definitionProvider: true,
			documentSymbolProvider: true,
			workspaceSymbolProvider: true
			// referencesProvider: true,
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

	private onDefinition(params: LSP.TextDocumentPositionParams) {
		let handler = new DefinitionHandler(
			this.analyzer.declarationCache,
			this.analyzer.referencesCache);
		return handler.findDefinitions(params);
	}

	private static initializeParser() {
		return new LSPParserProxy();
	}
}

