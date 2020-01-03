import * as LSP from 'vscode-languageserver';

import { DocumentSymbolHandler } from './handlers/DocumentSymbolHandler';
import BellaAnalyzer from './analyzer';
import { BellaLanguageParser } from './ParserProxy';
import { DiagnosticsHandler } from './handlers/DiagnosticsHandler';


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
		// The content of a text document has changed. This event is emitted
		// when the text document first opened or when its content has changed.
		this.documents.listen(this.connection)
		this.documents.onDidChangeContent((change: LSP.TextDocumentChangeEvent) => {
			const { uri } = change.document
			this.diagnosticsHandler.validateTextDocument(change.document);
			// const diagnostics = this.analyzer.analyze(uri, change.document)
		})
		// Register all the handlers for the LSP events.
		// connection.onHover(this.onHover.bind(this))
		// connection.onDefinition(this.onDefinition.bind(this))
		connection.onDocumentSymbol(this.onDocumentSymbol.bind(this))
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
			// definitionProvider: true,
			// documentSymbolProvider: true,
			// referencesProvider: true,
		}
	}

	private onDocumentSymbol(params: LSP.DocumentSymbolParams): LSP.SymbolInformation[] {
		let handler = new DocumentSymbolHandler();
		return handler.findSymbols(params);
	}

	private static initializeParser() {
		return new BellaLanguageParser();
	}
}

