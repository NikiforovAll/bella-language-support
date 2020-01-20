import { BaseHandler } from "./base.handler";
import { TextDocumentIdentifier, CodeLens, Command, ReferenceParams, Position, Location } from "vscode-languageserver";
import { LSPDeclarationRegistry } from "../registry/declaration-registry/lsp-declaration-registry";
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
        // let declarations = this.executeQueries(
        //     {
        //         uriFilter: {
        //             active: true,
        //             uri: docUri.uri
        //         },
        //         typeFilter: {
        //             active: true,
        //             type: DeclarationType.Procedure
        //         }
        //     },
        //     {
        //         uriFilter: {
        //             active: true,
        //             uri: docUri.uri
        //         },
        //         typeFilter: {
        //             active: true,
        //             type: DeclarationType.ServiceEntry
        //         }
        //     }
        // )
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

            let lensCollection = CodeLens.create(
                CommonUtils.range(declaration.range),
                { declaration: declaration, uri: docUri.uri }
            )
            if(declaration.members) {
                let childMembersLensCollection = declaration.members
                    .filter(d => supportedCodeLensDeclarations.includes(d.type))
                    .map(d => CodeLens.create(
                        CommonUtils.range(d.range),
                        {
                            declaration: d,
                            uri: docUri.uri,
                            parentDeclaration: {
                                range: declaration.range,
                                name: declaration.name,
                                type: declaration.type
                            }
                        }
                    ));
                codeLensResult.push(...childMembersLensCollection);
            }
            if(declaration.type === DeclarationType.Service) {
                continue;
            }
            codeLensResult.push(lensCollection);
        }
        return codeLensResult;
    }

    public resolveDeclaration(uri: string, declaration: BaseDeclaration, parentDeclaration?: BaseDeclaration): LocatedBellaReference[] {
        let query = this.generateResolutionQuery(declaration, uri, parentDeclaration);
        let references = this.refRegistry.getReferencesForQuery(query);
        return references;
    }

    public resolve(codeLens: CodeLens) {
        let { uri, declaration, parentDeclaration }: CodeLensPayload = (codeLens.data as CodeLensPayload);
        if(declaration.type === DeclarationType.Procedure) {
            let refs = this.resolveDeclaration(uri, declaration, parentDeclaration);
            let target = uri; //URI.parse(uri);
            let command = {
                title: this.getCodeLensLabel(refs),
                command: 'editor.action.showReferences',//'vscode.executeReferenceProvider',
                arguments: [
                    target,
                    CommonUtils.position(declaration.range.startPosition),
                    ReferenceFactoryMethods.toLSPLocations(refs)
                ]
            };
            codeLens.command = command;
        }else {
            let command = {
                title: "Go To References",
                command: 'bella.findReferencesLazy',//'vscode.executeReferenceProvider',
                arguments: [
                    codeLens.data
                ]
            };
            codeLens.command = command;
        }
        return codeLens;
    }

    private executeQueries(...queries: NodeRegistrySearchQuery[]) {
        let mergedDeclarations = [];
        for (const query of queries) {
            mergedDeclarations.push(...this.declarationRegistry.getDeclarationsForQuery(query));
        }
        return mergedDeclarations;
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
}

export interface CodeLensPayload {
    parentDeclaration?: BaseDeclaration;
    declaration: BaseDeclaration;
    uri: string;
}

