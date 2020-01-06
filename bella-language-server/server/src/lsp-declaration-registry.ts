import * as NodeCache from 'node-cache';
import { BaseDeclaration, DeclarationType, Position, Range } from 'bella-grammar';
import * as LSP from 'vscode-languageserver';
import { Dictionary } from 'typescript-collections';
import { isEmpty, isNil } from 'lodash';
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
    public setDeclarations(declarations: BaseDeclaration[], uri: string) {
        let nrURI = RegistryUtils.normalizeURI(uri);
        this.cache.set(nrURI, RegistryUtils.createRegistryNode(declarations, nrURI));
    }

    public getRegistryNode(uri: string): DeclarationRegistryNode {
        let nrURI = RegistryUtils.normalizeURI(uri);
        if (isEmpty(nrURI) || !this.cache.has(nrURI)) {
            console.warn(`Registry with specified key ${nrURI} is not found`);
            return RegistryUtils.createRegistryNode([], nrURI);
        }
        return this.cache.get(nrURI) as DeclarationRegistryNode;
    }

    public getLSPDeclarations(uri: string): LSP.SymbolInformation[] {
        return this.getLSPDeclarationsForQuery({
            uriFilter: {
                active: true, uri
            }
        });
    }

    public getLSPDeclarationsForQuery(query: NodeRegistrySearchQuery): LSP.SymbolInformation[] {
        return RegistryUtils.toLSPDeclarations(
            this.getDeclarationsForQuery(query));
    }

    private getDeclarationsForQuery(query: NodeRegistrySearchQuery): KeyedDeclaration[] {
        if (query.uriFilter.active) {
            return this.getRegistryNode(query.uriFilter.uri || '').getDeclarations(query);
        }
        // global search
        let mergedResult: KeyedDeclaration[] = [];
        for (const registry_key of this.cache.keys()) {
            let registry = this.cache.get<DeclarationRegistryNode>(registry_key);
            if(!isNil(registry)){
                mergedResult.push(...registry.getDeclarations());
            }
        }
        return mergedResult;
    }
}

class DeclarationRegistryNode {
    constructor(private nodes: Dictionary<DeclarationKey, KeyedDeclaration>, public namespace: string) {
    }
    getDeclarations(query?: NodeRegistrySearchQuery): KeyedDeclaration[] {
        let result = this.nodes.values();
        if(!isNil(query)) {
            let { typeFilter, parentFilter } =  query;
            result = result.filter(d => {
                let passed = true;
                if (!isNil(typeFilter) && typeFilter?.active) {
                    passed = passed && (d.content.type === typeFilter.type);
                }
                // TODO: add parent filter
                if(!isNil(parentFilter)) {
                }
                return true;
            });
        }
        return result;
    }
}

class KeyedDeclaration {
    constructor(
        public content: BaseDeclaration,
        public uri: string,
        parent?: BaseDeclaration) {
    }

}

class DeclarationKey {
    constructor(public name: string, public type: DeclarationType) {

    }
    toString() {
        return `${this.name} - ${this.type}`;
    }
}

interface NodeRegistrySearchQuery {
    uriFilter: {
        uri?: string
    } & Activatable

    typeFilter?: {
        type?: DeclarationType
    } & Activatable

    parentFilter?: {
        hasParent?: boolean
        parentName?: string
    } & Activatable
}

interface Activatable {
    active: boolean
}

namespace RegistryUtils {

    export function createRegistryNode(declarations: BaseDeclaration[], uri: string): DeclarationRegistryNode {
        let dict = new Dictionary<DeclarationKey, KeyedDeclaration>();
        for (let declaration of declarations) {
            dict.setValue(
                new DeclarationKey(declaration.name, declaration.type),
                new KeyedDeclaration(declaration, uri)
            );
        }
        let registry = new DeclarationRegistryNode(dict, getNamespaceFromURI(uri));
        return registry;
    }
    export function toLSPDeclarations(declarations: KeyedDeclaration[]): LSP.SymbolInformation[] {
        let mappedDeclarations = declarations.map(d => createLSPDeclaration(d));
        return mappedDeclarations;
    }

    function createLSPDeclaration(declaration: KeyedDeclaration): LSP.SymbolInformation {
        return LSP.SymbolInformation.create(
            declaration.content.name,
            parserTypeToLSPType(declaration.content.type),
            range(declaration.content.range),
            declaration.uri
            //TODO: add containerName
        )
    }

    export function normalizeURI(uri: string) {
        // return uri.toLowerCase();
        return uri;
    }

    export function getNamespaceFromURI(uri: string): string {
        // TODO: CRITICAL add functionally to get this token from configuration passed by client
        // getWorkspaceInformation() but for server
        const sourceCodeLocation = 'src/Domain/Components/';
        const componentDelimiter = '/'
        const pos = uri.lastIndexOf(sourceCodeLocation);
        const componentPath = uri.substr(pos + sourceCodeLocation.length, uri.length - pos);
        const result = componentPath.substr(0, componentPath.indexOf(componentDelimiter));
        return result;
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

    function range(range: Range): LSP.Range {
        return LSP.Range.create(
            range.startPosition.row,
            range.startPosition.col,
            range.endPosition.row,
            range.endPosition.col,
        )
    }
}
