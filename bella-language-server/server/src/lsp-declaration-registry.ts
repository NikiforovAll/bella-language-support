import * as NodeCache from 'node-cache';
import { BaseDeclaration, DeclarationType, Range, MemberComposite } from 'bella-grammar';
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
            },
            descendantsFilter: {
                active: true
            }
        });
    }

    public getLSPDeclarationsForQuery(query: NodeRegistrySearchQuery): LSP.SymbolInformation[] {
        let declarations: KeyedDeclaration[] = this.getDeclarationsForQuery(query);
        let result = RegistryUtils.toLSPDeclarations(declarations);
        if(query.descendantsFilter?.active) {
            for (const declaration of declarations) {
                let keyedDeclarations = declaration.members?.map( (d: BaseDeclaration): KeyedDeclaration => ({
                    ...d, uri: declaration.uri, parentName: declaration.name
                })) || [];
                result.push(...RegistryUtils.toLSPDeclarations(keyedDeclarations));
            }
        }
        return result;
    }

    private getDeclarationsForQuery(query: NodeRegistrySearchQuery): KeyedDeclaration[] {
        if (query.uriFilter.active) {
            return this.getRegistryNode(query.uriFilter.uri || '').getDeclarations(query);
        }
        // global search
        let mergedResult: KeyedDeclaration[] = [];
        for (const registry_key of this.cache.keys()) {
            let registry = this.cache.get<DeclarationRegistryNode>(registry_key);
            if (!isNil(registry)) {
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
        if (!isNil(query)) {
            let { typeFilter, descendantsFilter: parentFilter } = query;
            result = result.filter(d => {
                let passed = true;
                if (!isNil(typeFilter) && typeFilter?.active) {
                    passed = passed && (d.type === typeFilter.type);
                }
                if (!isNil(parentFilter)) {

                }
                return true;
            });
        }
        return result;
    }
}

interface KeyedDeclaration extends BaseDeclaration, MemberComposite {
    uri: string;
    parentName?: string
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

    descendantsFilter?: {
        // hasParent?: boolean
        // parentName?: string
    } & Activatable
}

interface Activatable {
    active: boolean
}

namespace RegistryUtils {

    export function createRegistryNode(declarations: BaseDeclaration[], uri: string): DeclarationRegistryNode {
        let dict = new Dictionary<DeclarationKey, KeyedDeclaration>();
        for (let declaration of declarations) {
            let members = (declaration as MemberComposite).members;
            if (!members) {
                members = [];
            }
            dict.setValue(
                new DeclarationKey(declaration.name, declaration.type),
                { ...declaration, uri }
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
            declaration.name,
            parserTypeToLSPType(declaration.type),
            range(declaration.range),
            declaration.uri,
            declaration.parentName
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
            case DeclarationType.Service:
                return LSP.SymbolKind.Interface;
            case DeclarationType.ServiceEntry:
                return LSP.SymbolKind.Method;
            case DeclarationType.CompositeObject:
                return LSP.SymbolKind.Class;
            case DeclarationType.Object:
                return LSP.SymbolKind.Class;
            case DeclarationType.PersistentObject:
                return LSP.SymbolKind.Variable;
            case DeclarationType.ObjectField:
                return LSP.SymbolKind.Field;
            case DeclarationType.Enum:
                return LSP.SymbolKind.Enum;
            case DeclarationType.EnumEntry:
                return LSP.SymbolKind.EnumMember;
            case DeclarationType.Setting:
                return LSP.SymbolKind.Constant;
            case DeclarationType.Param:
                return LSP.SymbolKind.Variable;
            case DeclarationType.Procedure:
                return LSP.SymbolKind.Method;
            case DeclarationType.Formula:
                return LSP.SymbolKind.Function;
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
