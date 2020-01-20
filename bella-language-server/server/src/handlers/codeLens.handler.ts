import { BaseHandler } from "./base.handler";
import { TextDocumentIdentifier, CodeLens, Command, ReferenceParams, Position } from "vscode-languageserver";
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
export class CodeLensHandler extends BaseHandler {
    constructor(private declarationRegistry: LSPDeclarationRegistry, private refRegistry: LSPReferenceRegistry) {
        super();
    }

    public getCodeLens(docUri: TextDocumentIdentifier): CodeLens[] {
        let codeLensResult = [];
        let procedureDeclarations = this.declarationRegistry.getDeclarationsForQuery({
            uriFilter: {
                active: true,
                uri: docUri.uri
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Procedure
            }
        })
        for (const procedureDeclaration of procedureDeclarations) {
            let lens = CodeLens.create(
                CommonUtils.range(procedureDeclaration.range),
                { declaration: procedureDeclaration, uri: docUri.uri }
            )
            codeLensResult.push(lens);
        }
        return codeLensResult;
    }

    public resolve(codeLens: CodeLens) {
        let { uri, declaration }: CodeLensPayload = (codeLens.data as CodeLensPayload);
        let procedureName = CommonUtils.getProcedureTruncatedName(declaration.name);
        let query: ReferencesRegistrySearchQuery = {
            uriFilter: {
                active: false
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(uri)
            },
            nameFilter: {
                active: true,
                name: procedureName
            },
            typeFilter: {
                active: true,
                type: declaration.type
            }
        };
        let refs = this.refRegistry.getReferencesForQuery(query);

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
        return codeLens;
    }

    private getCodeLensLabel(locations: LocatedBellaReference[] ): string {
		return locations.length === 1
			? '1 reference'
			: `${locations.length} references`;
	}
}

interface CodeLensPayload {
    declaration: BaseDeclaration,
    uri: string
}
