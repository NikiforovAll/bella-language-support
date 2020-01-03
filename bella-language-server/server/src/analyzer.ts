import * as LSP from "vscode-languageserver";

import { BellaDocumentParser } from "./ParserProxy";
import * as glob from 'glob';
import * as path from 'path'
import * as fs from 'fs'

type FileDeclarations = { [uri: string]: Declarations };
type Declarations = { [name: string]: LSP.SymbolInformation[] };
type Texts = { [uri: string]: string }

export default class BellaAnalyzer {
    private uriToDeclarations: FileDeclarations = {}
    private uriToTextDocument: { [uri: string]: LSP.TextDocument } = {}
    private uriToFileContent: Texts = {}
    private connection: LSP.Connection;


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
        parser: BellaDocumentParser
    }): Promise<BellaAnalyzer> {
        if (!rootPath) {
            return Promise.resolve(new BellaAnalyzer(parser, connection))
        }
        return new Promise((resolve, reject) => {
            glob('**/*.bs', { cwd: rootPath }, (err: any, paths: string[]) => {
                if (err != null) {
                    reject(err)
                } else {
                    const analyzer = new BellaAnalyzer(parser, connection)
                    paths.forEach(p => {
                    const absolute = path.join(rootPath, p)
                    // only analyze files, glob pattern may match directories
                    if (fs.existsSync(absolute) && fs.lstatSync(absolute).isFile()) {
                        const uri = `file://${absolute}`
                        connection.console.log(`Analyzing ${uri}`)
                        analyzer.analyze(
                        uri,
                        LSP.TextDocument.create(
                            uri,
                            'bella',
                            1,
                            fs.readFileSync(absolute, 'utf8'),
                        ),
                        )
                    }
                    })
                    resolve(analyzer)
                }
                })
        })
    }

    private parser: BellaDocumentParser

    public constructor(parser: BellaDocumentParser, connection: LSP.Connection) {
        this.parser = parser
        this.connection = connection;
    }

    /**
     * Find all the locations where something named name has been defined.
     */
    // public findDefinition(name: string): LSP.Location[] {
    //     const symbols: LSP.SymbolInformation[] = [];
    //     Object.keys(this.uriToDeclarations).forEach(uri => {
    //         const declarationNames = this.uriToDeclarations[uri][name] || [];
    //         declarationNames.forEach(d => symbols.push(d));
    //     });
    //     return symbols.map(s => s.location);
    // }

    /**
     * Analyze the given document, cache the tree-sitter AST, and iterate over the
     * tree to find declarations.
     *
     * Returns all, if any, syntax errors that occurred while parsing the file.
     *
     */
    public analyze(uri: string, document: LSP.TextDocument){
        const contents = document.getText();

        // const tree = this.parser.parse(contents)
        // TODO: add working with cache
        try {
            let res = this.parser.parse(contents);
        } catch (error) {
            this.connection.console.warn(error);
        }

        // this.uriToTextDocument[uri] = document
        // this.uriToTreeSitterTrees[uri] = tree
        // this.uriToDeclarations[uri] = {}
        // this.uriToFileContent[uri] = contents
        // const problems: LSP.Diagnostic[] = []

        // TreeSitterUtil.forEach(tree.rootNode, (n: Parser.SyntaxNode) => {
        // if (n.type === 'ERROR') {
        //     problems.push(
        //     LSP.Diagnostic.create(
        //         TreeSitterUtil.range(n),
        //         'Failed to parse expression',
        //         LSP.DiagnosticSeverity.Error,
        //     ),
        //     )
        //     return
        // } else if (TreeSitterUtil.isDefinition(n)) {
        //     const named = n.firstNamedChild
        //     const name = contents.slice(named.startIndex, named.endIndex)
        //     const namedDeclarations = this.uriToDeclarations[uri][name] || []

        //     const parent = TreeSitterUtil.findParent(n, p => p.type === 'function_definition')
        //     const parentName = parent
        //     ? contents.slice(
        //         parent.firstNamedChild.startIndex,
        //         parent.firstNamedChild.endIndex,
        //         )
        //     : null

        //     namedDeclarations.push(
        //     LSP.SymbolInformation.create(
        //         name,
        //         this.treeSitterTypeToLSPKind[n.type],
        //         TreeSitterUtil.range(n),
        //         uri,
        //         parentName,
        //     ),
        //     )
        //     this.uriToDeclarations[uri][name] = namedDeclarations
        // }
        // })

        // function findMissingNodes(node: Parser.SyntaxNode) {
        // if (node.isMissing()) {
        //     problems.push(
        //     LSP.Diagnostic.create(
        //         TreeSitterUtil.range(node),
        //         `Syntax error: expected "${node.type}" somewhere in the file`,
        //         LSP.DiagnosticSeverity.Warning,
        //     ),
        //     )
        // } else if (node.hasError()) {
        //     node.children.forEach(findMissingNodes)
        // }
        // }

        // findMissingNodes(tree.rootNode)

        // return problems;
    }
}
