import * as NodeCache from 'node-cache';
import { BaseDeclaration, DeclarationType, Range, MemberComposite } from 'bella-grammar';
import * as LSP from 'vscode-languageserver';
import { Dictionary, BSTreeKV } from 'typescript-collections';
import { isEmpty, isNil } from 'lodash';
import { RegistryUtils } from './registry-utils';
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

    public getLSPDeclarationsForName(name: string, sourceUri: string) {
        return this.getLSPDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            namespaceFilter: {
                active: true,
                namespace: RegistryUtils.getNamespaceFromURI(sourceUri)
            },
            nameFilter: {
                active: true,
                name
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
        let result: KeyedDeclaration[] = [];
        if (query.uriFilter.active) {
            result = this.getRegistryNode(query.uriFilter.uri || '').getDeclarations(query);
        }else {
            // global search
            for (const registry_key of this.cache.keys()) {
                let registry = this.cache.get<DeclarationRegistryNode>(registry_key);
                if (!isNil(registry)) {
                    //TODO: include search in common
                    //TODO: impl for namespace filter MAJOR
                    result.push(...registry.getDeclarations());
                }
            }
        }
        if(query?.nameFilter?.active){
            result = result.filter(kd => kd.name === query?.nameFilter?.name);
        }
        return result;
    }
}

export interface KeyedDeclaration extends BaseDeclaration, MemberComposite {
    uri: string;
    parentName?: string
}

export class DeclarationRegistryNode {
    constructor(private nodes: Dictionary<DeclarationKey, KeyedDeclaration>, public namespace: string) {
    }
    getDeclarations(query?: NodeRegistrySearchQuery): KeyedDeclaration[] {
        let result = this.nodes.values();
        if (!isNil(query)) {
            let { typeFilter } = query;
            result = result.filter(d => {
                let passed = true;
                if (!isNil(typeFilter) && typeFilter?.active) {
                    passed = passed && (d.type === typeFilter.type);
                }
                return true;
            });
        }
        return result;
    }
}

export class DeclarationKey {
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

    namespaceFilter?: {
        namespace: string;
    } & Activatable

    nameFilter?: {
        name: string;
    } & Activatable
}

interface Activatable {
    active: boolean
}
