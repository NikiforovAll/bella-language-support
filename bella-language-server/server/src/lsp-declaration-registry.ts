import { BaseDeclaration, DeclarationType, MemberComposite } from 'bella-grammar';
import { isEmpty, isNil } from 'lodash';
import * as NodeCache from 'node-cache';
import { Dictionary } from 'typescript-collections';
import * as LSP from 'vscode-languageserver';

import { DeclarationFactoryMethods } from './factories/declaration.factory';
import { CommonUtils } from './utils/common.utils';
import { DeclarationRegistryUtils } from './utils/declaration-registry.utils';

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
        let nrURI = CommonUtils.normalizeURI(uri);
        this.cache.set(
            nrURI,DeclarationRegistryUtils.createRegistryNode(declarations, nrURI));
    }

    public getRegistryNode(uri: string): DeclarationRegistryNode {
        let nrURI = CommonUtils.normalizeURI(uri);
        if (isEmpty(nrURI) || !this.cache.has(nrURI)) {
            console.warn(`Registry with specified key ${nrURI} is not found`);
            return DeclarationRegistryUtils.createRegistryNode([], nrURI);
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

    public getLSPDeclarationsForNameAndType(name: string, type: DeclarationType, sourceUri: string) {
        return this.getLSPDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            typeFilter: {
                active: true,
                type
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(sourceUri)
            },
            nameFilter: {
                active: true,
                name
            }
        });
    }

    public getLSPDeclarationsForQuery(query: NodeRegistrySearchQuery): LSP.SymbolInformation[] {
        let declarations: KeyedDeclaration[] = this.getDeclarationsForQuery(query);
        let result = DeclarationFactoryMethods.toLSPDeclarations(declarations);

        // do we need to fetch descendants?
        if(query.descendantsFilter?.active) {
            for (const declaration of declarations) {
                let keyedDeclarations = declaration.members?.map( (d: BaseDeclaration): KeyedDeclaration => ({
                    ...d, uri: declaration.uri, parentName: declaration.name
                })) || [];
                result.push(...DeclarationFactoryMethods.toLSPDeclarations(keyedDeclarations));
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
            let selectedKeys = this.cache.keys();
            for (const registry_key of selectedKeys) {
                let registry = this.cache.get<DeclarationRegistryNode>(registry_key);
                if (isNil(registry)) {
                    continue;
                }
                if(registry?.namespace !== CommonUtils.SHARED_NAMESPACE_NAME && query.namespaceFilter?.active &&
                    registry?.namespace !== query.namespaceFilter.namespace) {
                    continue;
                }
                //TODO: include search in common
                result.push(...registry.getDeclarations(query));
            }
        }
        // TODO: name filtering could be slow, consider to move map instead
        // if(query?.nameFilter?.active){
        //     result = result.filter(kd => kd.name === query?.nameFilter?.name);
        // }
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
        if (!isNil(query)) {
            let { typeFilter, nameFilter } = query;
            if(typeFilter?.active && nameFilter?.active) {
                let accessDeclarationKey = new DeclarationKey(
                    nameFilter.name, typeFilter.type);
                if(this.nodes.containsKey(accessDeclarationKey)){
                    let foundDeclaration = this.nodes.getValue(accessDeclarationKey)
                    return !!foundDeclaration ? [foundDeclaration]: [];
                }else {
                    return [];
                }
            } else {
                return this.nodes.values().filter(d => {
                    let passed = true;
                    if (!isNil(typeFilter) && typeFilter?.active) {
                        passed = passed && (d.type === typeFilter.type);
                    }
                    if(!isNil(nameFilter) && nameFilter.active) {
                        passed = passed && (d.name === nameFilter.name);
                    }
                    return passed;
                });
            }
        }
        console.warn('getDeclarations - all values are returned - query is empty');
        return this.nodes.values();
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
    // NOTE: this filter disables global search and point directly to node for uri
    uriFilter: {
        uri?: string
    } & Activatable

    typeFilter?: {
        type: DeclarationType
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
