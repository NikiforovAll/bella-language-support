import { BellaScope } from './models/bella-scope';

export class BellaScopeVisitor {

    public scopes: BellaScope[] = [];

    public visit(context: string): BellaScope[] {
        // let pattern = /(?=(?<!\bprocedure\b.*?)\s+(\w+\b))(?:[\s\S]*?)(?<matched>[^/]\s\1\b\s*\=|(?<stop>procedure|formula|generic|specific|object|setting|service|hosted|persistent|external))/g;
        // const matched = pattern.exec(context);
        return [];
    }
}

// export class BellaScopeVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BellaScope[]> {

//     public scopes: BellaScope[] = [];

//     protected defaultResult() {
//         return [];
//     }

//     private accumulateResult(scopes: BellaScope[]) {
//         this.scopes.push(...scopes);
//         return scopes;
//     }

//     visitProcedureDeclaration(context: ProcedureDeclarationContext): BellaScope[] {
//         const procedureScope: BellaScope = {
//             range: BellaVisitorUtils.createRange(
//                 context.start.line,
//                 context.start.charPositionInLine,
//                 context.stop?.line || context.start.line,
//                 context.stop?.charPositionInLine
//             ),
//             name: context.generalSignature().Identifier().text
//         }
//         return this.accumulateResult([procedureScope]);
//     }
// }
