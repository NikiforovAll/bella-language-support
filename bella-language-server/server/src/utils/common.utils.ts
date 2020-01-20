import { DeclarationType, Range, Position } from 'bella-grammar';
import * as LSP from 'vscode-languageserver';

export namespace CommonUtils {

    export const SHARED_NAMESPACE_NAME = 'common';
    export function normalizeURI(uri: string) {
        // return uri.toLowerCase();
        return uri;
    }

    export function getNamespaceFromURI(uri: string): string {
        // TODO: CRITICAL add functionally to get this token from configuration passed by client
        // getWorkspaceInformation() but for server
        const sourceCodeLocation = 'src/Domain/components/';
        const componentDelimiter = '/'
        const pos = uri.lastIndexOf(sourceCodeLocation);
        let result;
        if(pos === -1) {
            // component shares this namespace
            result = SHARED_NAMESPACE_NAME;
        } else {
            const componentPath = uri.substr(pos + sourceCodeLocation.length, uri.length - pos);
            result = componentPath.substr(0, componentPath.indexOf(componentDelimiter));
        }
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

    export function position(position: Position) {
        return LSP.Position.create(position.row, position.col);
    }

    export function getProcedureTruncatedName(fullName: string): string {
        const takeNumChars = fullName
            .indexOf('(') === -1 ? fullName.length : fullName.indexOf('(');
        let truncatedName = fullName.substr(0, takeNumChars);
        return truncatedName;
    }

    export  function extractComponentNameFromUrl(sourceUri: string, namespaces?: string[]): string {
        // we are in common file, need to look for namespace
        let getComponentName = (uri: string): string => {
            const identificationToken = 'common/services';
            let servicePart = uri.substring(
                uri.lastIndexOf(identificationToken) + identificationToken.length + 1);
            var lastIndex = servicePart.search(/[^0-9A-Za-z]+/);
            let result = servicePart.substring(0, lastIndex);
            return result;
        };
        let componentName = getComponentName(sourceUri);
        if(!namespaces) {
            console.log('extractComponentNameFromUrl. Skipping namespace validation (namespace might be not from subset)')
            return componentName;
        }
        let targetNamespace = namespaces.find(namespace => namespace?.includes(componentName))
        if (!targetNamespace) {
            return CommonUtils.SHARED_NAMESPACE_NAME;
        }
        return targetNamespace;
    }

    export function parserTypeToLSPType(type: DeclarationType): LSP.SymbolKind {
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
