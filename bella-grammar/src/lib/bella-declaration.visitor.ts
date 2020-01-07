// ...
import { BellaVisitor } from "../grammars/.antlr4/BellaVisitor";
import {
    ComponentServiceDeclarationContext,
    SimpleObjectDeclarationContext,
    CompositeObjectDeclarationContext,
    ObjectFieldDeclarationContext} from "../grammars/.antlr4/BellaParser"
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { BaseDeclaration, DeclarationType, ObjectBase } from "./models/base-declaration";
import { ComponentServiceDeclaration } from "./models/component-service-declaration";
import { SimpleObjectDeclaration, CompositeObjectDeclaration } from "./models/object-declaration";

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
        let sod: SimpleObjectDeclaration = {
            name,
            range: {
                startPosition: {row: line, col: 0}, endPosition: {row: line, col: Number.MAX_SAFE_INTEGER}
            },
            type: DeclarationType.Object,
            objectBase: ObjectBase.Alias
        };
        this.declarations.push(sod);
        return sod;
    }


    visitCompositeObjectDeclaration(context: CompositeObjectDeclarationContext): CompositeObjectDeclaration {
        let name = context.Identifier().text;
        let line = context.start.line - 1;
        let body = context.objectBody();
        let fields = body.children?.map(c => this.visitObjectFieldDeclaration(c as ObjectFieldDeclarationContext)) || [];
        // let firstChildren = body.tryGetChild(0, ObjectFieldDeclarationContext);
        // if(firstChildren){
        //     let SimpleObjectDeclaration = this.visitObjectFieldDeclaration(firstChildren);
        // }
        let sod: CompositeObjectDeclaration = {
            name,
            range: {
                startPosition: {row: line, col: 0}, endPosition: {row: line, col: Number.MAX_SAFE_INTEGER}
            },
            type: DeclarationType.Object,
            objectBase: ObjectBase.POCO,
            fields
        };
        this.declarations.push(sod);
        return sod;
    }

    visitObjectFieldDeclaration(context: ObjectFieldDeclarationContext): SimpleObjectDeclaration {
        let name = context.Identifier().text;
        let line = context.start.line - 1;
        let sod: SimpleObjectDeclaration = {
            name,
            range: {
                // TODO: MINOR fix this, this is not completely correct,
                // because object field declaration could contain expression
                startPosition: {row: line, col: 0}, endPosition: {row: line, col: Number.MAX_SAFE_INTEGER}
            },
            type: DeclarationType.Object,
            // TODO: MAJOR fix this, need to calculate real object base
            objectBase: ObjectBase.Alias
        };
        // this.declarations.push(sod);
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
            range: {
                startPosition: {row: line, col: 0}, endPosition: {row: line, col: Number.MAX_SAFE_INTEGER}
            },
            type: DeclarationType.ComponentService
        }
        this.declarations.push(csd);
        return csd;
    }
}
