// ...
import { BellaVisitor } from "../grammars/.antlr4/BellaVisitor";
import { ComponentServiceDeclarationContext } from "../grammars/.antlr4/BellaParser"
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { BaseDeclaration, DeclarationType } from "./models/base-declaration";
import { ComponentServiceDeclaration } from "./models/component-service-declaration";


//TODO: fix any visitor result
export class BellaDeclarationVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<any> {

    public declarations: BaseDeclaration[] = [];

    visitCompilationUnit?: ((ctx: import("../grammars/.antlr4/BellaParser").CompilationUnitContext) => any) | undefined;
    visitTypeDeclaration?: ((ctx: import("../grammars/.antlr4/BellaParser").TypeDeclarationContext) => any) | undefined;
    visitEnclosedServiceIdentifier?: ((ctx: import("../grammars/.antlr4/BellaParser").EnclosedServiceIdentifierContext) => any) | undefined;
    defaultResult() {
        return [];
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
