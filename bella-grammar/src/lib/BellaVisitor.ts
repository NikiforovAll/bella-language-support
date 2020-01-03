// ...
import { BellaVisitor } from "../grammars/.antlr4/BellaVisitor";
import { ComponentServiceDeclarationContext } from "../grammars/.antlr4/BellaParser"
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";

interface ComponentServiceDeclaration {
    serviceName?: string |any;
    serviceTransportName: string;
    type: string;
}

//TODO: fix any visitor result
export class BellaDeclarationVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<any> {

    public services: ComponentServiceDeclaration[] = [];

    visitCompilationUnit?: ((ctx: import("../grammars/.antlr4/BellaParser").CompilationUnitContext) => any) | undefined;
    visitTypeDeclaration?: ((ctx: import("../grammars/.antlr4/BellaParser").TypeDeclarationContext) => any) | undefined;
    visitHosted?: ((ctx: import("../grammars/.antlr4/BellaParser").HostedContext) => any) | undefined;
    visitService?: ((ctx: import("../grammars/.antlr4/BellaParser").ServiceContext) => any) | undefined;
    visitOn?: ((ctx: import("../grammars/.antlr4/BellaParser").OnContext) => any) | undefined;
    visitObracket?: ((ctx: import("../grammars/.antlr4/BellaParser").ObracketContext) => any) | undefined;
    visitCbracket?: ((ctx: import("../grammars/.antlr4/BellaParser").CbracketContext) => any) | undefined;
    visitEnclosedServiceIdentifier?: ((ctx: import("../grammars/.antlr4/BellaParser").EnclosedServiceIdentifierContext) => any) | undefined;
    defaultResult() {
        return [];
    }

    visitComponentServiceDeclaration(context: ComponentServiceDeclarationContext): ComponentServiceDeclaration{
        let csd = {
            type: context.hosted().text,
            serviceName: context.Identifier().text,
            serviceTransportName: context.enclosedServiceIdentifier().text,
            startLineIndex: context.start.line
        }
        this.services.push(csd);
        return csd;
    }
}
