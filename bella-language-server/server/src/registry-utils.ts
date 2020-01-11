import { BaseDeclaration, DeclarationType, MemberComposite, Range } from 'bella-grammar';
import { Dictionary } from 'typescript-collections';
import * as LSP from 'vscode-languageserver';

import { DeclarationKey, DeclarationRegistryNode, KeyedDeclaration } from './lsp-declaration-registry';

// originally, it was declaration registry utils, TODO: refactor this
export namespace RegistryUtils {

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

    export function range(range: Range): LSP.Range {
        return LSP.Range.create(
            range.startPosition.row,
            range.startPosition.col,
            range.endPosition.row,
            range.endPosition.col,
        )
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
}
