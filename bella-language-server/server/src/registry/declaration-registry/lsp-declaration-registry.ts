import { BaseDeclaration, DeclarationType, MemberComposite } from 'bella-grammar';
import { isEmpty, isNil } from 'lodash';
import * as NodeCache from 'node-cache';
import { Dictionary } from 'typescript-collections';
import * as LSP from 'vscode-languageserver';

import { DeclarationFactoryMethods } from '../../factories/declaration.factory';
import { CommonUtils } from '../../utils/common.utils';
import { DeclarationRegistryUtils } from '../../utils/declaration-registry.utils';
import { NodeRegistrySearchQuery } from './declaration-registry-query';

import { uniq } from "lodash";
import { DeclarationRegistryNode } from './declaration-registry-node';

class NamespaceKey {
    constructor(private namespace: string) { }
    toString(): string {
        return `${this.namespace}`;
    }
}
export class LSPDeclarationRegistry {


    // string:DeclarationRegistryNode
    private cache: NodeCache;

    private namespacesToNodesCache: Dictionary<NamespaceKey, Dictionary<string, DeclarationRegistryNode>>;

    constructor() {
        this.cache = new NodeCache({
            checkperiod: 0,
            stdTTL: 0
        })
        this.namespacesToNodesCache = new Dictionary<NamespaceKey, Dictionary<string, DeclarationRegistryNode>>();
    }

    public setDeclarations(declarations: BaseDeclaration[], uri: string) {
        let nrURI = CommonUtils.normalizeURI(uri);
        const newNode = DeclarationRegistryUtils.createRegistryNode(declarations, nrURI);
        const namespaceKey = new NamespaceKey(newNode.namespace);
        if (this.namespacesToNodesCache.containsKey(namespaceKey)) {
            const nodesPerNamespace = this.namespacesToNodesCache.getValue(namespaceKey);
            if (!!nodesPerNamespace) {
                nodesPerNamespace.setValue(nrURI, newNode);
            }
        } else {
            const nodesPerNamespace = new Dictionary<string, DeclarationRegistryNode>();
            nodesPerNamespace.setValue(nrURI, newNode);
            this.namespacesToNodesCache.setValue(namespaceKey, nodesPerNamespace);
        }
        this.cache.set(nrURI, newNode);
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
            },
            overloadsFilter: {
                active: true,
                includeOverloads: true
            }
        });
    }

    /**
     * Used to search declaration in a file
     * @param name declaration name
     * @param type declaration type
     * @param sourceUri uri of file
     * @param descendantQuery find descendants query
     */
    public getLSPDeclarationsForNameAndType(
        name: string, type: DeclarationType,
        sourceUri: string,
        descendantQuery?: NodeRegistrySearchQuery) {
        let targetNamespace = CommonUtils.getNamespaceFromURI(sourceUri);
        if (targetNamespace === CommonUtils.SHARED_NAMESPACE_NAME) {

            //TODO: this is convention to speed things up, consider fallback with global search
            let namespaces = this.getKeys();
            targetNamespace = CommonUtils.extractComponentNameFromUrl(sourceUri, namespaces);
        }

        let query: NodeRegistrySearchQuery = {
            uriFilter: {
                active: false
            },
            typeFilter: {
                active: true,
                type
            },
            namespaceFilter: {
                active: true,
                namespace: targetNamespace
            },
            nameFilter: {
                active: true,
                name
            },
            //TODO: consider relation of this with ambiguous declaration/references. Probably need to build it based on ambiguous types
            fallbackRules: {
                fallbackTypeProbe: {
                    type: DeclarationType.Object,
                    fallbackTypes: [DeclarationType.Enum]
                }
            },
            descendantsFilter: {
                active: !!descendantQuery,
                discardParent: true,
                query: descendantQuery
            }
        };
        return this.getLSPDeclarationsForQuery(query);
    }

    public getLSPDeclarationsForQuery(query: NodeRegistrySearchQuery): LSP.SymbolInformation[] {
        return DeclarationFactoryMethods.toLSPDeclarations(this.getDeclarationsForQuery(query));
    }

    public getDeclarationsForQuery(query: NodeRegistrySearchQuery): KeyedDeclaration[] {
        let declarations: KeyedDeclaration[] = this.getDeclarationsForQueryLocal(query);
        let result: KeyedDeclaration[] = query.descendantsFilter?.active && query.descendantsFilter?.discardParent
            ? []
            : declarations;
        // do we need to fetch descendants?
        if (query.descendantsFilter?.active) {
            for (const declaration of declarations) {
                let keyedDeclarations = declaration.members?.map((d: BaseDeclaration): KeyedDeclaration => ({
                    ...d, uri: declaration.uri, parentName: declaration.name
                })) || [];
                const descendantsQuery = query.descendantsFilter.query;
                if (!!descendantsQuery) {
                    keyedDeclarations = keyedDeclarations.filter(d => {
                        let passed = true;
                        if (!isNil(descendantsQuery.typeFilter) && descendantsQuery.typeFilter?.active) {
                            passed = passed && (d.type === descendantsQuery.typeFilter.type);
                        }
                        if (!isNil(descendantsQuery.nameFilter) && descendantsQuery.nameFilter.active) {
                            passed = passed && (d.name === descendantsQuery.nameFilter.name);
                        }
                        return passed;
                    });
                }
                result.push(...keyedDeclarations);
            }
        }
        return result;
    }

    public getKeys() {
        let namespaces = uniq(
            this.cache.keys()
                .map(k => this.cache.get<DeclarationRegistryNode>(k)?.namespace || ''));
        return namespaces;
    }

    private getDeclarationsForQueryLocal(query: NodeRegistrySearchQuery): KeyedDeclaration[] {
        let result: KeyedDeclaration[] = [];
        const start = Date.now();
        const isLogExecutionTime = false;
        if (query.uriFilter.active) {
            result = this.getRegistryNode(query.uriFilter.uri || '').getDeclarations(query);
        } else {
            // global search
            const isNamespaceFilterActivated = query.namespaceFilter?.active;
            const isComponentNameFilterActivated = !!query.namespaceFilter?.componentName;
            const namespaceToFind = query.namespaceFilter?.namespace;
            if (isNamespaceFilterActivated && namespaceToFind) {
                let registries: DeclarationRegistryNode[] = [];
                const mainNamespacedDeclarations = this.namespacesToNodesCache.getValue(new NamespaceKey(namespaceToFind));
                if (namespaceToFind !== CommonUtils.SHARED_NAMESPACE_NAME && !!mainNamespacedDeclarations) {
                    registries = mainNamespacedDeclarations.values();
                }
                if (!query.namespaceFilter?.excludeCommon) {
                    const commonNodes = this.namespacesToNodesCache.getValue(new NamespaceKey(CommonUtils.SHARED_NAMESPACE_NAME));
                    if (!!commonNodes) {
                        registries.push(...commonNodes.values());
                    }
                }
                if (isNamespaceFilterActivated && isComponentNameFilterActivated) {
                    const normalizedComponentName = query.namespaceFilter?.componentName?.toLowerCase() || '';
                    registries = registries.filter(r => normalizedComponentName
                        .indexOf(r.componentName.toLowerCase()) !== -1)
                }
                registries.forEach(r => result.push(...r.getDeclarations(query)));
            } else {
                let selectedKeys = this.cache.keys();
                for (const registry_key of selectedKeys) {
                    let registry = this.cache.get<DeclarationRegistryNode>(registry_key);
                    if (isNil(registry)) {
                        continue;
                    }
                    // if (registryNamespace !== CommonUtils.SHARED_NAMESPACE_NAME
                    //     && isNamespaceFilterActivated
                    //     && registry?.namespace !== namespaceToFind) {
                    //     continue;
                    // }

                    // if (isNamespaceFilterActivated
                    //     && isComponentNameFilterActivated
                    //     && query.namespaceFilter?.componentName
                    //         ?.toLowerCase()
                    //         .indexOf(registry.componentName.toLowerCase()) === -1) {
                    //     continue;
                    // }
                    // TODO: this could be slow, measure impact
                    console.warn('getDeclarationsForQueryLocal: [GLOBAL DECLARATION REGISTRY TRAVERSING]')
                    result.push(...registry.getDeclarations(query));
                }
            }
        }
        if (isLogExecutionTime) {
            console.log(`LSPDeclarationRegistry.getDeclarationsForQueryLocal: elapsed = ${Date.now() - start} ms`)
        }
        return result;
    }
}

export interface KeyedDeclaration extends BaseDeclaration, MemberComposite {
    uri: string;
    parentName?: string
}

export interface DeclarationOverload {
    declarationKey: DeclarationKey
    overloads: KeyedDeclaration[]
}


export class DeclarationKey {
    //TODO: consider change this to Type:Object
    // fullQualifier?: string
    constructor(
        public name: string,
        public type: DeclarationType) {
    }
    toString() {
        let truncatedName = CommonUtils.getProcedureTruncatedName(this.name);
        return `${truncatedName} - ${this.type}`;
        // return `${this.name} - ${this.type}`;
    }

    public static FromString(value: string): DeclarationKey {
        let [name, typeStr] = value.split('-').map(t => t.trim());
        let typeInt = Number.parseInt(typeStr);
        let type: DeclarationType = <DeclarationType><any>typeInt;
        return new DeclarationKey(name, type);
    }
}
