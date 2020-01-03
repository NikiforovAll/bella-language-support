import * as LSP from "vscode-languageserver";
import { BellaLanguageSupport } from "bella-grammar";
import { BellaParser } from "bella-grammar/dist/grammars/.antlr4/BellaParser";
import { BellaLanguageParser } from "./ParserProxy";

type FileDeclarations = { [uri: string]: Declarations };
type Declarations = { [name: string]: LSP.SymbolInformation[] };
type Texts = { [uri: string]: string }

export default class BellaAnalyzer {
    private uriToDeclarations: FileDeclarations = {}
    private uriToTextDocument: { [uri: string]: LSP.TextDocument } = {}
    private uriToFileContent: Texts = {}


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
        parser: BellaLanguageParser
    }): Promise<BellaAnalyzer> {
        if (!rootPath) {
            return Promise.resolve(new BellaAnalyzer(parser))
        }
        return new Promise((resolve, reject) => {
            const analyzer = new BellaAnalyzer(parser);
            connection.console.log(`Analyzer initialized from ${rootPath}`);
            resolve(analyzer);
        })
    }

    private parser: BellaLanguageParser

    public constructor(parser: BellaLanguageParser) {
        this.parser = parser
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
    public analyze(uri: string, document: LSP.TextDocument): LSP.Diagnostic[] {
        const contents = document.getText()

        // const tree = this.parser.parse(contents)

        this.uriToTextDocument[uri] = document
        // this.uriToTreeSitterTrees[uri] = tree
        this.uriToDeclarations[uri] = {}
        this.uriToFileContent[uri] = contents

        const problems: LSP.Diagnostic[] = []

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

        return problems
    }
}
