import { ObjectBase } from "./models/object-base.enum";
import { TypeContext } from "../grammars/.antlr4/BellaParser";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";

export
namespace BellaVisitorUtils {
    export function getCollectionTypeFromContext(context: TypeContext): ObjectBase {
        if(!!context.collectionDeclaration()) {
            return ObjectBase.Collection;
        }
        if(!!context.PrimitiveType()) {
            return ObjectBase.PrimitiveType;
        }
        return ObjectBase.Alias;
    }

    export function createRange(x1: number, x2: number, y1: number, y2: number = Number.MAX_SAFE_INTEGER) {
        return {
            startPosition: {row: x1, col: x2}, endPosition: {row: y1, col: y2}
        };
    }

    export function getRangeForTerminalNode(node: TerminalNode) {
        let line = node.symbol.line - 1;
        let start = node.symbol.charPositionInLine;
        let end = start + (node.symbol.text?.length || 0);
        return BellaVisitorUtils.createRange(line, start, line, end);
    }
}
