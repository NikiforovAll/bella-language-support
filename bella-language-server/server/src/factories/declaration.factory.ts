import * as LSP from 'vscode-languageserver';
import { KeyedDeclaration } from '../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../utils/common.utils';

export namespace DeclarationFactoryMethods {
    export function toLSPDeclarations(declarations: KeyedDeclaration[]): LSP.SymbolInformation[] {
        let mappedDeclarations = declarations.map(d => createLSPDeclaration(d));
        return mappedDeclarations;
    }

    export function createLSPDeclaration(declaration: KeyedDeclaration): LSP.SymbolInformation {
        return LSP.SymbolInformation.create(
            declaration.name,
            CommonUtils.parserTypeToLSPType(declaration.type),
            CommonUtils.range(declaration.range),
            declaration.uri,
            declaration.parentName
        )
    }
}
