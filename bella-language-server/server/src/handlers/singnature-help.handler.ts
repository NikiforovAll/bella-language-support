import { SignatureHelp, TextDocumentPositionParams, SignatureInformation, ParameterInformation, MarkupContent } from 'vscode-languageserver';

import { BaseHandler } from './base.handler';
import { LSPCompletionRegistry } from '../registry/completion-registry.ts/lsp-completion-registry';
import { LSPDeclarationRegistry, KeyedDeclaration } from '../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../utils/common.utils';
import { DeclarationType, BaseDeclaration } from 'bella-grammar';


export class SignatureHelpHandler extends BaseHandler {
    constructor(
        private declarations: LSPDeclarationRegistry,
        private completions: LSPCompletionRegistry) {
        super();
    }

    getSignature(params: TextDocumentPositionParams): SignatureHelp | undefined {
        const docUri = params.textDocument.uri;
        let completionToken = this.completions.getCompletion(
                params.position.line,
                params.position.character,
                docUri);
        if (!completionToken) {
            return;
        }
        const procedures = this.declarations.getDeclarationsForQuery({
            uriFilter: {
                active: false,
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Procedure
            },
            nameFilter: {
                active: true,
                name: CommonUtils.getProcedureTruncatedName(completionToken.completionBase.context)
            },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(docUri)
            }
        });
        const isNoParams = !!completionToken.completionBase.context.match(/\(\s*\)/g);
        const currentParamIndex = isNoParams? null : (completionToken.completionBase.context.match(/,/g) || []).length;
        const numberOfParams = isNoParams ? 0 : (currentParamIndex || 0) + 1;
        const foundProcedureIndex = procedures
            .findIndex(p => (!p.members ? 0 : p.members.length) >= numberOfParams);
        const signature: SignatureHelp = {
            signatures: procedures.map(d => this.toSignatureInformation(d)),
            activeParameter: currentParamIndex,
            activeSignature: foundProcedureIndex === -1 ? null : foundProcedureIndex
        }
        return signature;
    }

    toSignatureInformation(declaration: KeyedDeclaration): SignatureInformation {
        const content : MarkupContent = {
            value: `**Location:** ${CommonUtils.getDeclarationFullRelativePath(declaration.uri)}`,
            kind: "markdown"
        }
        // TODO: Consider: to embed command go to declaration to param (https://code.visualstudio.com/api/extension-guides/command)
        return {
            label: declaration.name,
            parameters: declaration.members?.map(d => this.toSignatureParam(d)) || [],
            // documentation:
            documentation: content
        }
    }

    toSignatureParam(declaration: BaseDeclaration): ParameterInformation {
        return {
            label: declaration.name,
            // documentation: `Name: ${declaration.name} as ${DeclarationType[declaration.type]}`
            documentation: `Name: ${declaration.name} as ${DeclarationType[declaration.type]}`
        }
    }
}

