import { BaseDeclaration, BellaReference } from "bella-grammar";
import { SymbolInformation, LocationLink } from "vscode-languageserver";
import { CommonUtils } from "../utils/common.utils";

export namespace ReferenceFactoryMethods {
    export function createLSPLocationLink(symbol: SymbolInformation, ref: BellaReference): LocationLink {
        return {
            targetUri: symbol.location.uri,
            targetSelectionRange: symbol.location.range,
            targetRange: symbol.location.range,
            originSelectionRange: CommonUtils.range(ref.range)
        };
    }
}
