import { BellaVisitor } from "../grammars/.antlr4/BellaVisitor";
import {
    ComponentServiceDeclarationContext,
    SimpleObjectDeclarationContext,
    CompositeObjectDeclarationContext,
    ObjectFieldDeclarationContext,
    TypeContext,
    EnumDeclarationContext,
    EnumBodyContext} from "../grammars/.antlr4/BellaParser"
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { BaseDeclaration} from "./models/base-declaration";
import { ComponentServiceDeclaration } from "./models/component-service-declaration";
import { SimpleObjectDeclaration, CompositeObjectDeclaration, BaseObject } from "./models/object-declaration";
import { TypeDeclaration } from "./models/type-declaration";
import { DeclarationType } from "./models/declaration-type.enum";
import { ObjectBase } from "./models/object-base.enum";
import { EnumDeclaration } from "./models/enum-declaration";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";

//TODO: fix any visitor result
export class BellaDeclarationVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BaseDeclaration> {
    protected defaultResult() {
        this.declarations;
    }

    // top level declarations
    public declarations: BaseDeclaration[] = [];

    visitSimpleObjectDeclaration(context: SimpleObjectDeclarationContext): SimpleObjectDeclaration{
        let name = context.Identifier().text;
        let line = context.start.line - 1;
        let returnTypeDeclaration = this.visitTypeLocal(context.type());
        let sod: SimpleObjectDeclaration = {
            name,
            range: BellaVisitorUtils.createRange(line, 0, line),
            type: DeclarationType.Object,
            returnType: this.visitTypeLocal(context.type()),
            objectBase: ObjectBase.Alias
        };
        this.declarations.push(sod);
        return sod;
    }


    visitCompositeObjectDeclaration(context: CompositeObjectDeclarationContext): CompositeObjectDeclaration {
        let name = context.Identifier().text;
        let startLine = context.start.line - 1;
        let endLine = (context.stop?.line || startLine + 1 ) - 1;
        let body = context.objectBody();
        let fields = body.children?.map(c => this.visitObjectFieldDeclarationLocal(c as ObjectFieldDeclarationContext)) || [];
        let sod: CompositeObjectDeclaration = {
            name,
            range: BellaVisitorUtils.createRange(startLine, 0, endLine),
            type: DeclarationType.Object,
            objectBase: ObjectBase.Composite,
            fields
        };
        this.declarations.push(sod);
        return sod;
    }

    visitEnumDeclaration(context: EnumDeclarationContext): BaseDeclaration {
        let name = context.Identifier().text
        let startLine = context.start.line - 1;
        let endLine = (context.stop?.line || startLine + 1 ) - 1;
        let body = context.enumBody();
        // let fields = body.children?.map(c => this.visitObjectFieldDeclaration(c as ObjectFieldDeclarationContext)) || [];
        let sod: EnumDeclaration = {
            name,
            range: BellaVisitorUtils.createRange(startLine, 0, endLine),
            type: DeclarationType.Object,
            //TODO: add parsing of enum entries
            enumEntries: this.visitEnumBodyLocal(body)
        };
        this.declarations.push(sod);
        return sod;
    }

    visitComponentServiceDeclaration(context: ComponentServiceDeclarationContext): BaseDeclaration{
        let serviceName = context.Identifier().text;
        let line = context.start.line - 1;
        let csd: ComponentServiceDeclaration = {
            serviceType: context.HOSTED().text,
            serviceName: serviceName,
            serviceTransportName: context.enclosedServiceIdentifier().text,
            name: serviceName,
            range: BellaVisitorUtils.createRange(line, 0, line),
            type: DeclarationType.ComponentService
        }
        this.declarations.push(csd);
        return csd;
    }

    // top level declarations (END)

    // local declarations
    visitObjectFieldDeclarationLocal(context: ObjectFieldDeclarationContext): SimpleObjectDeclaration {
        let name = context.Identifier().text;
        let line = context.start.line - 1;
        let returnType = context.type();
        let sod: SimpleObjectDeclaration = {
            name,
            range: BellaVisitorUtils.createRange(line, 0, line, context.start.charPositionInLine + context.text.length),
            type: DeclarationType.Object,
            objectBase: ObjectBase.Field,
            returnType: this.visitTypeLocal(context.type())
        };
        // this.declarations.push(sod);
        return sod;
    }

    visitTypeLocal(context: TypeContext): TypeDeclaration {
        let line = context.start.line - 1;

        let endCol = context.start.charPositionInLine + context.text.length
        let td: TypeDeclaration = {
            name: context.text,
            range: BellaVisitorUtils.createRange(
                line,
                context.start.charPositionInLine,
                line,
                endCol
            ),
            type: DeclarationType.Type,
            objectBase: BellaVisitorUtils.getCollectionTypeFromContext(context),
            fullQualifier: context.text
        };
        return td;
    }

    visitEnumBodyLocal(context: EnumBodyContext): BaseDeclaration[] {
        let res = context.Identifier().map((enumEntry: TerminalNode): BaseDeclaration => {
            let startLine = enumEntry.symbol.line - 1;
            return {
                name: enumEntry.text,
                type: DeclarationType.EnumEntry,
                range: BellaVisitorUtils.createRange(startLine, 0, startLine)
            }
        });
        return res;
    }
}

namespace BellaVisitorUtils {
    export function getCollectionTypeFromContext(context: TypeContext): ObjectBase {
        if(!!context.collectionDeclaration()) {
            return ObjectBase.Collection;
        }
        if(!!context.primitiveType()) {
            return ObjectBase.PrimitiveType;
        }
        return ObjectBase.Alias;
    }

    export function createRange(x1: number, x2: number, y1: number, y2: number = Number.MAX_SAFE_INTEGER) {
        return {
            startPosition: {row: x1, col: x2}, endPosition: {row: y1, col: y2}
        };
    }
}
