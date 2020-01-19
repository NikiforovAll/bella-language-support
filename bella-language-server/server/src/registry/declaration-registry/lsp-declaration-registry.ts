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
export class LSPDeclarationRegistry {


    //TODO: consider to have an array of this for each component to support global level cache
    //TODO: need to be able to get all tokens for component
    // string:DeclarationRegistryNode
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
            nrURI, DeclarationRegistryUtils.createRegistryNode(declarations, nrURI));
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

    public getLSPDeclarationsForNameAndType(
        name: string, type: DeclarationType,
        sourceUri: string,
        descendantQuery?: NodeRegistrySearchQuery) {
        let targetNamespace = CommonUtils.getNamespaceFromURI(sourceUri);
        if (targetNamespace === CommonUtils.SHARED_NAMESPACE_NAME) {
            targetNamespace = this.extractComponentNameFromUrl(sourceUri);
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
        let declarations: KeyedDeclaration[] = this.getDeclarationsForQuery(query);
        let result = query.descendantsFilter?.active && query.descendantsFilter?.discardParent
            ? []
            : DeclarationFactoryMethods.toLSPDeclarations(declarations);
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
                result.push(...DeclarationFactoryMethods.toLSPDeclarations(keyedDeclarations));
            }
        }
        return result;
    }

    private getDeclarationsForQuery(query: NodeRegistrySearchQuery): KeyedDeclaration[] {
        let result: KeyedDeclaration[] = [];
        if (query.uriFilter.active) {
            result = this.getRegistryNode(query.uriFilter.uri || '').getDeclarations(query);
        } else {
            // global search
            let selectedKeys = this.cache.keys();
            for (const registry_key of selectedKeys) {
                let registry = this.cache.get<DeclarationRegistryNode>(registry_key);
                if (isNil(registry)) {
                    continue;
                }
                if (registry?.namespace !== CommonUtils.SHARED_NAMESPACE_NAME && query.namespaceFilter?.active &&
                    registry?.namespace !== query.namespaceFilter.namespace) {
                    continue;
                }
                result.push(...registry.getDeclarations(query));
            }
        }
        // TODO: name filtering could be slow, consider to move map instead
        // if(query?.nameFilter?.active){
        //     result = result.filter(kd => kd.name === query?.nameFilter?.name);
        // }
        return result;
    }

    private extractComponentNameFromUrl(sourceUri: string): string {
        // we are in common file, need to look for namespace
        let namespaces = uniq(
            this.cache.keys()
                .map(k => this.cache.get<DeclarationRegistryNode>(k)?.namespace));
        let getComponentName = (uri: string): string => {
            const identificationToken = 'common/services';
            let servicePart = uri.substring(
                uri.lastIndexOf(identificationToken) + identificationToken.length + 1);
            var lastIndex = servicePart.search(/[^0-9A-Za-z]+/);
            let result = servicePart.substring(0, lastIndex);
            return result;
        };
        let componentName = getComponentName(sourceUri);
        let targetNamespace = namespaces.find(namespace => namespace?.includes(componentName))
        if (!targetNamespace) {
            return CommonUtils.SHARED_NAMESPACE_NAME;
        }
        return targetNamespace;
        //TODO: this is convention to speed things up, consider fallback with global search
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
        const name = this.name;
        const takeNumChars = name
            .indexOf('(') === -1 ? name.length : name.indexOf('(');
        let truncatedName = name.substr(0, takeNumChars);
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
