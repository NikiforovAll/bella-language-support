import * as NodeCache from 'node-cache';
import { BaseDeclaration, DeclarationType, Position, Range } from 'bella-grammar';
import * as LSP from 'vscode-languageserver';

export class LSPDeclarationRegistry {


    //TODO: consider to have an array of this for each component to support global level cache
    //TODO: need to be able to get all tokens for component
    private cache: NodeCache;

    constructor() {
        this.cache = new NodeCache({
            checkperiod: 0,
            stdTTL: 0
        })
    }
    public setDeclaration(name: string, uri: string, declaration: BaseDeclaration) {
        this.cache.set(name, createLSPDeclaration(declaration, uri));
    }

    public setDeclarations(uri: string, declarations: BaseDeclaration[]) {
        let mappedDeclarations = declarations.map(d => createLSPDeclaration(d, uri));
        mappedDeclarations.forEach((d: LSP.SymbolInformation) => {
            this.cache.set(d.name, d);
        });
        this.cache.set(uri, mappedDeclarations);
    }

    public getDeclaration(name: string) {
        this.cache.get(name);
    }

    public getDeclarations(uri: string): LSP.SymbolInformation[] {
        return this.cache.get(uri) as LSP.SymbolInformation[];
    }
}
function createLSPDeclaration(declaration: BaseDeclaration, uri: string): LSP.SymbolInformation {
    return LSP.SymbolInformation.create(
        declaration.name,
        parserTypeToLSPType(declaration.type),
        range(declaration.range),
        uri
        //TODO: add containerName
    )
}
function parserTypeToLSPType(type: DeclarationType): LSP.SymbolKind {
    switch (type) {
        case DeclarationType.ComponentService:
            return LSP.SymbolKind.Variable;
            break;
        default:
            return LSP.SymbolKind.Null;
            break;
    }
}

export function range(range: Range): LSP.Range {
    return LSP.Range.create(
        range.startPosition.row,
        range.startPosition.col,
        range.endPosition.row,
        range.endPosition.col,
    )
}
