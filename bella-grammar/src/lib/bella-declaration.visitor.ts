import { BellaVisitor } from "../grammars/.antlr4/BellaVisitor";
import {
    ComponentServiceDeclarationContext,
    SimpleObjectDeclarationContext,
    CompositeObjectDeclarationContext,
    ObjectFieldDeclarationContext,
    TypeContext,
    EnumDeclarationContext,
    EnumBodyContext,
    ServiceDeclarationContext,
    ServiceBodyContext,
    ProcedureDeclarationContext,
    ServiceDeclarationEntryContext,
    SettingsDeclarationContext,
    ProcedureParamListContext,
    ProcedureParamContext,
    FormulaDeclarationContext,
    ProcedureBodyContext,
    BellaParser,
    StatementContext} from "../grammars/.antlr4/BellaParser"
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { BaseDeclaration} from "./models/base-declaration";
import { ComponentServiceDeclaration } from "./models/component-service-declaration";
import { SimpleObjectDeclaration, CompositeObjectDeclaration, BaseObject } from "./models/object-declaration";
import { TypeDeclaration } from "./models/type-declaration";
import { DeclarationType } from "./models/declaration-type.enum";
import { ObjectBase } from "./models/object-base.enum";
import { EnumDeclaration } from "./models/enum-declaration";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ServiceDeclaration } from "./models/service-declaration";
import { ProcedureDeclaration } from "./models/procedure-declaration";
import { FormulaDeclaration } from "./models/formula-declaration";
import { BellaReference } from "./models/bella-reference";
import { BellaVisitorUtils } from "./visitor.utils";

//TODO: fix any visitor result
export class BellaDeclarationVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BaseDeclaration> {
    protected defaultResult() {
        this.declarations;
    }

    // top level declarations
    public declarations: BaseDeclaration[] = [];
    // public references: BellaReference[] = [];

    visitSimpleObjectDeclaration(context: SimpleObjectDeclarationContext): SimpleObjectDeclaration{
        let type = DeclarationType.Object;
        if(!!context.OBJECT_MODIFIER()) {
            type = DeclarationType.PersistentObject;
        }
        let name = context.Identifier().text;
        let line = context.start.line - 1;
        let returnTypeDeclaration;
        let ctxType = context.type();
        if(!!ctxType){
            returnTypeDeclaration = this.visitTypeLocal(ctxType);
        }
        let sod: SimpleObjectDeclaration = {
            name,
            range: BellaVisitorUtils.createRange(line, 0, line),
            type,
            returnType: returnTypeDeclaration,
            objectBase: ObjectBase.Alias
        };
        this.declarations.push(sod);
        return sod;
    }


    visitCompositeObjectDeclaration(context: CompositeObjectDeclarationContext): CompositeObjectDeclaration {
        let name = context.Identifier().text;
        let type = DeclarationType.Object;
        if(!!context.OBJECT_MODIFIER()) {
            type = DeclarationType.PersistentObject;
        }
        let startLine = context.start.line - 1;
        let endLine = (context.stop?.line || startLine + 1 ) - 1;
        let body = context.objectBody();
        let members = body.children?.map(c => this.visitObjectFieldDeclarationLocal(c as ObjectFieldDeclarationContext)) || [];
        let sod: CompositeObjectDeclaration = {
            name,
            range: BellaVisitorUtils.createRange(startLine, 0, endLine),
            type,
            objectBase: ObjectBase.Composite,
            members
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
            type: DeclarationType.Enum,
            members: this.visitEnumBodyLocal(body)
        };
        this.declarations.push(sod);
        return sod;
    }

    visitComponentServiceDeclaration(context: ComponentServiceDeclarationContext): BaseDeclaration{
        let serviceName = context.Identifier().text;
        let line = context.start.line - 1;
        let csd: BaseDeclaration = {
            // serviceType: context.HOSTED().text,
            // serviceName: serviceName,
            // serviceTransportName: context.enclosedServiceIdentifier().text,
            name: serviceName,
            range: BellaVisitorUtils.createRange(line, 0, line),
            type: DeclarationType.ComponentService
        }
        this.declarations.push(csd);
        return csd;
    }

    visitServiceDeclaration(context: ServiceDeclarationContext): BaseDeclaration {
        let serviceName = context.servicePrefix().Identifier().text;
        let startLine = context.start.line - 1;
        let endLine = (context.stop?.line || (startLine + 1)) - 1;
        let sd: ServiceDeclaration = {
            name: serviceName,
            range: BellaVisitorUtils.createRange(startLine, 0, endLine),
            type: DeclarationType.Service,
            members: this.visitServiceBodyLocal(context.serviceBody())
        };
        this.declarations.push(sd);
        return sd;
    }

    visitSettingsDeclaration(context: SettingsDeclarationContext): BaseDeclaration {
        let fieldDeclaration = this.visitObjectFieldDeclarationLocal(context.objectFieldDeclaration());
        fieldDeclaration.type = DeclarationType.Setting;
        this.declarations.push(fieldDeclaration);
        return fieldDeclaration;
    }

    visitProcedureDeclaration(context: ProcedureDeclarationContext): BaseDeclaration {
        let signature = context.generalSignature().text.replace("out", "out ");
        let startLine = context.start.line - 1;
        let endLine = (context.stop?.line || (startLine + 1)) - 1;
        // let calls = this.visitProcedureBodyLocal(context.procedureBody());
        let pd: ProcedureDeclaration = {
            name: signature,
            range: BellaVisitorUtils.createRange(startLine, 0, endLine),
            type: DeclarationType.Procedure,
            members: this.visitProcedureParamListLocal(context.generalSignature().procedureParamList())
        };
        this.declarations.push(pd);
        return pd;
    }

    visitFormulaDeclaration(context: FormulaDeclarationContext): BaseDeclaration {
        let signature = context.formulaSignature().text;
        let startLine = context.start.line - 1;
        let endLine = (context.stop?.line || (startLine + 1)) - 1;
        let fd: FormulaDeclaration = {
            name: signature,
            range: BellaVisitorUtils.createRange(startLine, 0, endLine),
            type: DeclarationType.Formula,
            members: this.visitProcedureParamListLocal(context
                .formulaSignature()
                .generalSignature()
                .procedureParamList())
        };
        this.declarations.push(fd);
        return fd;
    }

    // this is not invoked when there is already top level parser rule invoked
    visitStatement(context: StatementContext): BaseDeclaration{
        let fd: FormulaDeclaration = {
            name: 'Expression',
            range: BellaVisitorUtils.createRange(0, 0, 0),
            type: DeclarationType.Object
        };
        const identifierTokenNumber = BellaParser.Identifier;
        let filtered = context.getTokens(identifierTokenNumber).filter((t: TerminalNode) => t.text);
        return fd;
    }


    // top level declarations (END)

    // local declarations
    visitObjectFieldDeclarationLocal(context: ObjectFieldDeclarationContext): SimpleObjectDeclaration {
        let name = context.Identifier()?.text || context.PrimitiveType()?.text || context.Error()?.text;
        if(!name) {
            throw new Error("visitObjectFieldDeclarationLocal: unknown token");
        }
        let line = context.start.line - 1;
        let sod: SimpleObjectDeclaration = {
            name,
            range: BellaVisitorUtils.createRange(line, 0, line, context.start.charPositionInLine + context.text.length),
            type: DeclarationType.ObjectField,
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
                range: BellaVisitorUtils.createRange(
                    startLine,
                    enumEntry.symbol.charPositionInLine,
                    startLine
                )
            }
        });
        return res;
    }

    visitServiceBodyLocal(context: ServiceBodyContext): BaseDeclaration[] {
        let res = context.serviceDeclarationEntry().map((ctx: ServiceDeclarationEntryContext): BaseDeclaration => {
            let startLine = ctx.start.line - 1;
            return {
                name: ctx.Identifier().text,
                type: DeclarationType.ServiceEntry,
                range: BellaVisitorUtils.createRange(startLine, ctx.start.charPositionInLine, startLine)
            }
        });
        return res;
    }

    visitProcedureParamListLocal(context: ProcedureParamListContext | undefined) :BaseDeclaration[] {
        if(!context) {
            return [];
        }
        let res = context.procedureParam().map((ctx: ProcedureParamContext): BaseDeclaration => {
            let startLine = ctx.start.line - 1;
            // let nameContext = ctx.Identifier()[0];
            let nameContext = ctx.type();
            // let nameStart = nameContext.symbol.charPositionInLine;
            let nameStart = nameContext.start.charPositionInLine;
            return {
                name: nameContext.text,
                type: DeclarationType.Param,
                range: BellaVisitorUtils.createRange(
                    startLine,
                    nameStart,
                    startLine,
                    nameStart + nameContext.text.length
                    )
            }
        });
        return res;
    }

    // visitProcedureBodyLocal(context: ProcedureBodyContext): BaseDeclaration[] {
    //     // TODO: major - get this on the fly
    //     // TODO: major - add complete bella grammar to get all real identifiers separate from keywords
    //     const identifierTokenNumber = BellaParser.Identifier;
    //     let filtered = context.getTokens(identifierTokenNumber).filter((t: TerminalNode) => t.text);
    //     return [];
    // }
}
