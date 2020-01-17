import { BaseDeclaration, BellaReference } from "bella-grammar";
import { SymbolInformation, LocationLink, Location } from "vscode-languageserver";
import { CommonUtils } from "../utils/common.utils";
import { LocatedBellaReference } from "../utils/reference-registry.utils";

export namespace ReferenceFactoryMethods {
    export function createLSPLocationLink(symbol: SymbolInformation, ref: BellaReference): LocationLink {
        return {
            targetUri: symbol.location.uri,
            targetSelectionRange: symbol.location.range,
            targetRange: symbol.location.range,
            originSelectionRange: CommonUtils.range(ref.range)
        };
    }

    export function toLSPLocations(refs: LocatedBellaReference[]): Location[] {
        let locations = refs.map(r => createLSPLocation(r));
        return locations;
    }

    export function createLSPLocation(ref: LocatedBellaReference): Location {
        return {
            range: CommonUtils.range(ref.range),
            uri: ref.uri
        };
    }
}
