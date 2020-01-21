import { BaseHandler } from "./base.handler";
import { TextDocumentIdentifier, CodeLens, Command, ReferenceParams, Position, Location } from "vscode-languageserver";
import { LSPDeclarationRegistry, KeyedDeclaration } from "../registry/declaration-registry/lsp-declaration-registry";
import { LSPReferenceRegistry } from "../registry/references-registry/lsp-references-registry";
import { DeclarationType, BaseDeclaration } from "bella-grammar";
import { CommonUtils } from "../utils/common.utils"
import { ReferencesRegistrySearchQuery } from "../registry/references-registry/references-registry-query";
import { URI } from 'vscode-uri'
import path = require("path");
import { ReferenceHandler } from "./reference.handler";
import { ReferenceFactoryMethods } from "../factories/reference.factory";
import { LocatedBellaReference } from "../utils/reference-registry.utils";
import { NodeRegistrySearchQuery } from "../registry/declaration-registry/declaration-registry-query";
import { type } from "os";
export class CodeLensHandler extends BaseHandler {
    constructor(private declarationRegistry: LSPDeclarationRegistry, private refRegistry: LSPReferenceRegistry) {
        super();
    }

    public getCodeLens(docUri: TextDocumentIdentifier): CodeLens[] {
        let codeLensResult = [];
        let supportedCodeLensDeclarations = [
            DeclarationType.Procedure,
            DeclarationType.ServiceEntry,
            //to get related ServiceEntry we need to specify container where they are located
            DeclarationType.Service
        ];
        let declarations = this.declarationRegistry.getDeclarationsForQuery({
            uriFilter: { active: true, uri: docUri.uri },
            descendantsFilter: { active: false },
            overloadsFilter: { active: true, includeOverloads: true }
        }).filter(d => supportedCodeLensDeclarations.includes(d.type));

        for (const declaration of declarations) {

            let lensCollection = this.createCodeLens(
                declaration,
                CodeLensResolutionType.FindReferences,
                docUri.uri);
            if(declaration.members) {
                let childMembersLensCollection = declaration.members
                    .filter(d => supportedCodeLensDeclarations.includes(d.type))
                    .map(d => this.createCodeLens(d, CodeLensResolutionType.FindReferences, docUri.uri, declaration));
                codeLensResult.push(...childMembersLensCollection);
            }
            codeLensResult.push(lensCollection);
        }
        // TODO: also register tokens for go to service command
        for (const procedureDeclaration of declarations.filter(d=>d.type === DeclarationType.Procedure)) {
            let query: NodeRegistrySearchQuery = {
                uriFilter: {
                    active: false
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.SHARED_NAMESPACE_NAME
                },
                typeFilter: {
                    active: true,
                    type: DeclarationType.Service
                },
                descendantsFilter: {
                    active: true,
                    discardParent: true,
                    query: {
                        uriFilter: {
                            active: false
                        },
                        typeFilter: {
                            active: true,
                            type: DeclarationType.ServiceEntry
                        },
                        nameFilter: {
                            active: true,
                            name: CommonUtils.getProcedureTruncatedName(procedureDeclaration.name)
                        }
                    }
                }
            }
            let symbols = this.declarationRegistry.getDeclarationsForQuery(query)
            symbols
                .filter((serviceEntry: KeyedDeclaration) =>
                    CommonUtils.extractComponentNameFromUrl(serviceEntry.uri) === CommonUtils.getNamespaceFromURI(docUri.uri)
                )
                .forEach((serviceEntry: KeyedDeclaration)=>{
                codeLensResult.push(
                    this.createCodeLens(
                        procedureDeclaration,
                        CodeLensResolutionType.GoToService,
                        procedureDeclaration.uri
                    ))});
        }
        return codeLensResult;
    }

    public resolveDeclaration(uri: string, declaration: BaseDeclaration, parentDeclaration?: BaseDeclaration): LocatedBellaReference[] {
        let query = this.generateResolutionQuery(declaration, uri, parentDeclaration);
        let references = this.refRegistry.getReferencesForQuery(query);
        return references;
    }

    public resolve(codeLens: CodeLens) {
        let { type }: CodeLensPayload = (codeLens.data as CodeLensPayload);
        switch (type) {
            case CodeLensResolutionType.FindReferences:
                this.resolveReferenceDeclaration(codeLens, codeLens.data);
                break;
            case CodeLensResolutionType.GoToService:
                codeLens.command = {
                    command: '',
                    title: 'service contract'
                }
            default:
                break;
        }
        return codeLens;
    }

    private resolveReferenceDeclaration(codeLens: CodeLens, payload: CodeLensPayload) {
        let { uri, declaration, parentDeclaration }: CodeLensPayload = payload;
        let command;
        switch (declaration.type) {
            case DeclarationType.Procedure:
                let refs = this.resolveDeclaration(uri, declaration, parentDeclaration);
                let target = uri;
                command = {
                    title: this.getCodeLensLabel(refs),
                    command: 'editor.action.showReferences',
                    arguments: [
                        target,
                        CommonUtils.position(declaration.range.startPosition),
                        ReferenceFactoryMethods.toLSPLocations(refs)
                    ]
                };
                break;
            case DeclarationType.Service:
                command = {
                    title: "Go To All References",
                    command: 'bella.findReferencesLazy',
                    arguments: [
                        codeLens.data
                    ]
                };
                break;
            case DeclarationType.ServiceEntry:
                command = {
                    title: "Go To References",
                    command: 'bella.findReferencesLazy',
                    arguments: [
                        codeLens.data
                    ]
                };
                break;
            default:
                throw "Unable to resolve codeLens - Not supported CodeLens type"
        }
        codeLens.command = command;
    }

    private generateResolutionQuery(declaration: BaseDeclaration, uri: string, parentDeclaration?: BaseDeclaration ): ReferencesRegistrySearchQuery {
        let queryExtension;
        let namespace = CommonUtils.getNamespaceFromURI(uri);
        let baseQuery = {
            uriFilter: {
                active: false
            }
        }
        switch (declaration.type) {
            case DeclarationType.Procedure:
                let declarationName = CommonUtils.getProcedureTruncatedName(declaration.name);
                queryExtension = {
                    nameFilter: {
                        active: true,
                        name: declarationName
                    },
                    typeFilter: {
                        active: true,
                        type: declaration.type
                    },
                    namespaceFilter: {
                        active: true,
                        namespace
                    }
                }
                break;
            case DeclarationType.Service:
                queryExtension = {
                    nameFilter: {
                        active: true,
                        name: declaration.name
                    },
                    typeFilter: {
                        active: true,
                        type: declaration.type
                    },
                    namespaceFilter: {
                        active: false,
                        namespace
                    }
                }
                break;
            case DeclarationType.ServiceEntry:
                if(!parentDeclaration) {
                    throw "Not able to generate query - parent container required"
                }
                queryExtension = {
                    nameFilter: {
                        active: true,
                        name: parentDeclaration.name
                    },
                    typeFilter: {
                        active: true,
                        type: parentDeclaration.type
                    },
                    namespaceFilter: {
                        active: false,
                        namespace
                    },
                    descendantsFilter: {
                        active: true,
                        query: {
                            name: declaration.name,
                            type: declaration.type
                        }
                    }
                }
                break;
            default:
                throw "Not able to generate query - type is not supported";
        }
        return {...baseQuery, ...queryExtension};
    }


    private getCodeLensLabel(locations: LocatedBellaReference[]): string {
        return locations.length === 1
            ? '1 reference'
            : `${locations.length} references`;
    }

    private executeQueries(...queries: NodeRegistrySearchQuery[]) {
        let mergedDeclarations = [];
        for (const query of queries) {
            mergedDeclarations.push(...this.declarationRegistry.getDeclarationsForQuery(query));
        }
        return mergedDeclarations;
    }

    private createCodeLens(
        declaration: BaseDeclaration,
        type: CodeLensResolutionType,
        uri: string,
        parentDeclaration?: BaseDeclaration) {

        let payload: CodeLensPayload = { declaration, type, uri };
        if(parentDeclaration) {
            payload.parentDeclaration = {
                range: parentDeclaration.range,
                name: parentDeclaration.name,
                type: parentDeclaration.type
            }
        }
        return CodeLens.create(CommonUtils.range(declaration.range), payload);
    }
}

export interface CodeLensPayload {
    parentDeclaration?: BaseDeclaration;
    declaration: BaseDeclaration;
    uri: string;
    type: CodeLensResolutionType;
}

enum CodeLensResolutionType {
    FindReferences,
    GoToService
}

