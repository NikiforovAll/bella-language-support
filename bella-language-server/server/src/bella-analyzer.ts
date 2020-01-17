import * as LSP from "vscode-languageserver";

import { LSPParserProxy } from "./lsp-parser-proxy";
import * as glob from 'glob';
import * as path from 'path'
import * as fs from 'fs'
import { LSPDeclarationRegistry } from "./registry/declaration-registry/lsp-declaration-registry";
import { LSPReferenceRegistry } from "./registry/references-registry/lsp-references-registry";

type FileDeclarations = { [uri: string]: Declarations };
type Declarations = { [name: string]: LSP.SymbolInformation[] };
type Texts = { [uri: string]: string }

export default class BellaAnalyzer {
    // private uriToDeclarations: FileDeclarations = {}
    // private uriToTextDocument: { [uri: string]: LSP.TextDocument } = {}
    // private uriToFileContent: Texts = {}
    public declarationCache: LSPDeclarationRegistry;
    public referencesCache: LSPReferenceRegistry;
    private connection: LSP.Connection;


    private parser: LSPParserProxy

    public constructor(parser: LSPParserProxy, connection: LSP.Connection) {
        this.parser = parser
        this.connection = connection;
        this.declarationCache = new LSPDeclarationRegistry();
        this.referencesCache = new LSPReferenceRegistry();
    }

    /**
* Initialize the Analyzer based on a connection to the client and an optional
* root path.
*
* If the rootPath is provided it will initialize all *.sh files it can find
* anywhere on that path.
*/
    public static fromRoot({
        connection,
        rootPath,
        parser,
    }: {
        connection: LSP.Connection
        rootPath: string | null | undefined
        parser: LSPParserProxy
    }): Promise<BellaAnalyzer> {
        if (!rootPath) {
            return Promise.resolve(new BellaAnalyzer(parser, connection))
        }

        return new Promise((resolve, reject) => {
            glob('**/*.bs', { cwd: rootPath }, (err: any, paths: string[]) => {
                if (err != null) {
                    reject(err)
                } else {
                    const analyzer = new BellaAnalyzer(parser, connection);
                    let promises = paths.map(p => {
                        let absolute = path.join(rootPath, p);
                        return new Promise((res, rej) => {
                            if (fs.existsSync(absolute) && fs.lstatSync(absolute).isFile()) {
                                fs.readFile(absolute, 'utf8', function (err, data) {
                                    if (err) {
                                        console.warn(err);
                                        rej(err);
                                    } else {
                                        let uri = absolute;
                                        uri = uri.replace(":", "%3A");
                                        uri = uri.replace(/\\/g, "/");
                                        uri = "file:///" + uri;
                                        analyzer.analyze(
                                            LSP.TextDocument.create(
                                                uri,
                                                'bella',
                                                1,
                                                data,
                                            ),
                                        )
                                        let pr: FileProcessingResult = { status: FileProcessingStatus.OK, uri };
                                        res(pr);
                                    }
                                });
                            } else {
                                let pr_error: FileProcessingResult = {
                                    status: FileProcessingStatus.Error,
                                    uri: absolute,
                                    message: "Couldn't find file"
                                };
                                res(pr_error);
                            }
                        });
                    });
                    //TODO: MAJOR this this one blocks symbol loading but is correct from design standpoint
                    // consider to add server workers
                    Promise.all(promises)
                        .then((results) => {
                            connection.console.log(
                                `[Parsing is finished successfully], number of parsed files: ${results.length}`);
                            resolve(analyzer);
                        }).catch((onrejected) => {
                            console.warn('onrejected: ', onrejected);
                            reject(onrejected)
                            connection.console.log('[Parsing is failed]');
                        })
                    //server initialized after all callbacks are fired but not re solved
                    // resolve(analyzer);
                }
            });
        });
    }

    /**
     * Analyze the given document, cache the tree-sitter AST, and iterate over the
     * tree to find declarations.
     *
     * Returns all, if any, syntax errors that occurred while parsing the file.
     *
     */
    public analyze(document: LSP.TextDocument) {
        const contents = document.getText();
        let { uri } = document;
        try {
            this.connection.console.log(`Analyzing ${uri}`)
            let res = this.parser.parse(contents);
            this.declarationCache.setDeclarations(res.declarations, uri);
            this.referencesCache.setReferences(res.references, uri);
        } catch (error) {
            this.connection.console.warn(`Parsing Error in ${uri}: ${error}`);
        }
        //text snippet below
    }
}

interface FileProcessingResult {
    status: FileProcessingStatus
    uri: string
    message?: string
}

enum FileProcessingStatus {
    OK,
    Error
}
