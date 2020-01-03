"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LSP = require("vscode-languageserver");
const DocumentSymbolHandler_1 = require("./handlers/DocumentSymbolHandler");
const analyzer_1 = require("./analyzer");
const ParserProxy_1 = require("./ParserProxy");
const DiagnosticsHandler_1 = require("./handlers/DiagnosticsHandler");
/**
 * The BashServer glues together the separate components to implement
 * the various parts of the Language Server Protocol.
 */
class BellaServer {
    constructor(connection, analyzer) {
        this.documents = new LSP.TextDocuments();
        this.connection = connection;
        this.analyzer = analyzer;
        this.diagnosticsHandler = new DiagnosticsHandler_1.DiagnosticsHandler(this.connection);
    }
    /**
     * Initialize the server based on a connection to the client and the protocols
     * initialization parameters.
     */
    static initialize(connection, { rootPath }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = BellaServer.initializeParser();
            return Promise.all([analyzer_1.default.fromRoot({ connection, rootPath, parser }),
            ]).then(xs => {
                const analyzer = xs[0];
                return new BellaServer(connection, analyzer);
            });
        });
    }
    /**
     * Register handlers for the events from the Language Server Protocol that we
     * care about.
     */
    register(connection) {
        //TODO: add state machine for status of server: started, indexing, working, error. As it described in apex LSP impl
        // The content of a text document has changed. This event is emitted
        // when the text document first opened or when its content has changed.
        this.documents.listen(this.connection);
        this.documents.onDidChangeContent((change) => {
            const { uri } = change.document;
            this.diagnosticsHandler.validateTextDocument(change.document);
            this.analyzer.analyze(uri, change.document);
        });
        // Register all the handlers for the LSP events.
        // connection.onHover(this.onHover.bind(this))
        // connection.onDefinition(this.onDefinition.bind(this))
        connection.onDocumentSymbol(this.onDocumentSymbol.bind(this));
        // connection.onDocumentHighlight(this.onDocumentHighlight.bind(this))
        // connection.onReferences(this.onReferences.bind(this))
        // connection.onCompletion(this.onCompletion.bind(this))
        // connection.onCompletionResolve(this.onCompletionResolve.bind(this))
    }
    /**
     * The parts of the Language Server Protocol that we are currently supporting.
     */
    capabilities() {
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
            documentSymbolProvider: true,
        };
    }
    onDocumentSymbol(params) {
        let handler = new DocumentSymbolHandler_1.DocumentSymbolHandler(this.analyzer.cache);
        return handler.findSymbols(params);
    }
    static initializeParser() {
        return new ParserProxy_1.BellaDocumentParser();
    }
}
exports.default = BellaServer;
//# sourceMappingURL=server.js.map